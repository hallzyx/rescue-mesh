import type { Incident } from "@/domain/incident";

export async function fetchP2PStatus() {
  const response = await fetch("/api/p2p/status", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("No se pudo obtener el estado P2P.");
  }
  return response.json() as Promise<{
    peerId: string;
    publicKey: string;
    connectedCount: number;
    isolated: boolean;
    connectedPeers: { peerId: string; publicKey: string; status: string }[];
  }>;
}

export async function pullP2PIncidents(): Promise<Incident[]> {
  const response = await fetch("/api/p2p/incidents", { cache: "no-store" });
  if (!response.ok) return [];
  const payload = (await response.json()) as { incidents?: Incident[] };
  return payload.incidents ?? [];
}

export async function publishP2PIncident(incident: Incident): Promise<Incident | null> {
  const response = await fetch("/api/p2p/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incident }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { incident?: Incident };
  return payload.incident ?? null;
}
