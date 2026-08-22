# RescueMesh

Red descentralizada de coordinación para emergencias. Convierte reportes humanos en incidentes estructurados y priorizados, con **QVAC local** y replicación **Pear** (Fases 1–2).

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

**Siguiente:** Fase 1 — QVAC Crisis Copilot (texto → JSON → persistencia real).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:43147](http://127.0.0.1:43147).

- `/` — elegir rol
- `/reporter` — flujo del afectado
- `/responder` — cuadro operacional
- `/plan` — tablero del plan de implementación

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui. Desktop MVP. Sin backend central.
