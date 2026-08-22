# RescueMesh

Red descentralizada de coordinación para emergencias. Convierte reportes humanos en incidentes estructurados y priorizados, con **QVAC local** y replicación **Pear** (Fase 2).

> WhatsApp communicates. RescueMesh coordinates.

Fuente de verdad del alcance: [`docs/PRD.md`](./docs/PRD.md)  
Plan de implementación: [`PLAN.md`](./PLAN.md) · tablero interactivo en `/plan`

## Estado actual

**Fase 0 — Skeleton** implementada:

- Selector de rol (Reporter / Responder) sin autenticación
- Navegación del Reporter: Inicio, Report Emergency, My Reports, Network
- Dashboard del Responder con Situation Overview e incidentes seed
- Detalle de incidente con Acknowledge / Start response / Resolve
- Tipo `Incident` en `domain/incident.ts`
- UI sobria, alto contraste, orientada a emergencias

**Fase 1 — QVAC Crisis Copilot** implementada:

- Reporte en texto libre → análisis local (`/api/qvac/analyze`)
- Motor local con fallback (`qvac/local-engine.ts`) si `@qvac/sdk` no está instalado
- Validación estricta de JSON (`qvac/schema.ts`) con reintento automático
- Revisión manual si el JSON falla tras el reintento
- Persistencia real en `localStorage` → visible en My Reports y dashboard del Responder
- Panel de red con estado runtime de QVAC (`/api/qvac/status`)

**Siguiente:** Fase 2 — Pear / P2P (replicación entre peers).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:43147](http://127.0.0.1:43147).

- `/` — elegir rol
- `/reporter` — flujo del afectado
- `/reporter/report` — enviar reporte con QVAC local
- `/responder` — cuadro operacional
- `/plan` — tablero del plan de implementación

### Demo rápida (Fase 1)

1. Abre `/reporter/report` y pega el ejemplo de Av. Grau 120.
2. Espera “Analyzing locally…”.
3. Confirma el incidente estructurado (CRITICAL, rescue + medical).
4. Abre `/responder` en la misma instancia: el incidente aparece en el dashboard.

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui. Desktop MVP. Sin backend central.
