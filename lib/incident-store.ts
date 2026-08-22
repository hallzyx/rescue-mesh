"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  compareIncidents,
  SEED_INCIDENTS,
  type Incident,
  type IncidentStatus,
} from "@/domain/incident";

const STORAGE_KEY = "rescuemesh-incidents-v1";

const listeners = new Set<() => void>();
let snapshot: Incident[] = SEED_INCIDENTS;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readIncidents(): Incident[] {
  if (typeof window === "undefined") return SEED_INCIDENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INCIDENTS));
      return SEED_INCIDENTS;
    }
    const parsed = JSON.parse(raw) as Incident[];
    return Array.isArray(parsed) ? parsed : SEED_INCIDENTS;
  } catch {
    return SEED_INCIDENTS;
  }
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
  }
  emit();
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

  const getById = useCallback(
    (id: string) => incidents.find((incident) => incident.id === id),
    [incidents],
  );

  return { incidents: sorted, updateStatus, getById };
}
