import { getPeerService } from "@/p2p/peer-service";
import type { Incident } from "@/domain/incident";

export const runtime = "nodejs";

export async function GET() {
  const peer = await getPeerService();
  const incidents = await peer.listIncidents();
  return Response.json({ incidents });
}

export async function POST(request: Request) {
  const peer = await getPeerService();
  const body = (await request.json()) as { incident?: Incident };

  if (!body.incident || typeof body.incident.id !== "string") {
    return Response.json({ error: "incident es requerido." }, { status: 400 });
  }

  const saved = await peer.upsertIncident(body.incident);
  return Response.json({ incident: saved });
}
