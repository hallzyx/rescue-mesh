import type { Incident } from "./incident";

const WINDOW_MS = 30 * 60 * 1000;

export type DuplicateLink = {
  incidentId: string;
  relatedId: string;
  reason: string;
};

function normalizeLocation(location?: string): string {
  return (location ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function locationsMatch(a?: string, b?: string): boolean {
  const left = normalizeLocation(a);
  const right = normalizeLocation(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function timeClose(a: Incident, b: Incident): boolean {
  const diff = Math.abs(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return diff <= WINDOW_MS;
}

function affectedMatch(a: Incident, b: Incident): boolean {
  if (a.affectedPeople != null && b.affectedPeople != null) {
    return a.affectedPeople === b.affectedPeople;
  }
  return a.trappedPeople === b.trappedPeople && (a.trappedPeople ?? 0) > 0;
}

export function isLikelyDuplicate(a: Incident, b: Incident): boolean {
  if (a.id === b.id) return false;
  if (!timeClose(a, b)) return false;
  if (!locationsMatch(a.location, b.location)) return false;
  return affectedMatch(a, b);
}

export function findLikelyDuplicates(incidents: Incident[]): DuplicateLink[] {
  const links: DuplicateLink[] = [];

  for (let i = 0; i < incidents.length; i++) {
    for (let j = i + 1; j < incidents.length; j++) {
      const a = incidents[i];
      const b = incidents[j];
      if (!isLikelyDuplicate(a, b)) continue;

      const reason = `Same area (${a.location ?? b.location}), similar impact, within 30 minutes`;
      links.push({ incidentId: a.id, relatedId: b.id, reason });
      links.push({ incidentId: b.id, relatedId: a.id, reason });
    }
  }

  return links;
}

export function duplicateIdsFor(incidentId: string, links: DuplicateLink[]): string[] {
  return [...new Set(links.filter((link) => link.incidentId === incidentId).map((l) => l.relatedId))];
}
