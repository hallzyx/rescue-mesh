"use strict";

/**
 * Host P2P fuera del bundler de Next. Misma laptop / Compose: cada contenedor
 * tiene el suyo. No es un backend central.
 */
const http = require("node:http");
const net = require("node:net");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { Corestore, Hyperswarm, Hyperbee } = require("./load-pear.cjs");

const NETWORK_TOPIC = crypto.createHash("sha256").update("rescuemesh-coordination-v1").digest();
const DEFAULT_PEER_URLS = [
  "http://127.0.0.1:43147",
  "http://127.0.0.1:43148",
  "http://127.0.0.1:43149",
];

function peerHttpUrls() {
  const raw = process.env.RESCUEMESH_PEER_URLS?.trim();
  if (!raw) return DEFAULT_PEER_URLS;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function meshListenPort() {
  const raw = process.env.RESCUEMESH_MESH_LISTEN?.trim();
  if (!raw) return null;
  const port = Number(raw);
  return Number.isInteger(port) && port > 0 ? port : null;
}

function meshPeerTargets() {
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

function storagePath() {
  const configured = process.env.RESCUEMESH_P2P_STORAGE?.trim();
  if (configured) return path.resolve(configured);
  return path.resolve(process.cwd(), ".p2p-data");
}

function shortPeerId(publicKey) {
  return publicKey.replace(/[^a-f0-9]/gi, "").slice(0, 6).toUpperCase() || "------";
}

function encodeMessage(message) {
  const body = Buffer.from(JSON.stringify(message), "utf8");
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}

function createMessageDecoder(onMessage) {
  let buffer = Buffer.alloc(0);
  return (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 4) {
      const length = buffer.readUInt32BE(0);
      if (length > 2_000_000) {
        buffer = Buffer.alloc(0);
        return;
      }
      if (buffer.length < 4 + length) return;
      const body = buffer.subarray(4, 4 + length);
      buffer = buffer.subarray(4 + length);
      try {
        onMessage(JSON.parse(body.toString("utf8")));
      } catch {
        // ignore malformed frames
      }
    }
  };
}

function mergeIncidents(current, incoming) {
  if (!current) return incoming;
  const rank = { local: 0, pending: 1, synced: 2 };
  const left = rank[current.syncStatus] ?? 0;
  const right = rank[incoming.syncStatus] ?? 0;
  const newer = new Date(incoming.createdAt).getTime() >= new Date(current.createdAt).getTime();
  return {
    ...current,
    ...incoming,
    syncStatus: left >= right ? current.syncStatus : incoming.syncStatus,
    createdAt: newer ? incoming.createdAt : current.createdAt,
  };
}

class PeerHost {
  constructor() {
    this.storagePath = storagePath();
    fs.mkdirSync(this.storagePath, { recursive: true });
    this.store = new Corestore(this.storagePath);
    this.core = this.store.get({ name: "incidents" });
    this.bee = new Hyperbee(this.core, { keyEncoding: "utf-8", valueEncoding: "json" });
    this.swarm = new Hyperswarm();
    this.peers = new Map();
    this.directSockets = new Set();
    this.meshConnected = new Set();
    this.meshPending = new Set();
    this.publicKey = "";
    this.swarmPublicKey = "";
    this.peerId = "";
    this.coreKey = "";
  }

  async start() {
    await this.bee.ready();
    this.publicKey = this.core.key.toString("hex");
    this.swarmPublicKey = this.swarm.keyPair.publicKey.toString("hex");
    this.coreKey = this.publicKey;
    this.peerId = shortPeerId(this.publicKey);

    this.swarm.on("connection", (socket) => this.wireSocket(socket));
    this.swarm.join(NETWORK_TOPIC, { server: true, client: true });
    this.startDirectMesh();
    this.startLocalIntroduction();
    void this.swarm.flush().catch((error) => {
      console.error("[p2p-host] swarm flush", error);
    });
  }

  wireSocket(socket, onGone) {
    let remoteKey = null;
    let gone = false;
    const decode = createMessageDecoder((message) => {
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
        if (existing) this.peers.set(remoteKey, { ...existing, status: "disconnected" });
      }
      onGone?.();
    };
    socket.on("data", decode);
    socket.on("close", finish);
    socket.on("error", finish);
    this.safeWrite(
      socket,
      encodeMessage({
        type: "hello",
        peerId: this.peerId,
        publicKey: this.publicKey,
        coreKey: this.coreKey,
      }),
    );
  }

  startDirectMesh() {
    const listen = meshListenPort();
    if (listen) {
      const server = net.createServer((socket) => {
        socket.setKeepAlive(true);
        this.directSockets.add(socket);
        this.wireSocket(socket, () => this.directSockets.delete(socket));
      });
      server.on("error", (error) => console.error("[p2p-host] mesh listen failed", error));
      server.listen(listen, "0.0.0.0");
    }

    const targets = meshPeerTargets();
    if (targets.length === 0) return;
    const tick = () => {
      for (const target of targets) this.connectMeshPeer(target);
    };
    tick();
    setInterval(tick, 3000);
  }

  connectMeshPeer(target) {
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

  startLocalIntroduction() {
    const tick = async () => {
      if (this.connectedCount() > 0) return;
      for (const base of peerHttpUrls()) {
        try {
          const response = await fetch(`${base}/api/p2p/status`, {
            signal: AbortSignal.timeout(800),
          });
          if (!response.ok) continue;
          const status = await response.json();
          if (!status.swarmPublicKey || status.swarmPublicKey === this.swarmPublicKey) continue;
          this.introducePeer(status.swarmPublicKey);
        } catch {
          // peer not up yet
        }
      }
    };
    void tick();
    setInterval(() => void tick(), 3000);
  }

  safeWrite(socket, payload) {
    if (socket.destroyed) return;
    try {
      socket.write(payload);
    } catch (error) {
      console.error("[p2p-host] write failed", error);
    }
  }

  handleHello(message, socket) {
    this.peers.set(message.publicKey, {
      peerId: message.peerId,
      publicKey: message.publicKey,
      status: socket.destroyed ? "disconnected" : "connected",
    });
    void this.replayLocalIncidents();
  }

  async replayLocalIncidents() {
    if (this.connectedCount() === 0) return;
    for (const incident of await this.readBee()) {
      this.broadcast({ type: "upsert", incident: { ...incident, syncStatus: "synced" } });
    }
  }

  async ingestRemoteIncident(incident) {
    const current = await this.bee.get(incident.id);
    const merged = mergeIncidents(current?.value, { ...incident, syncStatus: "synced" });
    await this.bee.put(merged.id, merged);
    await this.core.update();
  }

  async upsertIncident(incident) {
    const next = {
      ...incident,
      syncStatus: this.connectedCount() > 0 ? "synced" : "pending",
    };
    await this.bee.put(next.id, next);
    await this.core.update();
    this.broadcast({ type: "upsert", incident: next });
    return next;
  }

  broadcast(message) {
    const payload = encodeMessage(message);
    for (const connection of this.swarm.connections) this.safeWrite(connection, payload);
    for (const socket of this.directSockets) this.safeWrite(socket, payload);
  }

  async readBee() {
    const incidents = [];
    for await (const entry of this.bee.createReadStream()) {
      if (entry.value) incidents.push(entry.value);
    }
    return incidents;
  }

  introducePeer(swarmPublicKeyHex) {
    const key = Buffer.from(String(swarmPublicKeyHex).trim(), "hex");
    if (key.length !== 32) throw new Error("swarmPublicKey debe ser 32 bytes hex.");
    this.swarm.joinPeer(key);
  }

  connectedCount() {
    let direct = 0;
    for (const socket of this.directSockets) {
      if (!socket.destroyed) direct += 1;
    }
    return this.swarm.connections.size + direct;
  }

  diagnostics() {
    const connectedPeers = [...this.peers.values()];
    const connectedCount = this.connectedCount();
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
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function send(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(payload);
}

async function main() {
  const host = new PeerHost();
  await host.start();

  const port = Number(process.env.RESCUEMESH_P2P_HOST_PORT ?? 43700);
  const server = http.createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      response.end();
      return;
    }

    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    try {
      if (request.method === "GET" && url.pathname === "/status") {
        send(response, 200, host.diagnostics());
        return;
      }
      if (request.method === "GET" && url.pathname === "/incidents") {
        send(response, 200, { incidents: await host.readBee() });
        return;
      }
      if (request.method === "POST" && url.pathname === "/incidents") {
        const body = JSON.parse((await readBody(request)) || "{}");
        if (!body.incident?.id) {
          send(response, 400, { error: "incident es requerido." });
          return;
        }
        send(response, 200, { incident: await host.upsertIncident(body.incident) });
        return;
      }
      if (request.method === "POST" && url.pathname === "/introduce") {
        const body = JSON.parse((await readBody(request)) || "{}");
        if (!body.publicKey) {
          send(response, 400, { error: "publicKey (swarm) es requerido." });
          return;
        }
        host.introducePeer(body.publicKey);
        send(response, 200, { introduced: true, diagnostics: host.diagnostics() });
        return;
      }
      send(response, 404, { error: "not found" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "error";
      send(response, 500, { error: message });
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`[p2p-host] ${host.diagnostics().instanceLabel} ${host.peerId} on 127.0.0.1:${port}`);
  });
}

main().catch((error) => {
  console.error("[p2p-host] fatal", error);
  process.exit(1);
});
