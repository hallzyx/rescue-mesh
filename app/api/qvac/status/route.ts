import { getQvacRuntimeStatus } from "@/qvac/server";

export const runtime = "nodejs";

export async function GET() {
  const status = await getQvacRuntimeStatus();
  return Response.json(status);
}
