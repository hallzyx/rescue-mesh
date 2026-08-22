"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  compareIncidents,
  SEED_INCIDENTS,
  type Incident,
  type IncidentStatus,
} from "@/domain/incident";
import type { QvacExtraction } from "@/qvac/schema";

const STORAGE_KEY = "rescuemesh-incidents-v1";
const SEEDED_KEY = "rescuemesh-seeded-v1";

const listeners = new Set<() => void>();
let snapshot: Incident[] = SEED_INCIDENTS;

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
    syncStatus: "local",
  };
}

export function useIncidents() {
  const incidents = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const sorted = useMemo(() => [...incidents].sort(compareIncidents), [incidents]);

  const updateStatus = useCallback((id: string, status: IncidentStatus) => {
    const next = getSnapshot().map((incident) =>
      incident.id === id ? { ...incident, status } : incident,
    );
    writeIncidents(next);
  }, []);

  const addIncident = useCallback((incident: Incident) => {
    writeIncidents([incident, ...getSnapshot()]);
  }, []);

  const getById = useCallback(
    (id: string) => incidents.find((incident) => incident.id === id),
    [incidents],
  );

  return { incidents: sorted, updateStatus, addIncident, getById };
}
