export type Owner = "UI" | "Domain" | "QVAC" | "Storage" | "P2P" | "Demo";

export type Effort = "S" | "M" | "L";
export type Priority = "crítica" | "alta" | "media";
export type RiskLevel = "alto" | "medio" | "bajo";

export type Task = {
  id: string;
  title: string;
  detail: string;
  owner: Owner;
  effort: Effort;
  priority: Priority;
  dependsOn?: string[];
};

export type Phase = {
  id: string;
  index: number;
  name: string;
  headline: string;
  why: string;
  outcome: string;
  deliverables: string[];
  acceptance: string[];
  tasks: Task[];
};

export type Risk = {
  id: string;
  title: string;
  level: RiskLevel;
  signal: string;
  mitigation: string;
};

export type ArchitectureLayer = {
  id: string;
  name: string;
  role: string;
  items: string[];
};

export type DemoStep = {
  step: number;
  title: string;
  action: string;
  show: string;
};

export const owners: Owner[] = ["UI", "Domain", "QVAC", "Storage", "P2P", "Demo"];

export const plan = {
  product: "RescueMesh",
  tagline: "WhatsApp communicates. RescueMesh coordinates.",
  oneLiner:
    "RescueMesh turns fragmented emergency reports into a shared, prioritized operational picture using local AI and peer-to-peer coordination.",
  northStar:
    "Convertir reportes caóticos en información operacional accionable, manteniendo la inteligencia y el estado lo menos dependientes posible de servicios cloud centralizados.",
  premise:
    "Este plan implementa el PRD MVP de RescueMesh para la hackathon. El orden de fases es obligatorio: siempre debe existir una versión entregable. Primero QVAC + General; después Pear; al final el pulido de demo.",
  claimCorrect:
    "RescueMesh removes dependency on centralized coordination servers and cloud AI. Reports remain locally available and synchronize peer-to-peer whenever a communication path is available.",
  claimForbidden: "Works with absolutely no connectivity.",
  currentState: [
    "Hay un PRD cerrado. Todavía no hay producto.",
    "El MVP es desktop/laptop. No se construye app móvil.",
    "Dos roles, sin autenticación: Reporter y Responder. El rol se elige al iniciar la instancia.",
    "La IA principal es QVAC local. Prohibido OpenAI, Anthropic u otra API cloud para el procesamiento.",
    "No habrá REST API propia, PostgreSQL central, Firebase, Supabase ni servidor de sync.",
  ],
  nonGoals: [
    "Login, registro, OAuth, administración o permisos avanzados.",
    "Blockchain, wallets, tokens, USDT o WDK.",
    "Mapas complejos, geocoding o GPS real.",
    "Bluetooth, Wi-Fi Direct, LoRa o notificaciones push.",
    "Backend cloud o analytics.",
    "Reemplazar WhatsApp. WhatsApp comunica; RescueMesh coordina.",
    "Afirmar que funciona sin ningún canal físico de comunicación.",
  ],
  decisions: [
    {
      title: "Local-first",
      body: "Un reporte existe primero en el dispositivo. Crear, analizar, guardar y consultar no pueden depender de una API remota.",
    },
    {
      title: "AI local con QVAC",
      body: "QVAC clasifica el texto en el dispositivo. Si el JSON no valida, un reintento. Si falla otra vez, revisión manual. Nunca texto libre al frontend.",
    },
    {
      title: "P2P-first, sin backend propio",
      body: "Cuando Pear esté listo, los peers replican entre ellos. RescueMesh no opera un servidor central de coordinación.",
    },
    {
      title: "Progressive enhancement",
      body: "Si Pear no llega a tiempo, la app sigue siendo un Local Crisis Intelligence Copilot: Report → QVAC → Incident → Dashboard local. No se cancela el proyecto.",
    },
    {
      title: "Desktop primero",
      body: "Una laptop, varias instancias. Facilita QVAC, el debug de Pear, el demo y OBS. Móvil queda fuera del MVP.",
    },
  ],
  roles: [
    {
      id: "reporter",
      name: "Reporter",
      persona: "Afectado, voluntario, comunidad o brigadista",
      job: "Describe lo que ocurre en texto libre. No llena formularios complejos.",
      needs: [
        "Escribir un reporte natural",
        "Ver Analyzing locally… mientras QVAC trabaja",
        "Recibir una tarjeta de incidente estructurada",
        "Consultar sus reportes y el estado de sincronización",
      ],
    },
    {
      id: "responder",
      name: "Responder",
      persona: "Brigada, ONG, centro de coordinación o autoridad",
      job: "Ver el cuadro operacional, no 847 mensajes sin leer.",
      needs: [
        "Overview por prioridad (CRITICAL / HIGH / MEDIUM / LOW)",
        "Lista de incidentes ordenada por prioridad y fecha",
        "Detalle: ubicación, afectados, atrapados, médico, necesidades",
        "Cambiar estado: Acknowledge → Start response → Resolve",
      ],
    },
  ],
  tracks: [
    {
      name: "Must-have",
      submission: "QVAC + General",
      items: [
        "QVAC real y local",
        "Texto → incidente estructurado",
        "Persistencia local",
        "Dashboard usable",
        "Demo reproducible",
      ],
    },
    {
      name: "Target",
      submission: "QVAC + Pears + General",
      items: [
        "Todo el must-have",
        "Pear real",
        "Dos peers independientes",
        "Sincronización de incidentes y estados",
        "Diagnóstico P2P con datos de runtime",
      ],
    },
    {
      name: "Excellent",
      submission: "Núcleo + stretch",
      items: [
        "Audio → transcripción local → QVAC",
        "Entrada en español → resumen operacional en inglés",
        "Deduplicación de reportes equivalentes",
        "Tercer peer: Citizen ↔ Brigade ↔ Command Center",
      ],
    },
  ],
  metrics: [
    {
      name: "Submission siempre viva",
      target: "Desde el cierre de Fase 1 hay una demo grabable: texto real → incidente → dashboard.",
      why: "El PRD exige alcance progresivo. Pear puede fallar; la submission no.",
    },
    {
      name: "JSON estricto",
      target: "Ninguna respuesta de QVAC llega al frontend como texto libre. Schema o fallback manual.",
      why: "Un modelo que charla rompe el dominio.",
    },
    {
      name: "Persistencia real",
      target: "Cerrar y abrir la app recupera los incidentes. Sin base externa.",
      why: "Local-first se demuestra apagando el proceso.",
    },
    {
      name: "Replicación demostrable",
      target: "Peer A crea el incidente, se cierra, Peer B lo sigue mostrando.",
      why: "The original reporter is gone. The incident isn't.",
    },
    {
      name: "Diagnóstico honesto",
      target: "Peer IDs, peers conectados y 'QVAC LOCAL / Central backend: NONE' salen del runtime. Cero hardcode.",
      why: "Hardcodear IDs quema la credibilidad del demo.",
    },
  ],
} as const;

