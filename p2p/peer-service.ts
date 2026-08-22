import { createRequire } from "node:module";
import crypto from "crypto";
import fs from "fs";
import net from "net";
import path from "path";
import type Corestore from "corestore";
import type Hyperswarm from "hyperswarm";
import type Hyperbee from "hyperbee";
import type { Incident } from "@/domain/incident";
import { shortPeerId, type P2PDiagnostics, type PeerConnectionInfo } from "./diagnostics";
import { mergeIncidents } from "./merge";
import { createMessageDecoder, encodeMessage, type P2PHello, type P2PMessage } from "./messages";
import { p2pHostAdapter, p2pHostUrl } from "./host-client";

const NETWORK_TOPIC = crypto.createHash("sha256").update("rescuemesh-coordination-v1").digest();

const DEFAULT_PEER_URLS = [
  "http://127.0.0.1:43147",
  "http://127.0.0.1:43148",
  "http://127.0.0.1:43149",
];

type SwarmSocket = {
  write(data: Buffer): void;
  destroyed?: boolean;
  on(event: "data", cb: (chunk: Buffer) => void): void;
  on(event: string, cb: (...args: unknown[]) => void): void;
};

type PeerServiceGlobal = {
  __rescuemeshPeerService?: RescueMeshPeerService;
  __rescuemeshPeerServiceInit?: Promise<RescueMeshPeerService>;
};

