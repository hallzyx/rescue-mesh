"use client";

import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import {
  dismissSystemError,
  getSystemErrors,
  subscribeSystemErrors,
} from "@/lib/system-errors";

export function SystemBanner() {
  const errors = useSyncExternalStore(subscribeSystemErrors, getSystemErrors, () => []);

  if (errors.length === 0) return null;

  return (
    <div className="space-y-2">
      {errors.map((error) => (
        <div
          key={error.id}
          className={
            error.severity === "error"
              ? "flex items-start justify-between gap-3 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-100"
              : "flex items-start justify-between gap-3 rounded-lg border border-amber-900/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
          }
        >
          <div>
            <p className="font-semibold">{error.title}</p>
            <p className="mt-1 text-xs opacity-90">{error.message}</p>
          </div>
          <button
            type="button"
            className="rounded p-1 opacity-70 hover:opacity-100"
            onClick={() => dismissSystemError(error.id)}
            aria-label="Cerrar aviso"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
