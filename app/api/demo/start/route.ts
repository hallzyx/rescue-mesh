import { jsonWithCors, optionsWithCors } from "@/lib/cors";
import { isDemoPeerId } from "@/lib/demo-peers";
import { startDemoPeer } from "@/lib/demo-process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isLoopbackHost(request: Request): boolean {
  try {
    const host = new URL(request.url).hostname;
    return host === "127.0.0.1" || host === "localhost" || host === "::1";
  } catch {
    return false;
  }
}

export async function OPTIONS(request: Request) {
  return optionsWithCors(request);
}

export async function GET(request: Request) {
  if (!isLoopbackHost(request)) {
    return jsonWithCors(request, { error: "Solo loopback." }, { status: 403 });
  }

  return jsonWithCors(request, {
    startable: true,
    peers: ["a", "b", "c"],
  });
}

export async function POST(request: Request) {
  if (!isLoopbackHost(request)) {
    return jsonWithCors(request, { error: "Solo loopback." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { peer?: string } | null;
  const peer = body?.peer?.trim() ?? "";
  if (!isDemoPeerId(peer)) {
    return jsonWithCors(request, { error: "peer debe ser a, b o c." }, { status: 400 });
  }

  try {
    const result = await startDemoPeer(peer);
    return jsonWithCors(request, { starting: !result.alreadyRunning, ...result, peer });
  } catch (error) {
    console.error("[demo/start]", error);
    return jsonWithCors(request, { error: "No se pudo arrancar el peer." }, { status: 500 });
  }
}
