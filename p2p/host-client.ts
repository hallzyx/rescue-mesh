export function p2pHostUrl(): string | null {
  // Bracket access so Next does not inline this at build time.
  const value = process.env["RESCUEMESH_P2P_HOST"]?.trim();
  return value || null;
}

async function hostFetch(pathname: string, init?: RequestInit) {
  const base = p2pHostUrl();
  if (!base) throw new Error("RESCUEMESH_P2P_HOST no está configurado.");
  const response = await fetch(`${base}${pathname}`, init);
  const body = await response.json();
  return { ok: response.ok, status: response.status, body };
}

export async function hostStatus() {
  return hostFetch("/status");
}

export async function hostListIncidents() {
  return hostFetch("/incidents");
}

export async function hostUpsertIncident(incident: unknown) {
  return hostFetch("/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incident }),
  });
}

export async function hostIntroduce(publicKey: string) {
  return hostFetch("/introduce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicKey }),
  });
}

export const p2pHostAdapter = {
  async getDiagnostics() {
    const { body, ok } = await hostStatus();
    if (!ok) throw new Error((body as { error?: string }).error ?? "host status failed");
    return body;
  },
  async listIncidents() {
    const { body, ok } = await hostListIncidents();
    if (!ok) throw new Error((body as { error?: string }).error ?? "host list failed");
    return ((body as { incidents?: unknown[] }).incidents ?? []) as import("@/domain/incident").Incident[];
  },
  async upsertIncident(incident: import("@/domain/incident").Incident) {
    const { body, ok } = await hostUpsertIncident(incident);
    if (!ok) throw new Error((body as { error?: string }).error ?? "host upsert failed");
    return (body as { incident: import("@/domain/incident").Incident }).incident;
  },
  async introducePeer(publicKey: string) {
    const { body, ok } = await hostIntroduce(publicKey);
    if (!ok) throw new Error((body as { error?: string }).error ?? "host introduce failed");
    return body;
  },
  isStarted() {
    return true;
  },
};