function peerHttpUrls(): string[] {
  const raw = process.env.RESCUEMESH_PEER_URLS?.trim();
  if (!raw) return DEFAULT_PEER_URLS;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function meshListenPort(): number | null {
  const raw = process.env.RESCUEMESH_MESH_LISTEN?.trim();
  if (!raw) return null;
  const port = Number(raw);
  return Number.isInteger(port) && port > 0 ? port : null;
}

function meshPeerTargets(): { host: string; port: number; key: string }[] {
  const raw = process.env.RESCUEMESH_MESH_PEERS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((key) => {
      const [host, portRaw] = key.split(":");
      return { host, port: Number(portRaw), key };
    })
    .filter((target) => target.host && Number.isInteger(target.port) && target.port > 0);
}

class RescueMeshPeerService {
  private store: Corestore;
  private core: ReturnType<Corestore["get"]>;
  private bee: Hyperbee;
  private swarm: Hyperswarm;
  private storagePath: string;
  private publicKey = "";
  private swarmPublicKey = "";
  private peerId = "";
  private coreKey = "";
  private peers = new Map<string, PeerConnectionInfo>();
  private started = false;
  private directSockets = new Set<SwarmSocket>();
  private meshConnected = new Set<string>();
  private meshPending = new Set<string>();

  private constructor(
    storagePath: string,
    CorestoreCtor: typeof import("corestore").default,
    HyperswarmCtor: typeof import("hyperswarm").default,
    HyperbeeCtor: typeof import("hyperbee").default,
  ) {
    this.storagePath = storagePath;
    fs.mkdirSync(storagePath, { recursive: true });
    this.store = new CorestoreCtor(storagePath);
    this.core = this.store.get({ name: "incidents" });
    this.bee = new HyperbeeCtor(this.core, {
      keyEncoding: "utf-8",
      valueEncoding: "json",
    });
    this.swarm = new HyperswarmCtor();
  }

  static async create(storagePath: string): Promise<RescueMeshPeerService> {
    const loaderPath = path.join(process.cwd(), "p2p", "load-pear.cjs");
    const pear = createRequire(loaderPath)(loaderPath) as {
      Corestore: typeof import("corestore").default;
      Hyperswarm: typeof import("hyperswarm").default;
      Hyperbee: typeof import("hyperbee").default;
    };
    const service = new RescueMeshPeerService(
      storagePath,
      pear.Corestore,
      pear.Hyperswarm,
      pear.Hyperbee,
    );
    await service.init();
    return service;
  }

  private async init() {
    await this.bee.ready();
    this.publicKey = this.core.key.toString("hex");
    this.swarmPublicKey = this.swarm.keyPair.publicKey.toString("hex");
    this.coreKey = this.publicKey;
    this.peerId = shortPeerId(this.publicKey);

    this.swarm.on("connection", (socket: SwarmSocket) => {
      this.wireSocket(socket);
    });

    this.swarm.join(NETWORK_TOPIC, { server: true, client: true });
    void this.swarm.flush().catch((error) => {
      console.error("[p2p] swarm flush", error);
    });
    this.started = true;
    this.startDirectMesh();
    this.startLocalIntroduction();
  }

  private wireSocket(socket: SwarmSocket, onGone?: () => void) {
    let remoteKey: string | null = null;
    let gone = false;
    const decode = createMessageDecoder((message: P2PMessage) => {
      if (message.type === "hello") {
        remoteKey = message.publicKey;
        this.handleHello(message, socket);
        return;
      }
      if (message.type === "upsert") {
        void this.ingestRemoteIncident(message.incident);
      }
    });

    const finish = () => {
      if (gone) return;
      gone = true;
      if (remoteKey) {
        const existing = this.peers.get(remoteKey);
        if (existing) {
          this.peers.set(remoteKey, { ...existing, status: "disconnected" });
        }
      }
      onGone?.();
    };

    socket.on("data", decode);
    socket.on("close", finish);
    socket.on("error", finish);

    const hello: P2PHello = {
      type: "hello",
      peerId: this.peerId,
      publicKey: this.publicKey,
      coreKey: this.coreKey,
    };
    this.safeWrite(socket, encodeMessage(hello));
  }

  /**
   * Mesh TCP explícito para Docker Compose (DNS interno).
   * No es un backend central: cada peer habla con sus vecinos.
   */
  private startDirectMesh() {
    const listen = meshListenPort();
    if (listen) {
      const server = net.createServer((socket) => {
        socket.setKeepAlive(true);
        this.directSockets.add(socket);
        this.wireSocket(socket, () => {
          this.directSockets.delete(socket);
        });
      });
      server.on("error", (error) => {
        console.error("[p2p] mesh listen failed", error);
      });
      server.listen(listen, "0.0.0.0");
    }

    const targets = meshPeerTargets();
    if (targets.length === 0) return;

    const tick = () => {
      for (const target of targets) {
        this.connectMeshPeer(target);
      }
    };
    tick();
    setInterval(tick, 3000);
  }

  private connectMeshPeer(target: { host: string; port: number; key: string }) {
    if (this.meshConnected.has(target.key) || this.meshPending.has(target.key)) return;

    this.meshPending.add(target.key);
    const socket = net.connect({ host: target.host, port: target.port });
    socket.setKeepAlive(true);

    socket.on("connect", () => {
      this.meshPending.delete(target.key);
      this.meshConnected.add(target.key);
      this.directSockets.add(socket);
      this.wireSocket(socket, () => {
        this.directSockets.delete(socket);
        this.meshConnected.delete(target.key);
      });
    });

    socket.on("error", () => {
      this.meshPending.delete(target.key);
      socket.destroy();
    });
  }

  /** Presenta peers locales (misma laptop o red Compose). No es un backend central. */
  private startLocalIntroduction() {
    const tick = async () => {
      if (this.getConnectedCount() > 0) return;
      for (const base of peerHttpUrls()) {
        try {
          const response = await fetch(`${base}/api/p2p/status`, {
            signal: AbortSignal.timeout(800),
          });
          if (!response.ok) continue;
          const status = (await response.json()) as { swarmPublicKey?: string };
          if (!status.swarmPublicKey || status.swarmPublicKey === this.swarmPublicKey) continue;
          this.introducePeer(status.swarmPublicKey);
        } catch {
          // El otro proceso aún no escucha.
        }
      }
    };

    void tick();
    setInterval(() => {
      void tick();
    }, 3000);
  }

  private safeWrite(socket: SwarmSocket, payload: Buffer) {
    if (socket.destroyed) return;
    try {
      socket.write(payload);
    } catch (error) {
      console.error("[p2p] write failed", error);
    }
  }

  private handleHello(message: P2PHello, socket: SwarmSocket) {
    this.peers.set(message.publicKey, {
      peerId: message.peerId,
      publicKey: message.publicKey,
      status: socket.destroyed ? "disconnected" : "connected",
    });
    void this.replayLocalIncidents();
  }

  private async replayLocalIncidents() {
    if (this.getConnectedCount() === 0) return;
    const local = await this.readBee();
    for (const incident of local) {
      this.broadcast({
        type: "upsert",
        incident: { ...incident, syncStatus: "synced" },
      });
    }
  }

  private async ingestRemoteIncident(incident: Incident) {
    const current = await this.bee.get(incident.id);
    const merged = mergeIncidents(
      current?.value as Incident | undefined,
      { ...incident, syncStatus: "synced" },
    );
    await this.bee.put(merged.id, merged);
    await this.core.update();
  }

  async upsertIncident(incident: Incident): Promise<Incident> {
    const connected = this.getConnectedCount() > 0;
    const next: Incident = {
      ...incident,
      syncStatus: connected ? "synced" : "pending",
    };
    await this.bee.put(next.id, next);
    await this.core.update();
    this.broadcast({ type: "upsert", incident: next });
    return next;
  }

  private broadcast(message: P2PMessage) {
    const payload = encodeMessage(message);
    for (const connection of this.swarm.connections) {
      this.safeWrite(connection, payload);
    }
    for (const socket of this.directSockets) {
      this.safeWrite(socket, payload);
    }
  }

  private async readBee(): Promise<Incident[]> {
    const incidents: Incident[] = [];
    for await (const entry of this.bee.createReadStream()) {
      if (entry.value) incidents.push(entry.value as Incident);
    }
    return incidents;
  }

  async listIncidents(): Promise<Incident[]> {
    return this.readBee();
  }

  introducePeer(swarmPublicKeyHex: string) {
    const key = Buffer.from(swarmPublicKeyHex.trim(), "hex");
    if (key.length !== 32) {
      throw new Error("swarmPublicKey debe ser 32 bytes hex.");
    }
    this.swarm.joinPeer(key);
  }

  getConnectedCount(): number {
    let direct = 0;
    for (const socket of this.directSockets) {
      if (!socket.destroyed) direct += 1;
    }
    return this.swarm.connections.size + direct;
  }

  getDiagnostics(): P2PDiagnostics {
    const connectedPeers = [...this.peers.values()].filter(
      (peer) => peer.status === "connected",
    );
    const connectedCount = this.getConnectedCount();

    return {
      peerId: this.peerId,
      publicKey: this.publicKey,
      swarmPublicKey: this.swarmPublicKey,
      coreKey: this.coreKey,
      instanceLabel: process.env.RESCUEMESH_INSTANCE_LABEL?.trim() || "Peer",
      connectedPeers,
      connectedCount,
      isolated: connectedCount === 0,
      storagePath: this.storagePath,
    };
  }

  isStarted() {
    return this.started;
  }
}

function getStoragePath(): string {
  const configured = process.env.RESCUEMESH_P2P_STORAGE?.trim();
  if (configured) return path.resolve(configured);
  return path.resolve(process.cwd(), ".p2p-data");
}

export async function getPeerService(): Promise<RescueMeshPeerService | typeof p2pHostAdapter> {
  if (p2pHostUrl()) {
    return p2pHostAdapter;
  }

  const globalScope = globalThis as PeerServiceGlobal;
  if (globalScope.__rescuemeshPeerService) {
    return globalScope.__rescuemeshPeerService;
  }

  if (!globalScope.__rescuemeshPeerServiceInit) {
    globalScope.__rescuemeshPeerServiceInit = RescueMeshPeerService.create(getStoragePath()).then(
      (service) => {
        globalScope.__rescuemeshPeerService = service;
        return service;
      },
      (error) => {
        globalScope.__rescuemeshPeerServiceInit = undefined;
        throw error;
      },
    );
  }

  return globalScope.__rescuemeshPeerServiceInit;
}

export type { P2PDiagnostics, PeerConnectionInfo };
