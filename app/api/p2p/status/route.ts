import { getPeerService } from "@/p2p/peer-service";

export const runtime = "nodejs";

export async function GET() {
  const peer = await getPeerService();
  return Response.json(peer.getDiagnostics());
}
