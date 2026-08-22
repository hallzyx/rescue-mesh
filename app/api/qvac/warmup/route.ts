import { jsonWithCors, optionsWithCors } from "@/lib/cors";
import { warmupQvac } from "@/qvac/server";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return optionsWithCors(request);
}

export async function POST(request: Request) {
  const result = await warmupQvac();
  return jsonWithCors(request, result);
}
