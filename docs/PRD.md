# RescueMesh — PRD MVP

## 1. Resumen

**RescueMesh** es una red descentralizada de coordinación para emergencias que transforma reportes humanos desordenados en incidentes estructurados, priorizados y replicables entre participantes.

El MVP está orientado inicialmente a escenarios como terremotos, donde ciudadanos, brigadas y coordinadores necesitan convertir rápidamente información fragmentada en una visión operacional compartida.

El producto combina:

- **QVAC** para procesamiento de IA local.
- **Pear / Pears** para comunicación y replicación P2P.
- Persistencia local para evitar depender de una base de datos central.
- Una interfaz sencilla orientada a dos roles: afectado y coordinador.

El MVP **no pretende reemplazar WhatsApp ni funcionar mágicamente sin ningún medio físico de comunicación**.

> Convertir reportes caóticos en información operacional accionable, manteniendo la inteligencia y el estado del sistema lo menos dependientes posible de servicios cloud centralizados.

---

## 2. Objetivo de la hackathon

Construir una aplicación funcional y demostrable que pueda competir principalmente en:

- **QVAC Track**
- **Pears Track**
- **General Track**

La implementación debe seguir un alcance progresivo para garantizar que siempre exista una versión entregable.

Prioridad:

1. Tener una submission funcional para QVAC + General.
2. Añadir Pear y evolucionarla a RescueMesh completo.
3. Pulir demo y funcionalidades secundarias.

---

## 3. Problema

Después de un desastre aparecen rápidamente cientos o miles de mensajes:

- personas heridas;
- edificios dañados;
- necesidades de agua;
- pedidos de medicamentos;
- vías bloqueadas;
- personas atrapadas;
- refugios disponibles;
- información duplicada o contradictoria.

Herramientas de comunicación como WhatsApp permiten enviar mensajes, pero no resuelven fácilmente el problema posterior:

> ¿Qué está ocurriendo realmente, qué es urgente y dónde deberían concentrarse los recursos?

Ejemplo:

```text
10:31 — Se cayó una casa acá.
10:31 — Hay tres personas.
10:32 — Necesitamos agua.
10:32 — ¿Alguien sabe dónde están atendiendo?
10:33 — URGENTE, una persona está atrapada.
10:34 — También hay alguien sangrando.
```

Para un coordinador, esa información debe convertirse rápidamente en algo como:

```text
CRITICAL

Location: Av. Grau 120
Affected: 3
Trapped: 1
Medical emergency: Yes
Needs:
- Rescue
- Medical assistance
```

---

## 4. Propuesta de valor

### Para el afectado

No debe llenar formularios complejos. Simplemente describe lo que ocurre:

> "Parte de mi edificio colapsó. Somos tres, una persona está atrapada y otra está sangrando. Estamos en Av. Grau 120."

RescueMesh procesa esa información localmente.

### Para el coordinador

En lugar de revisar cientos de mensajes:

```text
847 unread messages
```

recibe:

```text
CRITICAL       4
HIGH          12
MEDIUM        31

Rescue         8
Medical       13
Water         17
Shelter        9
```

y una lista de incidentes ordenada por prioridad.

---

## 5. Principios del producto

### 5.1 Local-first

La información debe existir primero en el dispositivo. Un reporte no debería depender de una API remota para poder ser creado, analizado, almacenado o consultado.

### 5.2 AI local

QVAC ejecuta la clasificación del reporte localmente. No se utilizará OpenAI, Anthropic u otra API cloud para el procesamiento principal.

### 5.3 P2P-first

Cuando Pear esté implementado, los peers compartirán información entre ellos sin utilizar un backend propio de RescueMesh.

No existirán:

- RescueMesh REST API;
- PostgreSQL central;
- Firebase;
- Supabase;
- servidor central de sincronización.

### 5.4 Progressive enhancement

Si Pear falla o no puede completarse durante la hackathon, debe permanecer una aplicación funcional basada en:

```text
Report
↓
QVAC
↓
Structured Incident
↓
Local Dashboard
```

---

## 6. Plataforma

Aplicación **desktop/laptop** para el MVP.

No construir una app móvil durante la primera versión.

Razones:

- reducir complejidad;
- facilitar integración con QVAC;
- facilitar debugging de Pear;
- permitir ejecutar múltiples peers en una sola laptop;
- facilitar grabación del demo.

---

## 7. Roles

### Reporter

Representa a ciudadano afectado, voluntario, miembro de una comunidad o brigadista registrando información de terceros.

Puede:

- crear reportes;
- consultar sus reportes;
- consultar estado de sincronización.

### Responder

Representa a brigadista, ONG, centro de coordinación o autoridad local.

