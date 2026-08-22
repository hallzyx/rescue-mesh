import { jsonWithCors, optionsWithCors } from "@/lib/cors";
import { getPeerService } from "@/p2p/peer-service";
import type { Incident } from "@/domain/incident";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return optionsWithCors(request);
}

export async function GET(request: Request) {
  const peer = await getPeerService();
  const incidents = await peer.listIncidents();
  return jsonWithCors(request, { incidents });
}

export async function POST(request: Request) {
  const peer = await getPeerService();
  const body = (await request.json()) as { incident?: Incident };

  if (!body.incident || typeof body.incident.id !== "string") {
    return jsonWithCors(request, { error: "incident es requerido." }, { status: 400 });
  }

  const saved = await peer.upsertIncident(body.incident);
  return jsonWithCors(request, { incident: saved });
}
