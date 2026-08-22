import { jsonWithCors, optionsWithCors } from "@/lib/cors";
import { analyzeReportServer } from "@/qvac/server";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return optionsWithCors(request);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rawReport?: string };
    if (!body.rawReport || typeof body.rawReport !== "string") {
      return jsonWithCors(request, { error: "rawReport es requerido." }, { status: 400 });
    }

    const result = await analyzeReportServer(body.rawReport);
    return jsonWithCors(request, result);
  } catch (error) {
    console.error("[api/qvac/analyze]", error);
    return jsonWithCors(
      request,
      { error: "No se pudo analizar el reporte localmente." },
      { status: 500 },
    );
  }
}