Puede:

- visualizar incidentes;
- ordenarlos por prioridad;
- inspeccionar detalles;
- cambiar su estado operacional.

No existe autenticación en el MVP. El rol se selecciona al iniciar una instancia.

---

## 8. Flujo principal

### Reporter

1. Usuario abre **Report Emergency**.
2. Escribe un reporte natural.
3. La UI muestra `Analyzing locally...`.
4. QVAC devuelve un objeto estructurado.
5. Se muestra una tarjeta de incidente.
6. Se guarda localmente.
7. Si existen peers, se marca como `Synchronized`; si no, `Pending synchronization`.

Ejemplo de salida de QVAC:

```json
{
  "priority": "critical",
  "location": "Av. Grau 120",
  "affected_people": 3,
  "trapped_people": 1,
  "medical_emergency": true,
  "needs": ["rescue", "medical"],
  "summary": "Partial structural collapse with one trapped person and one injured person."
}
```

---

## 9. Estados de incidentes

```text
NEW
↓
ACKNOWLEDGED
↓
IN_PROGRESS
↓
RESOLVED
```

El Responder puede cambiar el estado. Con Pear implementado, estos cambios deben propagarse a otros peers.

---

## 10. Prioridades

### Critical
- persona atrapada;
- riesgo vital;
- hemorragia severa;
- incendio;
- colapso estructural con personas dentro.

### High
- heridos no críticos;
- falta urgente de medicamentos;
- infraestructura peligrosa.

### Medium
- necesidad de agua;
- refugio;
- electricidad;
- suministros.

### Low
- información útil sin urgencia inmediata.

---

## 11. Taxonomía de necesidades

```text
RESCUE
MEDICAL
WATER
FOOD
SHELTER
MEDICINE
TRANSPORT
INFRASTRUCTURE
OTHER
```

QVAC debe devolver uno o varios valores pertenecientes únicamente a esta lista.

---

## 12. Uso de QVAC

QVAC debe:

- interpretar texto libre;
- extraer ubicación textual;
- estimar cantidad de afectados;
- detectar personas atrapadas;
- identificar emergencia médica;
- clasificar necesidades;
- asignar prioridad;
- producir resumen corto.

---

## 13. Salida estricta de QVAC

El modelo no debe responder texto libre al frontend. Debe responder JSON bajo un schema fijo y validarse antes de persistir.

Si la respuesta no es válida:

```text
retry once
```

Si vuelve a fallar:

```text
fallback → manual report review
```

---

## 14. Modelo de datos

```typescript
type Incident = {
  id: string
  createdAt: string
  createdByPeerId: string
  rawReport: string

  priority:
    | "critical"
    | "high"
    | "medium"
    | "low"

  status:
    | "new"
    | "acknowledged"
    | "in_progress"
    | "resolved"

  location?: string
  affectedPeople?: number
  trappedPeople?: number
  medicalEmergency: boolean
  needs: NeedType[]
  summary: string

  syncStatus:
    | "local"
    | "pending"
    | "synced"
}
```

---

## 15. Dashboard Responder

Pantalla principal:

```text
RESCUEMESH
Situation Overview

CRITICAL     2
HIGH         4
MEDIUM      11
LOW          7
```

Debajo, lista de incidentes ordenada por:

1. prioridad;
2. fecha.

---

## 16. Incident Detail

Mostrar:

- prioridad;
- ubicación;
- resumen;
- número de afectados;
- atrapados;
- emergencia médica;
- necesidades;
- estado;
- fecha;
- peer originador.

Acciones:

```text
Acknowledge
Start response
Resolve
```

---

## 17. Persistencia local

Los incidentes deben almacenarse localmente.

La aplicación debe poder:

1. cerrarse;
2. abrirse nuevamente;
3. recuperar incidentes existentes.

No depender de una base de datos externa.

---

## 18. Integración Pear

Esta funcionalidad corresponde a la segunda fase.

Objetivo: ejecutar múltiples peers independientes.

```text
Peer A — Reporter
Peer B — Responder
Peer C — Optional coordinator
```

Cada instancia debe tener:

- storage independiente;
- identidad independiente;
- Peer ID/public key diferente.

---

## 19. Networking P2P

Usar herramientas del ecosistema Pear apropiadas para:

- discovery;
- conexión;
- intercambio de información;
- replicación.

Arquitectura conceptual:

```text
Peer A
  ↕
Peer B
  ↕
Peer C
```

No:

```text
Peer A
  ↓
RescueMesh API
  ↓
Database
  ↓
Peer B
```

---

## 20. Replicación

