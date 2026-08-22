import { analyzeReportServer } from "@/qvac/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rawReport?: string };
    if (!body.rawReport || typeof body.rawReport !== "string") {
      return Response.json(
        { error: "rawReport es requerido." },
        { status: 400 },
      );
    }

    const result = await analyzeReportServer(body.rawReport);
    return Response.json(result);
  } catch (error) {
    console.error("[api/qvac/analyze]", error);
    return Response.json(
      { error: "No se pudo analizar el reporte localmente." },
      { status: 500 },
    );
  }
}
