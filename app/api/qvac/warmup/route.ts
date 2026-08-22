import { warmupQvac } from "@/qvac/server";

export const runtime = "nodejs";

export async function POST() {
  const result = await warmupQvac();
  return Response.json(result);
}
