"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NEED_LABELS } from "@/domain/incident";
import { PriorityBadge } from "@/components/rescuemesh/priority-badge";
import { StatusBadge } from "@/components/rescuemesh/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncidents } from "@/lib/incident-store";

export default function IncidentDetailPage({
  params,
}: PageProps<"/responder/incidents/[id]">) {
  const { id } = use(params);
  const { getById, updateStatus } = useIncidents();
  const incident = getById(id);

  if (!incident) {
    return (
      <div className="space-y-4">
        <p className="text-slate-400">Incident not found.</p>
        <Button variant="outline" render={<Link href="/responder" />}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="text-slate-400 hover:text-slate-200"
        render={<Link href="/responder" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Dashboard
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={incident.priority} />
        <StatusBadge status={incident.status} />
        <span className="font-mono text-sm text-slate-500">{incident.id}</span>
      </div>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-50">
            {incident.location ?? "Unknown location"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Summary</p>
            <p className="mt-1 text-slate-200">{incident.summary}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Affected" value={String(incident.affectedPeople ?? "—")} />
            <Field label="Trapped" value={String(incident.trappedPeople ?? 0)} />
            <Field
              label="Medical emergency"
              value={incident.medicalEmergency ? "Yes" : "No"}
            />
            <Field label="Peer origin" value={incident.createdByPeerId} />
            <Field
              label="Created"
              value={new Date(incident.createdAt).toLocaleString("en-US")}
            />
            <Field label="Sync" value={incident.syncStatus.toUpperCase()} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Needs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {incident.needs.map((need) => (
                <span
                  key={need}
                  className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200"
                >
                  {NEED_LABELS[need]}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Raw report</p>
            <p className="mt-2 rounded-lg border border-slate-800 bg-slate-950 p-4 text-slate-300">
              {incident.rawReport}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
            <Button
              disabled={incident.status !== "new"}
              className="bg-violet-700 hover:bg-violet-600"
              onClick={() => updateStatus(incident.id, "acknowledged")}
            >
              Acknowledge
            </Button>
            <Button
              disabled={incident.status === "resolved" || incident.status === "new"}
              className="bg-amber-700 hover:bg-amber-600"
              onClick={() => updateStatus(incident.id, "in_progress")}
            >
              Start response
            </Button>
            <Button
              disabled={incident.status === "resolved"}
              className="bg-emerald-700 hover:bg-emerald-600"
              onClick={() => updateStatus(incident.id, "resolved")}
            >
              Resolve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-200">{value}</p>
    </div>
  );
}
