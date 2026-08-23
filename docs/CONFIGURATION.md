# Configuration

RescueMesh is configured with process environment variables. There is no required `.env` file for the local demo.

## Quick path

1. Give each demo peer its own `RESCUEMESH_NEXT_DIST` and `RESCUEMESH_P2P_STORAGE`.
2. Keep ports 43147, 43148, and 43149 for A, B, and C.
3. Do not point two processes at the same Corestore directory.

## Peer processes

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` / Next `--port` | 43147 | HTTP port for this process |
| `RESCUEMESH_INSTANCE_LABEL` | `Peer` | Citizen, Brigade, or Command Center |
| `RESCUEMESH_NEXT_DIST` | `.next` | Isolated Next dist dir so A/B/C do not share a cache |
| `RESCUEMESH_P2P_STORAGE` | process-local default | Corestore / Hyperbee directory |

Canonical local demo values:

| Peer | Port | Dist | Storage | Label |
| --- | ---: | --- | --- | --- |
| A | 43147 | `.next-a` | `.p2p-data-a` | Citizen |
| B | 43148 | `.next-b` | `.p2p-data-b` | Brigade |
| C | 43149 | `.next-c` | `.p2p-data-c` | Command Center |

## Mesh

| Variable | Purpose |
| --- | --- |
| `RESCUEMESH_PEER_URLS` | Comma-separated HTTP origins for introduce / replica pull (Compose) |
| `RESCUEMESH_MESH_LISTEN` | Explicit TCP listen port for Docker mesh |
| `RESCUEMESH_MESH_PEERS` | `host:port` list of the other peers |
| `RESCUEMESH_P2P_HOST` | Optional separate P2P host URL |
| `RESCUEMESH_P2P_HOST_PORT` | Optional P2P host listen port (Compose uses 43700–43702) |

Local `next dev` on one laptop usually does not need the mesh TCP variables. Hyperswarm discovery plus `/demo` introduce is enough. Compose sets the mesh variables so containers can find each other on `127.0.0.1`.

## Tests

| Variable | Default | Purpose |
| --- | --- | --- |
| `RESCUEMESH_URL` | `http://127.0.0.1:43147` | Peer A base URL |
| `RESCUEMESH_PEER_B_URL` | `http://127.0.0.1:43148` | Peer B base URL |
| `RESCUEMESH_PORT` | `43147` | Playwright webServer port |
| `RESCUEMESH_START_CMD` | `npm run dev` | Command Playwright starts if A is down |
| `CI` | unset | Extra Playwright retries |

## CORS and origins

Allowed browser origins are loopback on 43147–43149 (`lib/cors.ts`). `next.config.ts` also lists those origins in `allowedDevOrigins`.

Do not add a production public origin unless you also redesign the demo kill-switch. Start/stop must stay loopback-only.

## QVAC

There is no API key to configure. `@qvac/sdk` is loaded from `node_modules` when present. Absence of the SDK is valid: the local engine still runs and `externalApi` remains `false`.

## Related documents

- [Getting started](GETTING_STARTED.md)
- [Architecture](ARCHITECTURE.md)
- [Pear](PEAR.md)
- [Security](SECURITY.md)
