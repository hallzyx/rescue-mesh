# RescueMesh

Red descentralizada de coordinación para emergencias. Convierte reportes humanos en incidentes estructurados y priorizados, con **QVAC local** y replicación **Pear** (Hyperswarm + Corestore + Hyperbee).

> WhatsApp communicates. RescueMesh coordinates.

Fuente de verdad: [`docs/PRD.md`](./docs/PRD.md) · Plan: [`PLAN.md`](./PLAN.md) · Demo: [`docs/DEMO.md`](./docs/DEMO.md)

## Estado — MVP completo (Fases 0–4)

| Fase | Estado |
|------|--------|
| 0 — Skeleton | ✅ |
| 1 — QVAC Crisis Copilot | ✅ |
| 2 — Pear / P2P | ✅ |
| 3 — Demo Reliability | ✅ |
| 4 — Stretch goals | ✅ |

### Fase 4 — Stretch goals

- **Audio:** dictado local (Web Speech API) → texto → QVAC → incidente
- **Traducción:** reportes en español → resumen operacional en inglés (`rawReport` conservado)
- **Deduplicación:** panel *Likely duplicates* — sugiere equivalentes, no fusiona en silencio
- **Tercer peer:** `npm run dev:peer-c` — Command Center (puerto 43149)

## Cómo correrlo

```bash
npm install
npm run dev
```

### Demo P2P (3 peers)

```bash
npm run dev:peer-a   # Citizen / Reporter — 43147
npm run dev:peer-b   # Brigade / Responder — 43148
npm run dev:peer-c   # Command Center — 43149
```

Director OBS: [http://127.0.0.1:43147/demo](http://127.0.0.1:43147/demo)

## Rutas clave

| Ruta | Uso |
|------|-----|
| `/` | Elegir rol (Reporter, Brigade, Command Center) |
| `/demo` | Director OBS + checklist |
| `/reporter/report` | Texto o dictado → QVAC |
| `/responder` | Dashboard + deduplicación |

## Tests

```bash
npx playwright install chromium   # una vez
npm run test:smoke                # APIs + páginas (HTTP)
npm run test:e2e                  # flujo Reporter → QVAC → Responder
npm run test:demo                 # guion de 7 pasos del PRD (hackathon)
npm test                          # smoke + e2e + demo
```

Si no hay servidor, Playwright levanta `npm run dev` en el puerto 43147. Si ya corre, lo reutiliza.

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui, QVAC local, Pear (Hyperswarm, Corestore, Hyperbee). Sin backend central.
