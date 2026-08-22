import Link from "next/link";
import { NEED_LABELS, type Incident } from "@/domain/incident";
import { PriorityBadge } from "@/components/rescuemesh/priority-badge";
import { StatusBadge } from "@/components/rescuemesh/status-badge";
import { Card, CardContent } from "@/components/ui/card";

function IncidentBody({ incident }: { incident: Incident }) {
  return (
    <CardContent className="space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={incident.priority} />
        <StatusBadge status={incident.status} />
        <span className="ml-auto font-mono text-xs text-slate-500">{incident.id}</span>
      </div>
      <div>
        <p className="font-medium text-slate-100">{incident.location ?? "Unknown location"}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-400">{incident.summary}</p>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        {incident.affectedPeople != null ? (
          <span>{incident.affectedPeople} affected</span>
        ) : null}
        {incident.trappedPeople ? <span>{incident.trappedPeople} trapped</span> : null}
        {incident.medicalEmergency ? (
          <span className="text-red-400">Medical emergency</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {incident.needs.map((need) => (
          <span key={need} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
            {NEED_LABELS[need]}
          </span>
        ))}
      </div>
    </CardContent>
  );
}

export function IncidentCard({ incident, href }: { incident: Incident; href: string }) {
  return (
    <Link href={href}>
      <Card className="border-slate-800 bg-slate-900/60 transition-colors hover:border-slate-600 hover:bg-slate-900">
        <IncidentBody incident={incident} />
      </Card>
    </Link>
  );
}

export function IncidentListItem({ incident }: { incident: Incident }) {
  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <IncidentBody incident={incident} />
    </Card>
  );
}
