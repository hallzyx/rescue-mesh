# Security Model

RescueMesh is a laptop-local emergency demo. This document describes the current MVP posture and the boundaries that must remain intact.

## Security principles

1. Analysis does not leave the device for a cloud LLM.
2. There is no RescueMesh coordination backend.
3. Demo process control is loopback-only.
4. Each peer keeps a separate store. Killing A must not depend on a shared disk.
5. Diagnostics tell the truth. Isolated is allowed. Fake connected is not.
6. Emergency UI never shows stack traces.

## Credential boundaries

| Credential | Allowed location | Never expose to |
| --- | --- | --- |
| Cloud AI API keys | Nowhere in this product | Any peer, browser, or log |
| Demo start/stop | Loopback `127.0.0.1` / `localhost` / `::1` | LAN, public internet |
| Corestore directories | Local disk per process | Other peers as a shared mount “for the demo” |
| Browser role / peer id | `localStorage` on that origin | Treated as identity or auth |

There is no login. Choosing Reporter or Responder is an instance role, not an account.

## Process control

`POST /api/demo/stop` calls `process.exit(0)` after 250ms. `POST /api/demo/start` spawns `npx next dev`.

Both routes check the request hostname. Non-loopback clients receive 403.

Do not bind these routes behind a public reverse proxy without replacing them. They are recording controls.

## Network

CORS and `allowedDevOrigins` allow only the three loopback demo origins. Cross-peer fetch on one laptop is intentional. It is not a multi-tenant API.

## Data exposure

The Responder dashboard shows operational summaries, needs, and the raw report that a citizen typed. Treat demo data as unsensitive rehearsal content. Do not put real victim PII in a recorded pitch.

## Deployment checklist

The MVP is desktop/laptop. Before any wider deployment:

- [ ] Remove or redesign start/stop so it cannot kill a remote host.
- [ ] Add HTTPS if the UI leaves loopback.
- [ ] Keep QVAC on-device; do not add a hosted LLM “just for reliability.”
- [ ] Keep stores partitioned per peer.
- [ ] Add rate limits if any HTTP surface becomes reachable.
- [ ] Review dictation: Web Speech API is browser-local in Chromium, not a RescueMesh STT server.

## Related documents

- [Architecture](ARCHITECTURE.md)
- [Configuration](CONFIGURATION.md)
- [Operations](OPERATIONS.md)
- [QVAC](QVAC.md)
