import crypto from "crypto";
import fs from "fs";
import path from "path";
import Corestore from "corestore";
import Hyperswarm from "hyperswarm";
import Hyperbee from "hyperbee";
import type { Incident } from "@/domain/incident";
import { shortPeerId, type P2PDiagnostics, type PeerConnectionInfo } from "./diagnostics";
import { mergeIncidents } from "./merge";
import { createMessageDecoder, encodeMessage, type P2PHello, type P2PMessage } from "./messages";

const NETWORK_TOPIC = crypto.createHash("sha256").update("rescuemesh-coordination-v1").digest();

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

class RescueMeshPeerService {
  private store: Corestore;
  private core: ReturnType<Corestore["get"]>;
  private bee: Hyperbee;
  private swarm: Hyperswarm;
  private storagePath: string;
  private publicKey = "";
  private peerId = "";
  private coreKey = "";
  private peers = new Map<string, PeerConnectionInfo>();
  private started = false;

  private constructor(storagePath: string) {
    this.storagePath = storagePath;
    fs.mkdirSync(storagePath, { recursive: true });
    this.store = new Corestore(storagePath);
    this.core = this.store.get({ name: "incidents" });
    this.bee = new Hyperbee(this.core, {
      keyEncoding: "utf-8",
      valueEncoding: "json",
    });
    this.swarm = new Hyperswarm();
  }

  static async create(storagePath: string): Promise<RescueMeshPeerService> {
    const service = new RescueMeshPeerService(storagePath);
    await service.init();
    return service;
  }

  private async init() {
    await this.bee.ready();
    this.publicKey = this.core.key.toString("hex");
    this.coreKey = this.publicKey;
    this.peerId = shortPeerId(this.publicKey);

    this.swarm.on("connection", (socket: SwarmSocket) => {
      let remoteKey: string | null = null;
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

      socket.on("data", decode);
      socket.on("close", () => {
        if (!remoteKey) return;
        const existing = this.peers.get(remoteKey);
        if (existing) {
          this.peers.set(remoteKey, { ...existing, status: "disconnected" });
        }
      });
      socket.on("error", () => {
        if (!remoteKey) return;
        const existing = this.peers.get(remoteKey);
        if (existing) {
          this.peers.set(remoteKey, { ...existing, status: "disconnected" });
        }
      });

      const hello: P2PHello = {
        type: "hello",
        peerId: this.peerId,
        publicKey: this.publicKey,
        coreKey: this.coreKey,
      };
      this.safeWrite(socket, encodeMessage(hello));
    });

    this.swarm.join(NETWORK_TOPIC, { server: true, client: true });
    await this.swarm.flush();
    this.started = true;
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

  getConnectedCount(): number {
    return this.swarm.connections.size;
  }

  getDiagnostics(): P2PDiagnostics {
    const connectedPeers = [...this.peers.values()].filter(
      (peer) => peer.status === "connected",
    );
    const connectedCount = this.getConnectedCount();

    return {
      peerId: this.peerId,
      publicKey: this.publicKey,
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

export async function getPeerService(): Promise<RescueMeshPeerService> {
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
