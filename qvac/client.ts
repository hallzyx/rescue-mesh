import type { QvacExtraction, QvacValidationIssue } from "@/qvac/schema";

export type AnalyzeReportResult =
  | {
      ok: true;
      provider: "qvac-sdk" | "local-engine";
      extraction: QvacExtraction;
    }
  | {
      ok: false;
      provider: "qvac-sdk" | "local-engine";
      issues: QvacValidationIssue[];
      raw?: string;
    };

export async function analyzeReport(
  rawReport: string,
  attempt = 0,
): Promise<AnalyzeReportResult> {
  const response = await fetch("/api/qvac/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawReport }),
  });

  if (!response.ok) {
    if (attempt < 1) {
      return analyzeReport(rawReport, attempt + 1);
    }
    return {
      ok: false,
      provider: "local-engine",
      issues: [{ field: "network", message: "Could not reach the local analysis engine." }],
    };
  }

  const payload = (await response.json()) as {
    provider: "qvac-sdk" | "local-engine";
    extraction?: QvacExtraction;
    issues?: QvacValidationIssue[];
    raw?: string;
  };

  if (payload.extraction) {
    return {
      ok: true,
      provider: payload.provider,
      extraction: payload.extraction,
    };
  }

  if (attempt < 1) {
    return analyzeReport(rawReport, attempt + 1);
  }

  return {
    ok: false,
    provider: payload.provider,
    issues: payload.issues ?? [{ field: "qvac", message: "Invalid response after retry." }],
    raw: payload.raw,
  };
}

export type QvacRuntimeStatus = {
  provider: "qvac-sdk" | "local-engine";
  externalApi: false;
  sdkInstalled: boolean;
  modelLoaded: boolean;
  warmupReady: boolean;
};

export async function fetchQvacStatus(): Promise<QvacRuntimeStatus> {
  const response = await fetch("/api/qvac/status", { cache: "no-store" });
  if (!response.ok) {
    return {
      provider: "local-engine",
      externalApi: false,
      sdkInstalled: false,
      modelLoaded: false,
      warmupReady: false,
    };
  }
  return response.json() as Promise<QvacRuntimeStatus>;
}

export async function warmupQvac(): Promise<{ ready: boolean; error?: string }> {
  const response = await fetch("/api/qvac/warmup", { method: "POST" });
  if (!response.ok) {
    return { ready: false, error: "Could not warm up QVAC." };
  }
  return response.json() as Promise<{ ready: boolean; error?: string }>;
}
