"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { compareIncidents, SEED_INCIDENTS, type Incident, type IncidentStatus } from "@/domain/incident";
import type { QvacExtraction } from "@/qvac/schema";
import { mergeIncidentLists } from "@/p2p/merge";
import { publishP2PIncident, pullP2PIncidents } from "@/p2p/client";
import { pushSystemError } from "@/lib/system-errors";

const STORAGE_KEY = "rescuemesh-incidents-v1";
const SEEDED_KEY = "rescuemesh-seeded-v1";

const listeners = new Set<() => void>();
let snapshot: Incident[] = SEED_INCIDENTS;
let syncStarted = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function ensureSeed(): Incident[] {
  if (typeof window === "undefined") return SEED_INCIDENTS;
  const seeded = window.localStorage.getItem(SEEDED_KEY);
  if (!seeded) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INCIDENTS));
    window.localStorage.setItem(SEEDED_KEY, "1");
    return SEED_INCIDENTS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_INCIDENTS;
    const parsed = JSON.parse(raw) as Incident[];
    return Array.isArray(parsed) ? parsed : SEED_INCIDENTS;
  } catch {
    pushSystemError({
      title: "Almacenamiento local dañado",
      message:
        "No se pudieron leer los incidentes guardados. Se restauró el estado inicial de demo.",
      severity: "warning",
    });
    window.localStorage.removeItem(STORAGE_KEY);
    return SEED_INCIDENTS;
  }
}

function readIncidents(): Incident[] {
  if (typeof window === "undefined") return SEED_INCIDENTS;
  return ensureSeed();
}

function getSnapshot(): Incident[] {
  if (typeof window !== "undefined") {
    snapshot = readIncidents();
  }
  return snapshot;
}

function getServerSnapshot(): Incident[] {
  return SEED_INCIDENTS;
}

function writeIncidents(incidents: Incident[]) {
  snapshot = incidents;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    window.localStorage.setItem(SEEDED_KEY, "1");
  }
  emit();
}

function createId(): string {
  return `inc-${Date.now().toString(36)}`;
}

async function syncFromP2P() {
  try {
    const remote = await pullP2PIncidents();
    if (remote.length === 0) return;
    const merged = mergeIncidentLists(getSnapshot(), remote);
    writeIncidents(merged);
  } catch {
    pushSystemError({
      title: "Sincronización P2P interrumpida",
      message: "Los incidentes locales siguen disponibles. El mesh se reintentará automáticamente.",
      severity: "warning",
    });
  }
}

function startP2PSync() {
  if (syncStarted || typeof window === "undefined") return;
  syncStarted = true;
  void syncFromP2P();
  window.setInterval(() => {
    void syncFromP2P();
  }, 2000);
}

export function buildIncident({
  rawReport,
  createdByPeerId,
  extraction,
}: {
  rawReport: string;
  createdByPeerId: string;
  extraction: QvacExtraction;
}): Incident {
  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    createdByPeerId,
    rawReport,
    priority: extraction.priority,
    status: "new",
    location: extraction.location,
    affectedPeople: extraction.affectedPeople,
    trappedPeople: extraction.trappedPeople,
    medicalEmergency: extraction.medicalEmergency,
    needs: extraction.needs,
    summary: extraction.summary,
    syncStatus: "pending",
  };
}

export function useIncidents() {
  const incidents = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    startP2PSync();
  }, []);

  const sorted = useMemo(() => [...incidents].sort(compareIncidents), [incidents]);

  const updateStatus = useCallback((id: string, status: IncidentStatus) => {
    const next = getSnapshot().map((incident) =>
      incident.id === id ? { ...incident, status } : incident,
    );
    writeIncidents(next);
    const updated = next.find((incident) => incident.id === id);
    if (updated) {
      void publishP2PIncident(updated).then((saved) => {
        if (!saved) return;
        const synced = getSnapshot().map((incident) =>
          incident.id === saved.id ? saved : incident,
        );
        writeIncidents(synced);
      });
    }
  }, []);

  const addIncident = useCallback((incident: Incident) => {
    writeIncidents([incident, ...getSnapshot()]);
    void publishP2PIncident(incident).then((saved) => {
      if (!saved) return;
      const synced = getSnapshot().map((item) => (item.id === saved.id ? saved : item));
      if (!synced.some((item) => item.id === saved.id)) {
        writeIncidents([saved, ...synced]);
        return;
      }
      writeIncidents(synced);
    });
  }, []);

  const getById = useCallback(
    (id: string) => incidents.find((incident) => incident.id === id),
    [incidents],
  );

  return { incidents: sorted, updateStatus, addIncident, getById };
}
