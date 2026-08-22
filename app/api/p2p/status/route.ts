import { jsonWithCors, optionsWithCors } from "@/lib/cors";
import { getPeerService } from "@/p2p/peer-service";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return optionsWithCors(request);
}

export async function GET(request: Request) {
  const peer = await getPeerService();
  return jsonWithCors(request, peer.getDiagnostics());
}
