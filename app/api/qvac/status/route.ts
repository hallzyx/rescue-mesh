import { jsonWithCors, optionsWithCors } from "@/lib/cors";
import { getQvacRuntimeStatus } from "@/qvac/server";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return optionsWithCors(request);
}

export async function GET(request: Request) {
  const status = await getQvacRuntimeStatus();
  return jsonWithCors(request, status);
}
