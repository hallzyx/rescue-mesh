import { validateQvacExtraction, type QvacExtraction, type QvacValidationIssue } from "./schema";

export function extractJsonCandidate(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // continue
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  return null;
}

export function parseQvacResponse(text: string): {
  ok: true;
  data: QvacExtraction;
} | {
  ok: false;
  issues: QvacValidationIssue[];
  raw: string;
} {
  const candidate = extractJsonCandidate(text);
  if (candidate === null) {
    return {
      ok: false,
      issues: [{ field: "json", message: "No se pudo extraer JSON válido de la respuesta." }],
      raw: text,
    };
  }

  const validated = validateQvacExtraction(candidate);
  if (!validated.ok) {
    return { ok: false, issues: validated.issues, raw: text };
  }

  return validated;
}