export const architecture: ArchitectureLayer[] = [
  {
    id: "domain",
    name: "Domain",
    role: "El incidente es el objeto de verdad. UI, QVAC, storage y P2P hablan este tipo.",
    items: [
      "Incident: id, createdAt, createdByPeerId, rawReport",
      "priority: critical | high | medium | low",
      "status: new → acknowledged → in_progress → resolved",
      "location, affectedPeople, trappedPeople, medicalEmergency",
      "needs: solo la taxonomía fija (rescue, medical, water, food, shelter, medicine, transport, infrastructure, other)",
      "syncStatus: local | pending | synced",
    ],
  },
  {
    id: "qvac",
    name: "QVAC",
    role: "Crisis copilot local. Interpreta texto libre y devuelve JSON validado.",
    items: [
      "client.ts — llamada local, sin API cloud",
      "prompts.ts — extracción de ubicación, afectados, atrapados, médico, necesidades, prioridad, resumen",
      "schema.ts — schema fijo; el modelo no responde prosa",
      "parser.ts — validar; retry once; si falla, fallback a revisión manual",
    ],
  },
  {
    id: "storage",
    name: "Storage",
    role: "Persistencia por instancia. Cada peer tiene su propio store.",
    items: [
      "Guardar y listar incidentes en el dispositivo",
      "Sobrevive a close → open",
      "Peer A → storage-a, Peer B → storage-b. Nunca un store compartido en el demo",
      "Sin PostgreSQL, Firebase, Supabase ni DB remota",
    ],
  },
  {
    id: "p2p",
    name: "P2P / Pear",
    role: "Segunda fase. Discovery, conexión, intercambio y replicación. Sin backend de RescueMesh.",
    items: [
      "peer.ts — identidad y Peer ID/public key por instancia",
      "replication.ts — crear incidente y cambios de estado viajan al resto",
      "diagnostics.ts — node, peers conectados, AI local, backend none; datos reales",
      "Si no hay peers: ISOLATED. El reporte queda pending y se procesa igual con QVAC",
    ],
  },
  {
    id: "ui",
    name: "UI",
    role: "Herramienta de emergencia: sobria, alto contraste, poca ornamentación.",
    items: [
      "Reporter: Home → Report Emergency, My Reports, Network",
      "Responder: Dashboard → Incidents, Incident Detail, Network",
      "Overview con conteos CRITICAL / HIGH / MEDIUM / LOW",
      "React, TypeScript, Tailwind, shadcn/ui, Lucide. Componentes pequeños",
    ],
  },
];

