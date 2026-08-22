export const NEED_TYPES = [
  "rescue",
  "medical",
  "water",
  "food",
  "shelter",
  "medicine",
  "transport",
  "infrastructure",
  "other",
] as const;

export type NeedType = (typeof NEED_TYPES)[number];

export const PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ["new", "acknowledged", "in_progress", "resolved"] as const;
export type IncidentStatus = (typeof STATUSES)[number];

export const SYNC_STATUSES = ["local", "pending", "synced"] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export type Incident = {
  id: string;
  createdAt: string;
  createdByPeerId: string;
  rawReport: string;
  priority: Priority;
  status: IncidentStatus;
  location?: string;
  affectedPeople?: number;
  trappedPeople?: number;
  medicalEmergency: boolean;
  needs: NeedType[];
  summary: string;
  syncStatus: SyncStatus;
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  new: "NEW",
  acknowledged: "ACKNOWLEDGED",
  in_progress: "IN PROGRESS",
  resolved: "RESOLVED",
};

export const NEED_LABELS: Record<NeedType, string> = {
  rescue: "Rescue",
  medical: "Medical",
  water: "Water",
  food: "Food",
  shelter: "Shelter",
  medicine: "Medicine",
  transport: "Transport",
  infrastructure: "Infrastructure",
  other: "Other",
};

export function compareIncidents(a: Incident, b: Incident): number {
  const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (byPriority !== 0) return byPriority;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function countByPriority(incidents: Incident[]): Record<Priority, number> {
  return incidents.reduce(
    (acc, incident) => {
      acc[incident.priority] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}

export const SEED_INCIDENTS: Incident[] = [
  {
    id: "inc-42",
    createdAt: "2026-08-22T10:31:00.000Z",
    createdByPeerId: "7A82F1",
    rawReport:
      "Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.",
    priority: "critical",
    status: "new",
    location: "Av. Grau 120",
    affectedPeople: 3,
    trappedPeople: 1,
    medicalEmergency: true,
    needs: ["rescue", "medical"],
    summary: "Partial structural collapse with one trapped person and one injured person.",
    syncStatus: "synced",
  },
  {
    id: "inc-41",
    createdAt: "2026-08-22T10:28:00.000Z",
    createdByPeerId: "B19CA2",
    rawReport: "Necesitamos agua potable para 12 familias en el refugio del colegio San Martín.",
    priority: "medium",
    status: "acknowledged",
    location: "Colegio San Martín",
    affectedPeople: 12,
    trappedPeople: 0,
    medicalEmergency: false,
    needs: ["water", "shelter"],
    summary: "Twelve families at a school shelter need drinking water.",
    syncStatus: "synced",
  },
  {
    id: "inc-40",
    createdAt: "2026-08-22T10:25:00.000Z",
    createdByPeerId: "C77DF3",
    rawReport: "Dos heridos leves en la plaza. Falta botiquín y transporte al centro de salud.",
    priority: "high",
    status: "in_progress",
    location: "Plaza Central",
    affectedPeople: 2,
    trappedPeople: 0,
    medicalEmergency: true,
    needs: ["medical", "transport"],
    summary: "Two non-critical injuries; medical supplies and transport needed.",
    syncStatus: "pending",
  },
  {
    id: "inc-39",
    createdAt: "2026-08-22T10:20:00.000Z",
    createdByPeerId: "D19F04",
    rawReport: "Vía bloqueada por escombros en Av. Los Pinos. Sin personas atrapadas reportadas.",
    priority: "low",
    status: "resolved",
    location: "Av. Los Pinos",
    affectedPeople: 0,
    trappedPeople: 0,
    medicalEmergency: false,
    needs: ["infrastructure", "transport"],
    summary: "Road blocked by debris; no trapped persons reported.",
    syncStatus: "synced",
  },
];
