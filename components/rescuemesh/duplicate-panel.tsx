"use client";

import Link from "next/link";
import type { Incident } from "@/domain/incident";
import { duplicateIdsFor, findLikelyDuplicates } from "@/domain/dedup";

export function DuplicatePanel({ incidents }: { incidents: Incident[] }) {
  const links = findLikelyDuplicates(incidents);
  if (links.length === 0) return null;

  const seen = new Set<string>();
  const pairs: { a: Incident; b: Incident; reason: string }[] = [];

  for (const link of links) {
    const key = [link.incidentId, link.relatedId].sort().join(":");
    if (seen.has(key)) continue;
    seen.add(key);
    const a = incidents.find((item) => item.id === link.incidentId);
    const b = incidents.find((item) => item.id === link.relatedId);
    if (a && b) pairs.push({ a, b, reason: link.reason });
  }

  return (
    <section className="rounded-xl border border-violet-800/50 bg-violet-950/20 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
        Likely duplicates
      </p>
      <p className="mt-1 text-sm text-violet-100/80">
        Posibles reportes equivalentes. No se fusionan automáticamente — revisa manualmente.
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {pairs.map(({ a, b, reason }) => (
          <li
            key={`${a.id}-${b.id}`}
            className="rounded-lg border border-violet-900/40 bg-slate-950/40 px-3 py-2"
          >
            <p className="font-mono text-violet-200">
              <Link href={`/responder/incidents/${a.id}`} className="underline">
                {a.id}
              </Link>
              {" ↔ "}
              <Link href={`/responder/incidents/${b.id}`} className="underline">
                {b.id}
              </Link>
            </p>
            <p className="mt-1 text-xs text-violet-200/70">{reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DuplicateBadge({
  incidentId,
  incidents,
}: {
  incidentId: string;
  incidents: Incident[];
}) {
  const related = duplicateIdsFor(incidentId, findLikelyDuplicates(incidents));
  if (related.length === 0) return null;

  return (
    <span className="rounded bg-violet-900/60 px-2 py-0.5 text-xs font-semibold text-violet-200">
      Likely duplicate ({related.length})
    </span>
  );
}
