# Getting Started

This guide takes a contributor from a clean checkout to a working three-peer RescueMesh mesh on one laptop.

## Quick path: local Node (recommended on Windows)

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### 1. Install

```bash
npm install
npx playwright install chromium
```

### 2. Start three peers

On macOS, Linux, or Git Bash:

```bash
npm run dev:peer-a
npm run dev:peer-b
npm run dev:peer-c
```

On Windows PowerShell, Unix `VAR=value command` does not work. Use:

```powershell
$env:RESCUEMESH_NEXT_DIST=".next-a"; $env:RESCUEMESH_P2P_STORAGE=".p2p-data-a"; $env:RESCUEMESH_INSTANCE_LABEL="Citizen"
npx next dev --port 43147
```

Repeat in new terminals for Brigade (`43148`, `.next-b`, `.p2p-data-b`) and Command Center (`43149`, `.next-c`, `.p2p-data-c`).

Free those ports first. A leftover `next dev` or Compose stack will bind them.

### 3. Open the interfaces

| Interface | URL |
| --- | --- |
| Demo director | http://127.0.0.1:43147/demo |
| Citizen | http://127.0.0.1:43147/ |
| Brigade | http://127.0.0.1:43148/ |
| Command Center | http://127.0.0.1:43149/ |
| P2P status | http://127.0.0.1:43147/api/p2p/status |
| QVAC status | http://127.0.0.1:43147/api/qvac/status |

### 4. Verify the mesh

```bash
curl http://127.0.0.1:43147/api/qvac/status
curl http://127.0.0.1:43147/api/p2p/status
curl http://127.0.0.1:43148/api/p2p/status
```

QVAC must report `externalApi: false`. Peer IDs must be six hex characters, not `------`. `connectedCount` should be greater than 0 on A and B before you record.

## Quick path: Docker

```bash
npm install
docker compose up --build
```

Compose uses `network_mode: host` so the browser and mesh share `127.0.0.1`, matching local `next dev`. That works on Linux. On Docker Desktop for Windows or Mac, host networking often does not publish those ports to the host. Use the PowerShell path above instead.

```bash
docker compose down
```

## First end-to-end walkthrough

1. Open http://127.0.0.1:43147/demo.
2. Confirm `AI LOCAL ✓` and `P2P CONNECTED ✓`.
3. Open Report Emergency on Peer A and the dashboard on Peer B, side by side, with `?demo=1`.
4. Click **EN example (demo)** then **Submit report**.
5. Confirm `Analyzing locally…`, then `CRITICAL` at Plaza San Martin.
6. Confirm and save. Peer B shows **New critical incident**.
7. Follow the rest of the [demo script](DEMO.md).

## Common commands

| Command | Purpose |
| --- | --- |
| `npx next dev --port 43147` | Single peer (default `.next` store) |
| `npm run compose` | Docker A + B + C |
| `npm run compose:down` | Stop Compose |
| `npm run test:smoke` | HTTP APIs and pages |
| `npm run test:e2e` | Reporter → QVAC → dashboard |
| `npm run test:demo` | Official 7 steps + Pear replica |
| `npm run lint` | ESLint |

## Troubleshooting

### PowerShell rejects `npm run dev:peer-a`

The script sets Unix-style environment variables. Set `RESCUEMESH_NEXT_DIST`, `RESCUEMESH_P2P_STORAGE`, and `RESCUEMESH_INSTANCE_LABEL` in the shell, then run `npx next dev --port …`.

### Peer IDs stay `------` or `offline`

The process is not listening, or `/api/p2p/status` failed. Check the terminal for Next errors and that the port is free.

### `P2P ISOLATED`

Wait a few seconds. `/demo` introduces swarm keys between A and B. If it stays isolated, open Network on both peers and confirm distinct Peer IDs and distinct storage directories.

### QVAC shows local engine

The SDK is optional. `AI LOCAL ✓` means analysis is not a cloud API (`externalApi: false`). Warmup still helps the first report stay fast. See [QVAC](QVAC.md).

### Docker containers are healthy but the browser cannot connect

You are likely on Docker Desktop without working host networking. Stop Compose and start local Node processes.

## Next step

Read [Architecture](ARCHITECTURE.md) before changing peer boundaries or adding a central API.
