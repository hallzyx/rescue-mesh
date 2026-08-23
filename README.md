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

### Docker Compose (demo A + B + C)

```bash
docker compose up --build
```

Tres peers en la misma laptop (`network_mode: host`), stores separados, mesh TCP en 127.0.0.1:

| Servicio | Rol | URL |
|----------|-----|-----|
| `peer-a` | Citizen / Reporter | http://127.0.0.1:43147 |
| `peer-b` | Brigade / Responder | http://127.0.0.1:43148 |
| `peer-c` | Command Center | http://127.0.0.1:43149 |

Director OBS: [http://127.0.0.1:43147/demo](http://127.0.0.1:43147/demo)

Libera esos puertos antes (`npm run compose:down` o para los `next dev` locales).

### Sincronizar historial completo (Origin / GitHub)

Si tu clone de Origin solo tiene **3 commits** y falta el MVP (Fases 0–4, Docker, tests):

1. Copia `rescuemesh-full.bundle` desde este repo/agente a tu PC.
2. En WSL, dentro de tu clone:

```bash
origin auth login
chmod +x scripts/import-full-history.sh
./scripts/import-full-history.sh
git push origin main    # Origin
git push github main    # GitHub (remoto SSH)
```

El bundle trae **17 commits** hasta `59ad3ff` (Docker Compose + demo test).

### Sin Docker

```bash
npm install
npm run dev
```

```bash
npm run dev:peer-a   # Citizen / Reporter — 43147
npm run dev:peer-b   # Brigade / Responder — 43148
npm run dev:peer-c   # Command Center — 43149
```

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
npm run test:demo                 # 7 pasos + réplica P2P (levanta A y B)
npm test                          # smoke + e2e + demo
```

`test:smoke` / `test:e2e` reutilizan el servidor en `:43147` o levantan `npm run dev`.  
`test:demo` necesita **los dos peers**: reutiliza A/B si ya corren, o arranca `dev:peer-a` + `dev:peer-b`.

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui, QVAC local, Pear (Hyperswarm, Corestore, Hyperbee). Sin backend central.
