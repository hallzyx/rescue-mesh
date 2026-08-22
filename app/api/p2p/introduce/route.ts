import { jsonWithCors, optionsWithCors } from "@/lib/cors";
import { getPeerService } from "@/p2p/peer-service";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return optionsWithCors(request);
}

export async function POST(request: Request) {
  const peer = await getPeerService();
  const body = (await request.json()) as { publicKey?: string };

  if (!body.publicKey || typeof body.publicKey !== "string") {
    return jsonWithCors(request, { error: "publicKey (swarm) es requerido." }, { status: 400 });
  }

  try {
    await peer.introducePeer(body.publicKey);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo introducir el peer.";
    return jsonWithCors(request, { error: message }, { status: 400 });
  }

  return jsonWithCors(request, {
    introduced: true,
    diagnostics: await peer.getDiagnostics(),
  });
}
