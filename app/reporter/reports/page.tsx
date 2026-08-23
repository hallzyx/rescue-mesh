"use client";

import { IncidentListItem } from "@/components/rescuemesh/incident-card";
import { useIncidents } from "@/lib/incident-store";
import { useSyncExternalStore } from "react";
import { getPeerId } from "@/lib/peer-session";

function subscribe() {
  return () => {};
}

export default function MyReportsPage() {
  const peerId = useSyncExternalStore(subscribe, getPeerId, () => "--------");
  const { incidents } = useIncidents();
  const mine = incidents.filter((incident) => incident.createdByPeerId === peerId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-50">My Reports</h2>
        <p className="mt-2 text-slate-400">
          Reports originated by this peer ({peerId}).
        </p>
      </div>

      {mine.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 p-10 text-center text-slate-500">
          No reports from this peer yet. Use Report Emergency to create the first one.
        </div>
      ) : (
        <div className="grid gap-3">
          {mine.map((incident) => (
            <IncidentListItem key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
