import { jsonWithCors, optionsWithCors } from "@/lib/cors";
import { getPeerService } from "@/p2p/peer-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return optionsWithCors(request);
}

export async function GET(request: Request) {
  const peer = await getPeerService();
  return jsonWithCors(request, await peer.getDiagnostics(), {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
