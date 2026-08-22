"use client";

import { countByPriority } from "@/domain/incident";
import { IncidentCard } from "@/components/rescuemesh/incident-card";
import { DuplicatePanel } from "@/components/rescuemesh/duplicate-panel";
import { useIncidents } from "@/lib/incident-store";
import { duplicateIdsFor, findLikelyDuplicates } from "@/domain/dedup";

export default function ResponderDashboardPage() {
  const { incidents } = useIncidents();
  const counts = countByPriority(incidents);
  const duplicateLinks = findLikelyDuplicates(incidents);
  const newestCritical = incidents.find(
    (incident) => incident.priority === "critical" && incident.status === "new",
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Situation Overview
        </p>
        <h2 className="mt-1 text-3xl font-bold text-slate-50 demo-title">RESCUEMESH</h2>
      </section>

      {newestCritical ? (
        <div className="rounded-xl border-2 border-red-600 bg-red-950/40 px-5 py-4 animate-pulse">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">
            New critical incident
          </p>
          <p className="mt-1 text-xl font-bold text-red-100">
            {newestCritical.location ?? "Unknown location"} · {newestCritical.id}
          </p>
          <p className="mt-1 text-sm text-red-200/80">{newestCritical.summary}</p>
        </div>
      ) : null}

      <DuplicatePanel incidents={incidents} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["critical", counts.critical, "text-red-400"],
            ["high", counts.high, "text-orange-400"],
            ["medium", counts.medium, "text-amber-400"],
            ["low", counts.low, "text-slate-400"],
          ] as const
        ).map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-5 text-center"
          >
            <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200">Incidents</h3>
        {incidents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-500">
            No incidents yet. Waiting for P2P sync or local reports.
          </div>
        ) : (
          <div className="grid gap-3">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                href={`/responder/incidents/${incident.id}`}
                duplicateCount={duplicateIdsFor(incident.id, duplicateLinks).length}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
