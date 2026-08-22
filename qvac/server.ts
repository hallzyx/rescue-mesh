import { buildUserPrompt, QVAC_SYSTEM_PROMPT } from "./prompts";
import { parseQvacResponse } from "./parser";
import { analyzeWithLocalEngine } from "./local-engine";
import type { QvacExtraction, QvacProvider } from "./schema";

let cachedModelId: string | null = null;
let sdkChecked = false;
let sdkAvailable = false;

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
}> {
  const sdkInstalled = await canUseQvacSdk();
  return {
    provider: sdkInstalled ? "qvac-sdk" : "local-engine",
    externalApi: false,
    sdkInstalled,
    modelLoaded: Boolean(cachedModelId),
  };
}
