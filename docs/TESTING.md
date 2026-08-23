# Testing and Verification

RescueMesh uses Playwright for HTTP smoke tests, the reporter flow, and the official 7-step demo including Pear replication.

## Quick path

```bash
npx playwright install chromium
npm run lint
npm run test:smoke
npm run test:e2e
npm run test:demo
```

`npm test` runs smoke + e2e + demo.

## Commands

| Command | Coverage |
| --- | --- |
| `npm run test:smoke` | APIs and pages over HTTP |
| `npm run test:e2e` | Reporter → QVAC → persist → dashboard |
| `npm run test:demo` | 7 steps on A, plus A → B replica |
| `npm run lint` | ESLint |
| `npm run build` | Next production build |
| `npm run verify:demo` | `scripts/verify-demo.mjs` against a live `:43147` |
| `docker compose config --quiet` | Compose file validity |

`test:smoke` and `test:e2e` reuse `:43147` if it is already up. `test:demo` needs Peer A and Peer B. It reuses them when they respond, otherwise it starts `dev:peer-a` and `dev:peer-b`.

Do not `POST /api/demo/stop` from Playwright. That kills the shared process.

## Test areas

### Smoke

`tests/smoke/api.spec.ts` covers QVAC analyze (including Spanish → English summary) and page availability.

### E2E

`tests/e2e/report-flow.spec.ts` covers role picker copy, the director, Plaza San Martin → CRITICAL, and Network diagnostics.

### Demo / Pear

`tests/demo/hackathon-demo.spec.ts` walks the 7 steps and asserts Peer B receives the incident over Pear/Hyperswarm. There is no skip.

## Manual smoke test

1. Start A, B, and C.
2. Open `/demo` and confirm `AI LOCAL ✓` and `P2P CONNECTED ✓`.
3. Submit the EN example on A. Confirm CRITICAL, 3 affected, 1 trapped, medical, rescue.
4. Confirm B shows the same incident without a manual refresh.
5. Open Network on both. Peer IDs must be real runtime values.
6. Stop Peer A from the UI. Confirm B still has the incident.
7. Optional: Command Center on `:43149` has the replica; start A again from B’s `/demo`.

## Acceptance checklist

- [ ] `externalApi` is `false`.
- [ ] Central backend reads `NONE`.
- [ ] Invalid QVAC JSON opens manual review, not a stack trace.
- [ ] Isolated peers show `ISOLATED`, not a fake connected state.
- [ ] Distinct storage directories for A and B.
- [ ] Stopping A does not delete the incident on B.
- [ ] Spanish example does not leave Spanish in the operational summary.

## Related documents

- [Getting started](GETTING_STARTED.md)
- [Demo script](DEMO.md)
- [Architecture](ARCHITECTURE.md)
- [Security](SECURITY.md)
