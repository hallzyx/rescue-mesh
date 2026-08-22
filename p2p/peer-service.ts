import crypto from "crypto";
import fs from "fs";
import path from "path";
import Corestore from "corestore";
import Hyperswarm from "hyperswarm";
import Hyperbee from "hyperbee";
import type { Incident } from "@/domain/incident";
import { shortPeerId, type P2PDiagnostics, type PeerConnectionInfo } from "./diagnostics";
import { mergeIncidentLists } from "./merge";
import { createMessageDecoder, encodeMessage, type P2PHello, type P2PMessage } from "./messages";

const NETWORK_TOPIC = crypto.createHash("sha256").update("rescuemesh-coordination-v1").digest();

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
  private remoteCoreKeys = new Set<string>();
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

    this.swarm.on("connection", (socket) => {
      this.store.replicate(socket);

      const onMessage = (message: P2PMessage) => {
        if (message.type === "hello") {
          this.handleHello(message, socket);
          return;
        }
        if (message.type === "upsert") {
          void this.ingestRemoteIncident(message.incident);
        }
      };

      const decode = createMessageDecoder(onMessage);
      socket.on("data", decode);

      const hello: P2PHello = {
        type: "hello",
        peerId: this.peerId,
        publicKey: this.publicKey,
        coreKey: this.coreKey,
      };
      socket.write(encodeMessage(hello));
    });

    this.swarm.join(NETWORK_TOPIC, { server: true, client: true });
    await this.swarm.flush();
    this.started = true;
  }

  private handleHello(message: P2PHello, socket: { destroyed?: boolean }) {
    this.remoteCoreKeys.add(message.coreKey);
    this.peers.set(message.publicKey, {
      peerId: message.peerId,
      publicKey: message.publicKey,
      status: socket.destroyed ? "disconnected" : "connected",
    });
    void this.replayLocalIncidents();
  }

  private async replayLocalIncidents() {
    if (this.getConnectedCount() === 0) return;
    const local = await this.readBee(this.bee);
    for (const incident of local) {
      this.broadcast({
        type: "upsert",
        incident: { ...incident, syncStatus: "synced" },
      });
    }
  }

  private async ingestRemoteIncident(incident: Incident) {
    const current = await this.bee.get(incident.id);
    const merged = current?.value
      ? mergeIncidentLists([current.value as Incident], [incident])[0]
      : { ...incident, syncStatus: "synced" as const };
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
      connection.write(payload);
    }
  }

  private async readBee(bee: Hyperbee): Promise<Incident[]> {
    const incidents: Incident[] = [];
    for await (const entry of bee.createReadStream()) {
      if (entry.value) incidents.push(entry.value as Incident);
    }
    return incidents;
  }

  private async readRemoteIncidents(): Promise<Incident[]> {
    const lists: Incident[][] = [];

    for (const coreKeyHex of this.remoteCoreKeys) {
      if (coreKeyHex === this.coreKey) continue;
      try {
        const remoteCore = this.store.get({
          key: Buffer.from(coreKeyHex, "hex"),
        });
        await remoteCore.ready();
        if (remoteCore.length > 0) {
          await remoteCore.download({ start: 0, end: remoteCore.length }).done();
        }
        const remoteBee = new Hyperbee(remoteCore, {
          keyEncoding: "utf-8",
          valueEncoding: "json",
        });
        await remoteBee.ready();
        lists.push(await this.readBee(remoteBee));
      } catch (error) {
        console.error("[p2p] remote read failed", error);
      }
    }

    return mergeIncidentLists(...lists);
  }

  async listIncidents(): Promise<Incident[]> {
    const local = await this.readBee(this.bee);
    const remote = await this.readRemoteIncidents();
    return mergeIncidentLists(local, remote);
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
    );
  }

  return globalScope.__rescuemeshPeerServiceInit;
}

export type { P2PDiagnostics, PeerConnectionInfo };
