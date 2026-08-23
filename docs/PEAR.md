# Pear

RescueMesh replicates incidents and status peer to peer with the Pear stack: Hyperswarm, Corestore, and Hyperbee. RescueMesh does not operate a central sync server.

## Quick path

1. Start Peer A and Peer B with **different** `RESCUEMESH_P2P_STORAGE` directories.
2. Open `/demo` and wait for `P2P CONNECTED ✓`.
3. Create an incident on A and confirm it appears on B without a manual refresh.

## What Pear does here

| Piece | Role |
| --- | --- |
| Hyperswarm | Discovery and connection |
| Corestore | Per-process append-only storage |
| Hyperbee | Indexed incident documents on that store |

Each process has its own Peer ID / public key. A shared store “so the demo works” is invalid evidence.

## Introduce and pull

On one laptop, `/demo` reads `/api/p2p/status` from A, B, and C. If swarm keys exist and `connectedCount` is still 0, it `POST`s `/api/p2p/introduce` with the other peer’s public key.

HTTP replica pull (`/api/p2p/incidents`) is a laptop convenience between loopback origins. It does not replace the mesh and it is not a RescueMesh backend.

## Diagnostics

Network UI must show runtime values:

- this node’s Peer ID;
- ONLINE / OFFLINE for `:43147`–`:43149` from a 1s HTTP probe;
- connected swarm peers;
- `External AI API: NONE`;
- `Central backend: NONE`.

If there are no peers, the panel shows `ISOLATED`. That is honest. Do not fixture `CONNECTED`.

## Kill-A proof

The Pears-track claim is: stop Peer A from the UI (process exit, not just closing the tab) and Peer B still shows the incident from `.p2p-data-b`.

If Pear is down, do not fake it. Record the QVAC-only fallback as a Local Crisis Intelligence Copilot. See [Operations](OPERATIONS.md).

## Compose mesh ports

Docker Compose sets `RESCUEMESH_MESH_LISTEN` and `RESCUEMESH_MESH_PEERS` so A/B/C connect over TCP on `127.0.0.1` (49737–49739) in addition to Hyperswarm.

## Related documents

- [Architecture](ARCHITECTURE.md)
- [Configuration](CONFIGURATION.md)
- [Operations](OPERATIONS.md)
- [Security](SECURITY.md)
