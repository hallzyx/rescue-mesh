# QVAC

RescueMesh uses QVAC to turn free-text emergency reports into a schema-checked incident. Analysis runs on the device. The product does not call OpenAI, Anthropic, or any other cloud completion API.

## Quick path

1. Confirm `/api/qvac/status` reports `externalApi: false`.
2. Open `/demo` or any `?demo=1` page so warmup POSTs to all three peers.
3. Submit the Plaza San Martin example and expect `CRITICAL` with rescue and medical needs.

## Runtime status

`GET /api/qvac/status` returns:

| Field | Meaning |
| --- | --- |
| `provider` | `qvac-sdk` or `local-engine` |
| `externalApi` | Always `false` in this product |
| `sdkInstalled` | `@qvac/sdk` loaded via `createRequire` |
| `modelLoaded` | SDK model id is cached |
| `warmupReady` | A warmup completion has finished |

The demo bar shows **AI LOCAL ✓** when status exists and `externalApi` is false. Warmup is still fired so the first on-camera report is not a cold start.

## Analyze path

1. `POST /api/qvac/analyze` with `{ rawReport }`.
2. If the SDK is available, complete on-device and parse JSON.
3. Merge missing fields from the local engine when the SDK omits them.
4. If JSON is invalid, fall through to the local engine.
5. Validate `priority`, `needs` taxonomy, `medicalEmergency`, counts, and `summary`.
6. Retry once. A second failure opens manual review. The incident is not persisted until JSON validates.

The UI shows `Analyzing locally…`. It never dumps a stack trace on the emergency screen.

## Local engine

The local engine is a deterministic extractor used as fallback and as a field-level fill-in. It is not a cloud model. Spanish reports still produce an English operational `summary`; `rawReport` stays in the original language.

## Warmup

`POST /api/qvac/warmup` runs the Plaza San Martin example through the SDK or local engine and marks the process ready. The client warmup component posts to `:43147`, `:43148`, and `:43149` so Brigade is not cold when the replica arrives.

## What QVAC is not

- Not a substitute for a physical radio or mesh radio.
- Not allowed to return unconstrained prose as the incident.
- Not allowed to depend on a hosted LLM endpoint.

## Related documents

- [Architecture](ARCHITECTURE.md)
- [Operations](OPERATIONS.md)
- [Product specification](PRODUCT.md)
