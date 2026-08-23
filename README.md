# RescueMesh

RescueMesh is a local-first emergency coordination app. A citizen describes what is happening in free text. On-device QVAC turns that report into a structured, prioritized incident. Pear replicates the incident to brigade and command peers. There is no RescueMesh backend and no cloud AI API.

WhatsApp communicates. RescueMesh coordinates.

The original reporter can go offline. The incident stays.

## Start here

### Fastest local demo

Prerequisites: Node.js 20+, npm 10+. Docker Engine and Docker Compose v2 are optional.

On Linux or WSL:

```bash
npm install
docker compose up --build
```

On Windows, `network_mode: host` in Docker Desktop often does not expose `127.0.0.1` the same way. Prefer three local Next processes. PowerShell:

```powershell
npm install

$env:RESCUEMESH_NEXT_DIST=".next-a"; $env:RESCUEMESH_P2P_STORAGE=".p2p-data-a"; $env:RESCUEMESH_INSTANCE_LABEL="Citizen"
npx next dev --port 43147

# New terminal
$env:RESCUEMESH_NEXT_DIST=".next-b"; $env:RESCUEMESH_P2P_STORAGE=".p2p-data-b"; $env:RESCUEMESH_INSTANCE_LABEL="Brigade"
npx next dev --port 43148

# New terminal
$env:RESCUEMESH_NEXT_DIST=".next-c"; $env:RESCUEMESH_P2P_STORAGE=".p2p-data-c"; $env:RESCUEMESH_INSTANCE_LABEL="Command Center"
npx next dev --port 43149
```

`npm run dev:peer-a` uses Unix environment syntax and does not work in Windows PowerShell.

Open:

- Demo director: http://127.0.0.1:43147/demo
- Citizen / Reporter: http://127.0.0.1:43147/
- Brigade / Responder: http://127.0.0.1:43148/
- Command Center: http://127.0.0.1:43149/

Wait for the runtime bar:

```text
AI LOCAL ✓
P2P CONNECTED ✓
CENTRAL SERVER NONE
```

Do not record while the bar shows `P2P ISOLATED` or peer IDs `------` / `offline`.

For the complete setup, Windows notes, and troubleshooting, read [Getting Started](docs/GETTING_STARTED.md).

## Documentation index

README is the entry point. Continue with the document that matches the work you are doing:

| Document | Use it when you need to… |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | Understand peers, trust boundaries, request flows, and data ownership |
| [Getting Started](docs/GETTING_STARTED.md) | Install, start, verify, and troubleshoot a local mesh |
| [Configuration](docs/CONFIGURATION.md) | Configure ports, storage, dist dirs, and mesh environment |
| [QVAC](docs/QVAC.md) | Understand on-device analysis, warmup, and the local-engine fallback |
| [Pear](docs/PEAR.md) | Enable or debug Hyperswarm / Corestore / Hyperbee replication |
| [Operations](docs/OPERATIONS.md) | Run the demo director, start/stop peers, and operate a recording |
| [Testing](docs/TESTING.md) | Run automated checks and the manual smoke test |
| [Security](docs/SECURITY.md) | Review loopback kill-switch, local stores, and cloud-AI boundaries |
| [Product specification](docs/PRODUCT.md) | Read the product contract, roles, claims, and non-goals |
| [Demo script](docs/DEMO.md) | Rehearse the official 7-step recording |

## Product model

RescueMesh combines five capabilities:

1. **Local QVAC** — on-device extraction of priority, location, affected/trapped counts, medical flag, needs, and a short operational summary.
2. **Local persistence** — each process keeps its own incident store. There is no shared database “so the demo works.”
3. **Pear mesh** — peers discover, connect, and replicate incidents and status over Hyperswarm, Corestore, and Hyperbee.
4. **Two operational roles** — Reporter (citizen) and Responder (brigade). Command Center is a third process with the same Responder UI.
5. **Demo director** — `/demo` warms QVAC, introduces peers, and can stop or start a peer process from the UI.

Participants consume local intelligence and a shared replica. They do not sign into a RescueMesh account or call a central coordination API.

## Runtime topology

```text
Peer A Citizen :43147          Peer B Brigade :43148
  Reporter UI                    Responder dashboard
  QVAC (this device)             QVAC (this device)
  store .p2p-data-a              store .p2p-data-b
           │  Pear mesh (Hyperswarm + Corestore + Hyperbee)
           └─────────────────────┬──────────────────────┐
                                 │                      │
                      Peer C Command :43149             │
                        same Responder UI               │
                        store .p2p-data-c               │
                                                        │
                              No RescueMesh backend ────┘
                              No cloud AI API
```

See [Architecture](docs/ARCHITECTURE.md) for the complete flow and trust model.

## Available surfaces

| Surface | Port | Purpose |
| --- | ---: | --- |
| `/` | 43147–43149 | Role picker for this process |
| `/reporter/report` | 43147 | Free-text or local dictation → QVAC |
| `/responder` | 43148 / 43149 | Prioritized incident dashboard |
| `/demo` | any living peer | OBS director, warmup, start/stop |
| `/reporter/network` `/responder/network` | same | Runtime diagnostics, not fixtures |

## Development commands

```bash
npm install
npx playwright install chromium
npm run lint
npm run test:smoke
npm run test:e2e
npm run test:demo
npm test
npm run build
docker compose config --quiet
```

`npm run test:smoke` and `npm run test:e2e` reuse a server on `:43147` or start `npm run dev`. `npm run test:demo` requires Peer A and Peer B.

## Project status and scope

The repository is a hackathon MVP. The current scope includes:

- Reporter free-text and local dictation;
- on-device QVAC with schema validation, one retry, and manual review;
- Spanish input with an English operational summary;
- local persistence per process;
- Pear replication of incidents and status;
- a third Command Center peer;
- likely-duplicate hints that never silent-merge;
- a demo director with loopback start/stop.

The current MVP does not include:

- login, OAuth, or role administration;
- a RescueMesh REST API, PostgreSQL, Firebase, or Supabase;
- OpenAI, Anthropic, or any cloud AI API for analysis;
- maps, GPS, geocoding, or mobile apps;
- blockchain, wallets, tokens, or WDK;
- Bluetooth, Wi-Fi Direct, LoRa, or push notifications;
- a claim that it works with absolutely no physical communication path.

## Verification

Before opening a pull request or recording a demo:

```bash
npm run lint
npm run test:smoke
npm run test:demo
```

Then run the manual checklist in [Testing](docs/TESTING.md) and confirm `AI LOCAL ✓` and `P2P CONNECTED ✓` on `/demo`.

## Documentation conventions

- Keep README as the navigation index and high-level contract.
- Put detailed operational or architectural material in `docs/`.
- Keep product decisions in [docs/PRODUCT.md](docs/PRODUCT.md).
- Update links and verification commands when runtime behavior changes.