export const demoSteps: DemoStep[] = [
  {
    step: 1,
    title: "Mostrar el runtime",
    action: "Abrir Network Diagnostics en ambas instancias, en una sola laptop.",
    show: "AI LOCAL ✓   P2P CONNECTED ✓   CENTRAL SERVER NONE",
  },
  {
    step: 2,
    title: "El Reporter escribe",
    action:
      "En Peer A: “Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.”",
    show: "Analyzing locally…  —  QVAC procesa en el dispositivo.",
  },
  {
    step: 3,
    title: "Sale el incidente",
    action: "Validar JSON y persistir. Mostrar la tarjeta, no el prompt.",
    show: "CRITICAL · Av. Grau 120 · 3 affected · 1 trapped · Medical emergency · Needs: Rescue, Medical",
  },
  {
    step: 4,
    title: "El Responder lo recibe",
    action: "Peer B, sin refrescar a mano ni pasar por un servidor propio.",
    show: "NEW CRITICAL INCIDENT en el dashboard, arriba de la lista.",
  },
  {
    step: 5,
    title: "Diagnóstico real",
    action: "Abrir Network un momento. Leer IDs del runtime.",
    show: "Peer A 7A82…  ·  Peer B D19F…  ·  Connected ✓",
  },
  {
    step: 6,
    title: "Cerrar Peer A",
    action: "Matar el proceso del reporter por completo.",
    show: "Peer A CLOSED",
  },
  {
    step: 7,
    title: "El incidente permanece",
    action: "Peer B sigue mostrando el mismo incidente.",
    show: "Incident #42 — The original reporter is gone. The incident isn't.",
  },
];

