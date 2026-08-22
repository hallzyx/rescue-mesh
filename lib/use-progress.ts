"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { allTasks, phases } from "@/lib/plan";

const STORAGE_KEY = "rescuemesh-plan-progress-v1";

type ProgressState = {
  done: string[];
};

const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let snapshot: string[] = EMPTY;
let snapshotKey = "";
let storageError: string | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProgressState;
    const done = Array.isArray(parsed.done)
      ? parsed.done.filter((id) => typeof id === "string")
      : [];
    storageError = null;
    return done;
  } catch {
    storageError = "No se pudo leer el avance guardado.";
    return [];
  }
}

function remember(done: string[]) {
  const key = done.slice().sort().join("|");
  if (key === snapshotKey) return snapshot;
  snapshot = done.length === 0 ? EMPTY : done;
  snapshotKey = key;
  return snapshot;
}

function getSnapshot() {
  return remember(readStorage());
}

function getServerSnapshot() {
  return EMPTY;
}

function writeStorage(done: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ done }));
    storageError = null;
  } catch {
    storageError = "Este navegador no permitió guardar el avance. Puedes seguir marcando, pero se perderá al recargar.";
  }
  remember(done);
  emit();
}

export function useProgress() {
  const doneIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const done = useMemo(() => new Set(doneIds), [doneIds]);

  const toggle = useCallback((id: string) => {
    const next = new Set(doneIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    writeStorage(Array.from(next));
  }, [doneIds]);

  const reset = useCallback(() => {
    writeStorage([]);
  }, []);

  const stats = useMemo(() => {
    const total = allTasks().length;
    const completed = allTasks().filter((task) => done.has(task.id)).length;
    const byPhase = phases.map((phase) => {
      const phaseTotal = phase.tasks.length;
      const phaseDone = phase.tasks.filter((task) => done.has(task.id)).length;
      return {
        id: phase.id,
        done: phaseDone,
        total: phaseTotal,
        percent: phaseTotal === 0 ? 0 : Math.round((phaseDone / phaseTotal) * 100),
      };
    });
    return {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      byPhase,
    };
  }, [done]);

  return {
    done,
    toggle,
    reset,
    hydrated: true,
    error: storageError,
    stats,
  };
}