Cuando Peer A crea `Incident #42`, Peer B debe recibirlo. Si Peer C está conectado, B y C deben conservar el incidente.

Después de cerrar Peer A:

```text
Peer A CLOSED
```

B y C deben continuar mostrando:

```text
Incident #42
```

Esta será una de las pruebas principales del demo.

---

## 21. Estado sin conexión

Si no hay peers disponibles:

```text
NETWORK STATUS

ISOLATED
No peers currently available

Your report is safely stored locally.
It will synchronize when connectivity returns.
```

El reporte debe procesarse con QVAC, almacenarse localmente y quedar como `pending synchronization`.

Cuando aparezca un peer:

```text
pending
↓
synchronizing
↓
synced
```

---

## 22. Network Diagnostics

Crear una pantalla o panel pequeño:

```text
NETWORK

Node:
7A82F...

Connected peers:
2

B91CA...   CONNECTED
C77DF...   CONNECTED

AI:
QVAC LOCAL

Central backend:
NONE
```

El panel debe obtener información real del runtime. No hardcodear Peer IDs ni conexiones.

---

## 23. Arquitectura de UI

### Reporter

```text
Home
├── Report Emergency
├── My Reports
└── Network
```

### Responder

```text
Dashboard
├── Incidents
├── Incident Detail
└── Network
```

---

## 24. Diseño

Visual:

- sobrio;
- claro;
- orientado a emergencias;
- alta legibilidad;
- contraste alto;
- poco ruido visual.

Evitar estética futurista Web3, cyberpunk, crypto o dashboard empresarial excesivamente complejo.

Debe sentirse como una herramienta real de respuesta a emergencias.

---

## 25. Tecnología frontend

Preferencia:

```text
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide / React Icons
```

Mantener componentes pequeños y no añadir librerías innecesarias.

---

## 26. Arquitectura sugerida

```text
rescuemesh/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── reports/
│   │   ├── incidents/
│   │   ├── dashboard/
│   │   └── network/
│   │
│   ├── qvac/
│   │   ├── client.ts
│   │   ├── prompts.ts
│   │   ├── schema.ts
│   │   └── parser.ts
│   │
│   ├── p2p/
│   │   ├── peer.ts
│   │   ├── replication.ts
│   │   └── diagnostics.ts
│   │
│   ├── storage/
│   ├── domain/
│   │   └── incident.ts
│   └── utils/
│
└── README.md
```

Separar claramente:

```text
domain
AI
P2P
storage
UI
```

---

## 27. Orden obligatorio de implementación

### PHASE 0 — Skeleton

Construir:

- interfaz;
- roles;
- fake incident temporal;
- dashboard.

Objetivo: tener UX visible rápidamente.

### PHASE 1 — QVAC Crisis Copilot

```text
Text Report
↓
QVAC local
↓
JSON validation
↓
Incident
↓
local persistence
↓
Responder Dashboard
```

Definition of Done:

- usuario escribe texto real;
- QVAC lo procesa localmente;
- JSON pasa schema;
- incidente aparece correctamente;
- persiste tras reiniciar.

En este punto ya existe una submission potencial:

```text
QVAC + General
```

### PHASE 2 — Pear / RescueMesh

```text
Peer A
↓
create incident
↓
Pear
↓
Peer B
↓
incident appears
```

Después:

```text
Peer B changes status
↓
Pear
↓
Peer A receives update
```

Definition of Done:

- dos instancias independientes;
- peer IDs distintos;
- storage distinto;
- incidentes sincronizados;
- estados sincronizados.

Submission:

```text
QVAC
+
Pears
+
General
```

### PHASE 3 — Demo Reliability

Priorizar:

- precargar modelo QVAC;
- evitar latencias sorpresa;
- schema JSON estricto;
- error handling;
- logs limpios;
- indicators reales de P2P;
- layout preparado para OBS.

### PHASE 4 — Stretch Goals

Solo implementar si el núcleo funciona perfectamente.

1. **Audio:** audio → local transcription → QVAC → Incident.
2. **Traducción:** entrada en español → resumen operacional estándar en inglés.
3. **Deduplicación:** detectar reportes probablemente equivalentes.
4. **Tercer peer:** Citizen ↔ Brigade ↔ Command Center.

---

## 28. Fuera del MVP

NO implementar durante la hackathon:

- login;
- registro;
- OAuth;
- blockchain;
- wallets;
- tokens;
- USDT;
- WDK;
- mapas complejos;
- geocoding;
- GPS real;
- Bluetooth;
- Wi-Fi Direct;
- LoRa;
- notificaciones push;
- backend cloud;
- analytics;
- administración;
- permisos avanzados.

---