export const phases: Phase[] = [
  {
    id: "fase-0",
    index: 0,
    name: "Skeleton",
    headline: "UX visible el primer día. Roles, pantallas y un incidente falso.",
    why: "El PRD exige una versión entregable en todo momento. Sin skeleton no hay demo que mostrar si QVAC o Pear se atrasan.",
    outcome:
      "Una app desktop con selector de rol, navegación del Reporter y del Responder, dashboard con conteos y un incidente hardcodeado.",
    deliverables: [
      "Shell desktop (React + TypeScript + Tailwind + shadcn/ui)",
      "Selector Reporter / Responder al iniciar, sin login",
      "Navegación de ambos roles y un incidente fake en el dashboard",
    ],
    acceptance: [
      "Se abre en desktop y se elige un rol sin cuenta.",
      "El Responder ve Situation Overview y una lista (aunque sea fake).",
      "El Reporter ve Report Emergency, My Reports y Network como pantallas, aunque todavía no procesen.",
      "La UI se siente herramienta de emergencia: sobria, alto contraste, sin estética Web3.",
    ],
    tasks: [
      {
        id: "0-1",
        title: "Levantar el skeleton desktop",
        detail:
          "App laptop, no móvil. React, TypeScript, Tailwind, shadcn/ui, Lucide. Carpetas separadas: domain, qvac, p2p, storage, features/ui. Sin librerías de más.",
        owner: "UI",
        effort: "M",
        priority: "crítica",
      },
      {
        id: "0-2",
        title: "Selector de rol al iniciar",
        detail:
          "Reporter o Responder. Sin autenticación. El rol vive en la instancia, no en un usuario. Cada proceso de demo elige el suyo.",
        owner: "UI",
        effort: "S",
        priority: "crítica",
        dependsOn: ["0-1"],
      },
      {
        id: "0-3",
        title: "Navegación del Reporter",
        detail: "Home con Report Emergency, My Reports y Network. Pantallas presentes aunque el submit todavía no llame a QVAC.",
        owner: "UI",
        effort: "S",
        priority: "crítica",
        dependsOn: ["0-2"],
      },
      {
        id: "0-4",
        title: "Dashboard del Responder con incidente fake",
        detail:
          "Situation Overview (CRITICAL / HIGH / MEDIUM / LOW), lista ordenada por prioridad y fecha, y detalle con Acknowledge / Start response / Resolve. Un incidente temporal basta para ver la UX.",
        owner: "UI",
        effort: "M",
        priority: "crítica",
        dependsOn: ["0-2"],
      },
      {
        id: "0-5",
        title: "Fijar el tipo Incident en domain",
        detail:
          "El type del PRD: id, createdAt, createdByPeerId, rawReport, priority, status, location, affectedPeople, trappedPeople, medicalEmergency, needs, summary, syncStatus. UI y fake data ya lo usan. QVAC y Pear no inventan otro shape.",
        owner: "Domain",
        effort: "S",
        priority: "crítica",
        dependsOn: ["0-1"],
      },
    ],
  },
  {
    id: "fase-1",
    index: 1,
    name: "QVAC Crisis Copilot",
    headline: "Texto real → QVAC local → JSON válido → incidente persistido → dashboard.",
    why: "Aquí nace la submission QVAC + General. Si Pear no llega, esto se presenta como Local Crisis Intelligence Copilot. No se cancela el proyecto.",
    outcome:
      "Un Reporter escribe un reporte natural, QVAC lo estructura en el dispositivo, el Responder de la misma instancia (o al reabrir) ve el incidente de verdad.",
    deliverables: [
      "Cliente QVAC local + prompt + schema + parser",
      "Flujo Report Emergency con Analyzing locally…",
      "Persistencia local que sobrevive al reinicio",
      "Dashboard alimentado por incidentes reales",
    ],
    acceptance: [
      "El usuario escribe texto real, no un fixture.",
      "QVAC procesa en local. Cero API cloud en el camino principal.",
      "El JSON pasa el schema. Si no, retry once; si falla, fallback a revisión manual.",
      "El incidente aparece con prioridad, ubicación, afectados, atrapados, médico, needs y summary.",
      "Cerrar y abrir la app recupera el incidente.",
    ],
    tasks: [
      {
        id: "1-1",
        title: "Schema y parser estrictos",
        detail:
          "QVAC no responde prosa al frontend. Validar priority, needs (solo la taxonomía), medicalEmergency, números y summary. Retry una vez. Segunda falla → pantalla de revisión manual.",
        owner: "QVAC",
        effort: "M",
        priority: "crítica",
        dependsOn: ["0-5"],
      },
      {
        id: "1-2",
        title: "Prompt de extracción operacional",
        detail:
          "Interpretar texto libre; extraer ubicación textual; estimar afectados; detectar atrapados; marcar emergencia médica; clasificar needs; asignar priority (critical/high/medium/low según las reglas del PRD); producir un resumen corto.",
        owner: "QVAC",
        effort: "M",
        priority: "crítica",
        dependsOn: ["1-1"],
      },
      {
        id: "1-3",
        title: "Cliente QVAC local",
        detail:
          "client.ts habla con QVAC en el dispositivo. Sin OpenAI, Anthropic ni proxy cloud. La UI muestra Processing: Local y External AI API: None con datos reales del runtime.",
        owner: "QVAC",
        effort: "L",
        priority: "crítica",
        dependsOn: ["1-2"],
      },
      {
        id: "1-4",
        title: "Report Emergency de punta a punta",
        detail:
          "Texto → Analyzing locally… → tarjeta de incidente → guardar. Incluir el ejemplo de Av. Grau 120 como caso de prueba, no como único input.",
        owner: "UI",
        effort: "M",
        priority: "crítica",
        dependsOn: ["1-3"],
      },
      {
        id: "1-5",
        title: "Persistencia local por instancia",
        detail:
          "storage propio. Close → open → los incidentes siguen. Sin DB externa. El fake de Fase 0 se retira o queda claramente marcado como seed de demo.",
        owner: "Storage",
        effort: "M",
        priority: "crítica",
        dependsOn: ["0-5"],
      },
      {
        id: "1-6",
        title: "Dashboard y My Reports sobre datos reales",
        detail:
          "Conteos por prioridad, lista por prioridad+fecha, detalle completo, My Reports con syncStatus (local/pending hasta que exista Pear). El Responder ya puede Acknowledge / Start response / Resolve en local.",
        owner: "UI",
        effort: "M",
        priority: "crítica",
        dependsOn: ["1-4", "1-5"],
      },
    ],
  },
  {
    id: "fase-2",
    index: 2,
    name: "Pear / RescueMesh",
    headline: "Dos procesos, dos stores, dos Peer IDs. El incidente viaja. El estado también.",
    why: "Esto convierte el copilot local en RescueMesh y habilita el track Pears. La prueba reina: cerrar al reporter y que el incidente siga en el responder.",
    outcome:
      "Peer A (Reporter) y Peer B (Responder) independientes. Crear incidente replica. Cambiar estado replica. Network Diagnostics lee el runtime.",
    deliverables: [
      "Identidad Pear por instancia",
      "Replicación de incidentes y de cambios de estado",
      "Estados de red: isolated → pending → synchronizing → synced",
      "Panel Network con datos reales",
    ],
    acceptance: [
      "Dos instancias en una laptop, storage-a y storage-b, Peer IDs distintos.",
      "Peer A crea un incidente y aparece en Peer B.",
      "Peer B cambia el estado y Peer A lo recibe.",
      "Al cerrar Peer A, Peer B conserva el incidente.",
      "Si no hay peers, el reporte se procesa igual, queda pending y la UI dice ISOLATED.",
    ],
    tasks: [
      {
        id: "2-1",
        title: "Instancias independientes",
        detail:
          "Cada proceso tiene storage propio, identidad propia y Peer ID/public key distinta. Documentar cómo levantar Peer A y Peer B en una laptop. Nada de store compartido 'para que el demo funcione'.",
        owner: "P2P",
        effort: "M",
        priority: "crítica",
        dependsOn: ["1-5"],
      },
      {
        id: "2-2",
        title: "Discovery, conexión e intercambio",
        detail:
          "Usar las herramientas del ecosistema Pear para discovery, conexión, intercambio y replicación. Topología peer ↔ peer. Prohibido Peer → RescueMesh API → DB → Peer.",
        owner: "P2P",
        effort: "L",
        priority: "crítica",
        dependsOn: ["2-1"],
      },
      {
        id: "2-3",
        title: "Replicar creación de incidentes",
        detail:
          "Peer A crea Incident #42. Peer B lo recibe. Si hay Peer C, B y C lo conservan. El originador queda en createdByPeerId.",
        owner: "P2P",
        effort: "L",
        priority: "crítica",
        dependsOn: ["2-2", "1-4"],
      },
      {
        id: "2-4",
        title: "Replicar cambios de estado",
        detail:
          "Acknowledge, Start response y Resolve en el Responder se propagan. NEW → ACKNOWLEDGED → IN_PROGRESS → RESOLVED es la única máquina. Los peers no inventan estados.",
        owner: "P2P",
        effort: "M",
        priority: "crítica",
        dependsOn: ["2-3"],
      },
      {
        id: "2-5",
        title: "Estado aislado y cola de sync",
        detail:
          "Sin peers: NETWORK STATUS ISOLATED, el reporte se guarda con QVAC y syncStatus pending. Al aparecer un peer: pending → synchronizing → synced. Copy del PRD, no inventar otro mensaje.",
        owner: "P2P",
        effort: "M",
        priority: "alta",
        dependsOn: ["2-2"],
      },
      {
        id: "2-6",
        title: "Network Diagnostics de runtime",
        detail:
          "Node (Peer ID real), connected peers con estado, AI: QVAC LOCAL, Central backend: NONE. Cero IDs hardcodeados. Si no hay peers, el panel lo dice.",
        owner: "P2P",
        effort: "M",
        priority: "crítica",
        dependsOn: ["2-2"],
      },
    ],
  },
  {
    id: "fase-3",
    index: 3,
    name: "Demo Reliability",
    headline: "La demo se graba una vez y no se rompe en el minuto 3.",
    why: "El PRD reserva una fase solo para que QVAC, Pear y la UI no improvisen en vivo. Un copilot lento o un Peer ID inventado queman el pitch.",
    outcome:
      "Modelo precargado, errores visibles, logs limpios, indicadores P2P reales y layout listo para OBS. El flujo de 7 pasos se puede repetir.",
    deliverables: [
      "Precarga de QVAC y manejo de latencia",
      "Errores y fallbacks visibles",
      "Guion de demo + layout OBS",
      "Pruebas de credibilidad: QVAC local, Pear real, storage partido, replicación al cerrar A",
    ],
    acceptance: [
      "El ejemplo de Av. Grau 120 produce CRITICAL con rescue + medical de forma estable.",
      "Network Diagnostics no usa fixtures.",
      "Cerrar Peer A no borra el incidente en Peer B.",
      "Si Pear no está listo, existe grabación fallback Report → QVAC → Dashboard, presentada como Local Crisis Intelligence Copilot.",
    ],
    tasks: [
      {
        id: "3-1",
        title: "Precargar QVAC y eliminar sorpresas de latencia",
        detail:
          "El modelo debe estar listo antes de grabar. Mostrar Analyzing locally… de verdad. Evitar el primer request en frío durante el pitch.",
        owner: "QVAC",
        effort: "M",
        priority: "crítica",
        dependsOn: ["1-3"],
      },
      {
        id: "3-2",
        title: "Error handling y logs limpios",
        detail:
          "JSON inválido, QVAC caído, peer caído, store corrupto: cada uno tiene UI y log. Sin stack traces en la pantalla de emergencia.",
        owner: "Demo",
        effort: "M",
        priority: "alta",
        dependsOn: ["1-1", "2-5"],
      },
      {
        id: "3-3",
        title: "Layout listo para OBS",
        detail:
          "Dos ventanas lado a lado en una laptop: Reporter | Responder. Tipografía grande, poco ruido, contraste alto. Cabe en 1080p sin scroll de pánico.",
        owner: "UI",
        effort: "S",
        priority: "alta",
        dependsOn: ["1-6"],
      },
      {
        id: "3-4",
        title: "Ensayar el flujo de 7 pasos",
        detail:
          "Runtime → texto Grau 120 → tarjeta CRITICAL → aparece en B → diagnostics → matar A → B conserva el incidente. Narración: The original reporter is gone. The incident isn't.",
        owner: "Demo",
        effort: "M",
        priority: "crítica",
        dependsOn: ["2-3", "2-6", "3-1"],
      },
      {
        id: "3-5",
        title: "Grabar el fallback si Pear no está",
        detail:
          "No cancelar. Grabar Report → QVAC → Incident → Dashboard. Presentar QVAC + General. El one-liner se acorta a inteligencia local, no a red mágica.",
        owner: "Demo",
        effort: "S",
        priority: "alta",
        dependsOn: ["1-6"],
      },
    ],
  },
  {
    id: "fase-4",
    index: 4,
    name: "Stretch goals",
    headline: "Solo si el núcleo ya funciona de punta a punta.",
    why: "El PRD es explícito: audio, traducción, deduplicación y tercer peer no se tocan hasta que QVAC + persistencia + (idealmente) Pear estén sólidos.",
    outcome:
      "Como máximo, una o dos extensiones que entren en el demo sin poner en riesgo el must-have.",
    deliverables: [
      "Audio → transcripción local → QVAC (opcional)",
      "ES → resumen operacional EN (opcional)",
      "Deduplicación probable (opcional)",
      "Tercer peer Citizen / Brigade / Command (opcional)",
    ],
    acceptance: [
      "Ningún stretch se mergea si rompe el flujo de Av. Grau 120.",
      "Deduplicación sugiere equivalentes; no borra incidentes en silencio.",
      "El tercer peer tiene store e identidad propios, igual que A y B.",
    ],
    tasks: [
      {
        id: "4-1",
        title: "Audio a incidente",
        detail:
          "Audio → transcripción local → QVAC → Incident. La transcripción también es local. No usar un STT cloud.",
        owner: "QVAC",
        effort: "L",
        priority: "media",
        dependsOn: ["3-4"],
      },
      {
        id: "4-2",
        title: "Traducción operacional",
        detail:
          "Entrada en español, resumen operacional estándar en inglés para el dashboard. El rawReport se conserva en el idioma original.",
        owner: "QVAC",
        effort: "M",
        priority: "media",
        dependsOn: ["1-2"],
      },
      {
        id: "4-3",
        title: "Deduplicación probable",
        detail:
          "Detectar reportes probablemente equivalentes (misma zona, mismos afectados, minutos de diferencia). Mostrarlos como likely duplicates, no fusionarlos a ciegas.",
        owner: "Domain",
        effort: "M",
        priority: "media",
        dependsOn: ["1-6"],
      },
      {
        id: "4-4",
        title: "Tercer peer",
        detail:
          "Citizen ↔ Brigade ↔ Command Center. Tres procesos, tres stores, tres IDs. Solo para el demo Excellent.",
        owner: "P2P",
        effort: "M",
        priority: "media",
        dependsOn: ["2-4"],
      },
    ],
  },
];

