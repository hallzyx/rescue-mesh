import { PRIORITY_ORDER, type Incident, type IncidentStatus } from "@/domain/incident";

const STATUS_ORDER: Record<IncidentStatus, number> = {
  new: 0,
  acknowledged: 1,
  in_progress: 2,
  resolved: 3,
};

function syncRank(status: Incident["syncStatus"]): number {
  if (status === "synced") return 2;
  if (status === "pending") return 1;
  return 0;
}

export function mergeIncidents(current: Incident | undefined, incoming: Incident): Incident {
  if (!current) return incoming;

  const statusWinner =
    STATUS_ORDER[current.status] >= STATUS_ORDER[incoming.status] ? current : incoming;
  const syncWinner =
    syncRank(current.syncStatus) >= syncRank(incoming.syncStatus) ? current : incoming;

  return {
    ...statusWinner,
    syncStatus: syncWinner.syncStatus,
    createdAt: current.createdAt < incoming.createdAt ? current.createdAt : incoming.createdAt,
    createdByPeerId: current.createdByPeerId || incoming.createdByPeerId,
    rawReport: current.rawReport || incoming.rawReport,
    location: statusWinner.location ?? incoming.location,
    affectedPeople: statusWinner.affectedPeople ?? incoming.affectedPeople,
    trappedPeople: statusWinner.trappedPeople ?? incoming.trappedPeople,
    medicalEmergency: statusWinner.medicalEmergency || incoming.medicalEmergency,
    needs: statusWinner.needs.length >= incoming.needs.length ? statusWinner.needs : incoming.needs,
    summary: statusWinner.summary || incoming.summary,
    priority:
      PRIORITY_ORDER[current.priority] <= PRIORITY_ORDER[incoming.priority]
        ? current.priority
        : incoming.priority,
  };
}

export function mergeIncidentLists(...lists: Incident[][]): Incident[] {
  const map = new Map<string, Incident>();
  for (const list of lists) {
    for (const incident of list) {
      map.set(incident.id, mergeIncidents(map.get(incident.id), incident));
    }
  }
  return [...map.values()];
}
