# RescueMesh

Red descentralizada de coordinación para emergencias. Convierte reportes humanos en incidentes estructurados y priorizados, con **QVAC local** y replicación **Pear** (Hyperswarm + Corestore + Hyperbee).

> WhatsApp communicates. RescueMesh coordinates.

Fuente de verdad del alcance: [`docs/PRD.md`](./docs/PRD.md)  
Plan de implementación: [`PLAN.md`](./PLAN.md) · tablero interactivo en `/plan`  
Guion de demo: [`docs/DEMO.md`](./docs/DEMO.md)

## Estado actual

| Fase | Estado |
|------|--------|
| 0 — Skeleton | ✅ |
| 1 — QVAC Crisis Copilot | ✅ |
| 2 — Pear / P2P | ✅ |
| 3 — Demo Reliability | ✅ |

**Fase 3 incluye:**
- Precarga QVAC al iniciar (`POST /api/qvac/warmup`)
- Barra de runtime: `AI LOCAL ✓ · P2P CONNECTED ✓ · CENTRAL SERVER NONE`
- Modo demo (`?demo=1`) con tipografía grande para OBS
- Pantalla `/demo` — director de grabación con flujo de 7 pasos
- Errores visibles sin stack traces (QVAC, P2P, storage corrupto)
- Banner **NEW CRITICAL INCIDENT** en dashboard del Responder

**Siguiente:** Fase 4 — Stretch goals (audio, traducción, deduplicación, tercer peer).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:43147](http://127.0.0.1:43147).

### Demo P2P (recomendado para grabar)

```bash
npm run dev:peer-a   # Reporter — puerto 43147
npm run dev:peer-b   # Responder — puerto 43148
```

Director de demo: [http://127.0.0.1:43147/demo](http://127.0.0.1:43147/demo)

Añade `?demo=1` a cualquier ruta para layout OBS (ej. `/reporter/report?demo=1`).

## Rutas

| Ruta | Uso |
|------|-----|
| `/` | Elegir rol |
| `/demo` | Director OBS + checklist 7 pasos |
| `/reporter/report` | Enviar reporte con QVAC |
| `/responder` | Dashboard operacional |
| `/*/network` | Diagnóstico P2P + QVAC |

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, QVAC (local), Pear ecosystem (Hyperswarm, Corestore, Hyperbee). Desktop MVP. Sin backend central.
