import { buildUserPrompt, QVAC_SYSTEM_PROMPT } from "./prompts";
import { parseQvacResponse } from "./parser";
import { analyzeWithLocalEngine } from "./local-engine";
import type { QvacExtraction, QvacProvider } from "./schema";

let cachedModelId: string | null = null;
let sdkChecked = false;
let sdkAvailable = false;
let warmupComplete = false;
let warmupInFlight: Promise<{ ready: boolean; error?: string }> | null = null;

const WARMUP_REPORT =
  "Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.";

type QvacSdkModule = {
  completion: (options: {
    modelId: string;
    history: { role: string; content: string }[];
    stream: boolean;
  }) => { tokenStream: AsyncIterable<string> };
  loadModel: (options: { modelSrc: string }) => Promise<string>;
  LLAMA_3_2_1B_INST_Q4_0: string;
};

async function importQvacSdk(): Promise<QvacSdkModule | null> {
  try {
    const specifier = ["@qvac", "sdk"].join("/");
    return (await import(specifier)) as QvacSdkModule;
  } catch {
    return null;
  }
}

async function canUseQvacSdk(): Promise<boolean> {
  if (sdkChecked) return sdkAvailable;
  sdkChecked = true;
  const sdk = await importQvacSdk();
  sdkAvailable = sdk !== null;
  return sdkAvailable;
}

async function completeWithQvacSdk(rawReport: string): Promise<string> {
  const sdk = await importQvacSdk();
  if (!sdk) {
    throw new Error("QVAC SDK no disponible.");
  }

  const { completion, loadModel, LLAMA_3_2_1B_INST_Q4_0 } = sdk;

  if (!cachedModelId) {
    cachedModelId = await loadModel({ modelSrc: LLAMA_3_2_1B_INST_Q4_0 });
  }

  const result = completion({
    modelId: cachedModelId,
    history: [
      { role: "system", content: QVAC_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(rawReport) },
    ],
    stream: true,
  });

  let text = "";
  for await (const token of result.tokenStream) {
    text += token;
  }
  return text;
}

export async function analyzeReportServer(rawReport: string): Promise<{
  provider: QvacProvider;
  extraction?: QvacExtraction;
  issues?: { field: string; message: string }[];
  raw?: string;
}> {
  const trimmed = rawReport.trim();
  if (trimmed.length < 12) {
    return {
      provider: "local-engine",
      issues: [{ field: "rawReport", message: "El reporte es demasiado corto." }],
    };
  }

  if (await canUseQvacSdk()) {
    try {
      const raw = await completeWithQvacSdk(trimmed);
      const parsed = parseQvacResponse(raw);
      if (parsed.ok) {
        return { provider: "qvac-sdk", extraction: parsed.data };
      }
      return { provider: "qvac-sdk", issues: parsed.issues, raw: parsed.raw };
    } catch (error) {
      console.error("[QVAC SDK]", error);
    }
  }

  const local = analyzeWithLocalEngine(trimmed);
  const validated = parseQvacResponse(JSON.stringify(local));
  if (validated.ok) {
    return { provider: "local-engine", extraction: validated.data };
  }

  return { provider: "local-engine", issues: validated.issues };
}

export async function getQvacRuntimeStatus(): Promise<{
  provider: QvacProvider;
  externalApi: false;
  sdkInstalled: boolean;
  modelLoaded: boolean;
  warmupReady: boolean;
}> {
  const sdkInstalled = await canUseQvacSdk();
  return {
    provider: sdkInstalled ? "qvac-sdk" : "local-engine",
    externalApi: false,
    sdkInstalled,
    modelLoaded: Boolean(cachedModelId),
    warmupReady: warmupComplete,
  };
}

export async function warmupQvac(): Promise<{ ready: boolean; error?: string }> {
  if (warmupComplete) return { ready: true };
  if (warmupInFlight) return warmupInFlight;

  warmupInFlight = (async () => {
    try {
      if (await canUseQvacSdk()) {
        try {
          await completeWithQvacSdk(WARMUP_REPORT);
        } catch (error) {
          console.error("[QVAC warmup] SDK falló, usando local-engine.", error);
          analyzeWithLocalEngine(WARMUP_REPORT);
        }
      } else {
        analyzeWithLocalEngine(WARMUP_REPORT);
      }
      warmupComplete = true;
      return { ready: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo precalentar QVAC.";
      console.error("[QVAC warmup]", message);
      analyzeWithLocalEngine(WARMUP_REPORT);
      warmupComplete = true;
      return { ready: true, error: message };
    } finally {
      warmupInFlight = null;
    }
  })();

  return warmupInFlight;
}
