# RescueMesh — Plan de acción

English documentation index: [README](README.md). Product contract: [docs/PRODUCT.md](docs/PRODUCT.md).

Fuente de verdad: PRD MVP de RescueMesh.

**One-liner:** RescueMesh turns fragmented emergency reports into a shared, prioritized operational picture using local AI and peer-to-peer coordination.

**Posicionamiento:** WhatsApp communicates. RescueMesh coordinates.

## Norte

Convertir reportes caóticos en información operacional accionable, manteniendo la inteligencia y el estado lo menos dependientes posible de servicios cloud centralizados.

Afirmación correcta:

> RescueMesh removes dependency on centralized coordination servers and cloud AI. Reports remain locally available and synchronize peer-to-peer whenever a communication path is available.

No afirmar: “Works with absolutely no connectivity.”

## Principios

1. **Local-first.** El reporte vive primero en el dispositivo.
2. **AI local.** QVAC clasifica. Prohibido OpenAI/Anthropic u otra API cloud en el camino principal.
3. **P2P-first.** Pear replica entre peers. No hay REST API, PostgreSQL, Firebase, Supabase ni servidor de sync de RescueMesh.
4. **Progressive enhancement.** Si Pear falla, queda Report → QVAC → Incident → Dashboard local.
5. **Desktop/laptop.** No se construye app móvil en el MVP.

## Roles

| Rol | Puede |
| --- | --- |
| Reporter | Crear reportes, ver los suyos, ver sync. Sin formularios complejos. |
| Responder | Ver overview, ordenar por prioridad, inspeccionar, cambiar estado. |

Sin autenticación. El rol se elige al iniciar la instancia.

## Modelo

`Incident`: id, createdAt, createdByPeerId, rawReport, priority, status, location, affectedPeople, trappedPeople, medicalEmergency, needs, summary, syncStatus.

Estados: `new → acknowledged → in_progress → resolved`.

Prioridades: critical / high / medium / low.

Needs (solo esta lista): rescue, medical, water, food, shelter, medicine, transport, infrastructure, other.

QVAC responde JSON con schema fijo. Si falla: retry once → fallback a revisión manual.

## Orden obligatorio

### Fase 0 — Skeleton

Interfaz, selector de rol, incidente fake, dashboard del Responder, navegación del Reporter, type `Incident` en domain.

**DoD:** UX visible, herramienta de emergencia (sobria, alto contraste), sin login.

### Fase 1 — QVAC Crisis Copilot

Texto real → QVAC local → validación JSON → incidente → persistencia local → dashboard.

**DoD:** QVAC real, sin API cloud, schema estricto, el incidente sobrevive a close/open.

**Submission:** QVAC + General (Local Crisis Intelligence Copilot si no hay Pear).

### Fase 2 — Pear / RescueMesh

Dos procesos en una laptop: Peer A Reporter, Peer B Responder. Stores e IDs distintos. Replicar creación y cambios de estado. Panel Network con datos de runtime. Isolated → pending → synchronizing → synced.

**DoD:** A crea, B ve; B cambia estado, A ve; se cierra A y B conserva el incidente.

**Submission:** QVAC + Pears + General.

### Fase 3 — Demo Reliability

Precargar modelo, errores visibles, logs limpios, layout OBS, ensayar los 7 pasos, grabar fallback.

### Fase 4 — Stretch (solo si el núcleo está sólido)

1. Audio → transcripción local → QVAC.
2. Español → resumen operacional en inglés.
3. Deduplicación probable (no borrar en silencio).
4. Tercer peer: Citizen ↔ Brigade ↔ Command Center.

## Demo (7 pasos)

1. Mostrar `AI LOCAL ✓  P2P CONNECTED ✓  CENTRAL SERVER NONE`.
2. Reporter escribe el choque en Plaza San Martin.
3. QVAC produce CRITICAL (3 affected, 1 trapped, medical, rescue).
4. Responder recibe NEW CRITICAL INCIDENT.
5. Network Diagnostics con Peer IDs reales.
6. Cerrar Peer A.
7. Peer B sigue mostrando el incidente. *The original reporter is gone. The incident isn't.*

## Fuera del MVP

Login, OAuth, blockchain, wallets, tokens, mapas complejos, geocoding, GPS, Bluetooth, Wi-Fi Direct, LoRa, push, backend cloud, analytics, admin, app móvil.

## Arquitectura

```
Human emergency report
        ↓
       QVAC
        ↓
Local structured incident
        ↓
       Pear
    ↙        ↘
Reporter    Responder
```

No: Peer A → RescueMesh API → Database → Peer B.

## Criterios

- **Must-have:** QVAC real, persistencia, dashboard, demo reproducible.
- **Target:** lo anterior + Pear real, dos peers, sync, diagnóstico P2P.
- **Excellent:** audio, traducción, deduplicación, tercer peer, demo pulida.
