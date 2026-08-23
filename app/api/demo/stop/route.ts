import { jsonWithCors, optionsWithCors } from "@/lib/cors";

export const runtime = "nodejs";

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
    stoppable: true,
    instanceLabel: process.env.RESCUEMESH_INSTANCE_LABEL?.trim() || "Peer",
  });
}

export async function POST(request: Request) {
  if (!isLoopbackHost(request)) {
    return jsonWithCors(request, { error: "Solo loopback." }, { status: 403 });
  }

  const instanceLabel = process.env.RESCUEMESH_INSTANCE_LABEL?.trim() || "Peer";
  setTimeout(() => {
    process.exit(0);
  }, 250);

  return jsonWithCors(request, { stopping: true, instanceLabel });
}