## 29. Roadmap posterior

### Transport abstraction

Objetivo futuro:

```text
RescueMesh Core
       │
 ┌─────┼──────────┐
 │     │          │
Pear  Bluetooth  LoRa
      WiFi Direct
```

La lógica del producto debería ser independiente del medio de transporte.

---

## 30. Limitación explícita del MVP

RescueMesh no debe afirmar:

> Works with absolutely no connectivity.

La afirmación correcta:

> RescueMesh removes dependency on centralized coordination servers and cloud AI. Reports remain locally available and synchronize peer-to-peer whenever a communication path is available.

Si no existe ningún canal físico:

```text
Internet ❌
Wi-Fi ❌
Bluetooth ❌
LoRa ❌
LAN ❌
```

ningún software puede transmitir información.

En ese escenario, RescueMesh:

- continúa procesando localmente;
- conserva el reporte;
- espera conectividad;
- sincroniza posteriormente.

---

## 31. Comparación con WhatsApp

No posicionar RescueMesh como sustituto de WhatsApp.

> **WhatsApp communicates. RescueMesh coordinates.**

WhatsApp:

```text
847 messages
```

RescueMesh:

```text
4 critical incidents
12 medical requests
8 areas needing water
3 likely duplicate reports
```

La comunicación puede ocurrir mediante herramientas existentes. RescueMesh convierte información fragmentada en estado operacional.

---

## 32. Demo objetivo

Usar una sola laptop.

Dos procesos/instancias independientes:

```text
┌───────────────────────┐
│ Reporter — Peer A     │
└───────────────────────┘

┌───────────────────────┐
│ Responder — Peer B    │
└───────────────────────┘
```

Ambos con:

- storage diferente;
- Peer ID distinto;
- proceso independiente.

---

## 33. Flujo del demo

### Paso 1

Mostrar:

```text
AI LOCAL ✓
P2P CONNECTED ✓
CENTRAL SERVER NONE
```

### Paso 2

Reporter escribe:

> Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.

### Paso 3

QVAC produce:

```text
CRITICAL

Av. Grau 120

3 affected
1 trapped
Medical emergency

Needs:
Rescue
Medical
```

### Paso 4

Responder recibe automáticamente:

```text
NEW CRITICAL INCIDENT
```

### Paso 5

Abrir brevemente Network Diagnostics.

Mostrar:

```text
Peer A:
7A82...

Peer B:
D19F...

Connected ✓
```

### Paso 6

Cerrar completamente Peer A.

### Paso 7

Peer B continúa mostrando:

```text
Incident #42
```

Mensaje narrativo:

> The original reporter is gone. The incident isn't.

---

## 34. Pruebas técnicas para credibilidad

### QVAC real

Mostrar:

```text
QVAC
Processing: Local

External AI API:
None
```

### Pear real

Mostrar:

- Peer ID real;
- peers conectados;
- runtime real.

No hardcodear valores.

### Storage independiente

```text
Peer A → storage-a
Peer B → storage-b
```

### Replicación

Cerrar el peer originador y verificar que el receptor conserva los datos.

---

## 35. Demo fallback

Si Pear no está listo, **NO cancelar el proyecto**.

Grabar:

```text
Reporter
↓
QVAC
↓
Incident
↓
Dashboard
```

Presentar como:

**Local Crisis Intelligence Copilot**

Tracks:

```text
QVAC
General
```

---

## 36. Criterios de éxito

### Must-have

- QVAC real;
- procesamiento local;
- texto → incidente estructurado;
- persistencia;
- dashboard;
- UX usable;
- demo reproducible.

### Target

Todo lo anterior +

- Pear real;
- dos peers;
- sincronización;
- actualización de estados;
- diagnóstico P2P.

### Excellent

Todo lo anterior +

- audio;
- traducción;
- deduplicación;
- tercer peer;
- demo altamente pulida.

---

## 37. Pitch técnico resumido

```text
Human emergency report
        ↓
       QVAC
        ↓
Local structured intelligence
        ↓
      Incident
        ↓
       Pear
        ↓
Distributed operational state
    ↙             ↘
Reporter        Responder
```

---

## 38. One-liner

> **RescueMesh turns fragmented emergency reports into a shared, prioritized operational picture using local AI and peer-to-peer coordination.**

---

## 39. Mensaje final del producto

> Communication during a disaster is only the first problem.
>
> The next problem is understanding hundreds of fragmented reports fast enough to make decisions.
>
> RescueMesh uses local AI to turn those reports into actionable incidents and peer-to-peer infrastructure to keep that operational picture distributed.
>
> **When infrastructure degrades, understanding the crisis shouldn't degrade with it.**