export const risks: Risk[] = [
  {
    id: "r1",
    title: "Pear no llega a tiempo",
    level: "alto",
    signal: "Discovery inestable, una sola instancia 'simulando' dos peers, o la tentación de un servidor propio.",
    mitigation:
      "Progressive enhancement. Se entrega QVAC + General como Local Crisis Intelligence Copilot. No se inventa un backend RescueMesh para tapar el hueco.",
  },
  {
    id: "r2",
    title: "QVAC no cumple el schema",
    level: "alto",
    signal: "Prosa en el frontend, needs inventadas, prioridad ausente, o un parse 'best effort' que inventa atrapados.",
    mitigation:
      "Schema fijo, retry once, fallback a revisión manual. El incidente no se persiste si el JSON no valida.",
  },
  {
    id: "r3",
    title: "Afirmar que funciona sin conectividad absoluta",
    level: "alto",
    signal: "Copy tipo 'works with absolutely no connectivity' o demo que esconde ISOLATED.",
    mitigation:
      "Usar la frase del PRD: se elimina la dependencia de servidores centrales y de AI cloud. Sin canal físico, se procesa local, se espera y se sincroniza después.",
  },
  {
    id: "r4",
    title: "Diagnósticos hardcodeados",
    level: "alto",
    signal: "Peer IDs fijos en el JSX, '2 peers connected' sin runtime, o QVAC LOCAL pintado a mano.",
    mitigation:
      "diagnostics.ts lee el runtime. Si no hay dato, se muestra vacío o isolated. Mentir en el panel quema el track.",
  },
  {
    id: "r5",
    title: "Un solo storage para dos ventanas",
    level: "alto",
    signal: "El incidente 'replica' porque ambas UIs leen el mismo disco.",
    mitigation:
      "storage-a y storage-b obligatorios. La prueba de cerrar A solo es válida si los stores son distintos.",
  },
  {
    id: "r6",
    title: "Alcance que se fuga del MVP",
    level: "medio",
    signal: "Login, mapa, GPS, blockchain, móvil, LoRa, Firebase 'solo para el demo'.",
    mitigation:
      "La lista de la sección 28 es no negociable. Si no está en las fases 0–3, no entra hasta que el núcleo esté perfecto.",
  },
  {
    id: "r7",
    title: "Modelo frío en el minuto del pitch",
    level: "medio",
    signal: "Analyzing locally… se queda colgado o el primer reporte tarda de más.",
    mitigation:
      "Precargar QVAC en Fase 3. Ensayar el texto de Av. Grau 120 hasta que sea aburrido.",
  },
  {
    id: "r8",
    title: "Posicionarlo como reemplazo de WhatsApp",
    level: "bajo",
    signal: "Pitch que ataca al chat en vez de a los 847 unread messages sin priorizar.",
    mitigation:
      "WhatsApp communicates. RescueMesh coordinates. La comunicación puede seguir en herramientas existentes.",
  },
];

export function allTasks(): Task[] {
  return phases.flatMap((phase) => phase.tasks);
}

export function taskById(id: string): Task | undefined {
  return allTasks().find((task) => task.id === id);
}

export function phaseById(id: string): Phase | undefined {
  return phases.find((phase) => phase.id === id);
}

export function phaseForTask(taskId: string): Phase | undefined {
  return phases.find((phase) => phase.tasks.some((task) => task.id === taskId));
}

export const totals = {
  phases: phases.length,
  tasks: allTasks().length,
  roles: plan.roles.length,
  risks: risks.length,
};
