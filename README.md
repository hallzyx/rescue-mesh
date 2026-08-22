# RescueMesh

Red descentralizada de coordinación para emergencias. Convierte reportes humanos en incidentes estructurados y priorizados, con **QVAC local** y replicación **Pear** (Hyperswarm + Corestore + Hyperbee).

> WhatsApp communicates. RescueMesh coordinates.

Fuente de verdad del alcance: [`docs/PRD.md`](./docs/PRD.md)  
Plan de implementación: [`PLAN.md`](./PLAN.md) · tablero interactivo en `/plan`

## Estado actual

**Fase 0 — Skeleton** ✅  
**Fase 1 — QVAC Crisis Copilot** ✅  
**Fase 2 — Pear / P2P** ✅

- Mesh P2P con **Hyperswarm** (discovery) + **Corestore/Hyperbee** (replicación Pear)
- Cada instancia tiene storage independiente (`.p2p-data-a`, `.p2p-data-b`)
- Creación y cambios de estado de incidentes se replican entre peers
- Panel Network con peers conectados reales, QVAC runtime y `Central backend: NONE`
- Sin peers: estado **ISOLATED**, reportes con `syncStatus: pending`

**Siguiente:** Fase 3 — Demo Reliability (precarga QVAC, guion OBS, fallbacks visibles).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:43147](http://127.0.0.1:43147).

### Demo P2P (dos peers en una laptop)

Terminal A — Reporter:

```bash
npm run dev:peer-a
```

Terminal B — Responder:

```bash
npm run dev:peer-b
```

1. En A: `/reporter/report` → envía el ejemplo Av. Grau 120 → confirma.
2. En B: `/responder` → el incidente aparece tras sincronización P2P.
3. En B: Acknowledge / Start response / Resolve → A recibe el cambio de estado.
4. Cierra A: B conserva el incidente.

Rutas:

- `/` — elegir rol
- `/reporter/report` — enviar reporte con QVAC local
- `/responder` — cuadro operacional
- `/reporter/network` o `/responder/network` — diagnóstico P2P + QVAC

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, QVAC (local), Pear ecosystem (Hyperswarm, Corestore, Hyperbee). Desktop MVP. Sin backend central.
