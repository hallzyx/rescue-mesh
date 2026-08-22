"use client";

import { countByPriority } from "@/domain/incident";
import { IncidentCard } from "@/components/rescuemesh/incident-card";
import { useIncidents } from "@/lib/incident-store";

export default function ResponderDashboardPage() {
  const { incidents } = useIncidents();
  const counts = countByPriority(incidents);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Situation Overview
        </p>
        <h2 className="mt-1 text-3xl font-bold text-slate-50">RESCUEMESH</h2>
      </section>

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
        <div className="grid gap-3">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              href={`/responder/incidents/${incident.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
