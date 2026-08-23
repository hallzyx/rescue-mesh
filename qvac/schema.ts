import { NEED_TYPES, PRIORITIES, type NeedType, type Priority } from "@/domain/incident";

export type QvacExtraction = {
  priority: Priority;
  location?: string;
  affectedPeople?: number;
  trappedPeople?: number;
  medicalEmergency: boolean;
  needs: NeedType[];
  summary: string;
};

export type QvacValidationIssue = {
  field: string;
  message: string;
};

export type QvacProvider = "qvac-sdk" | "local-engine";

export function isNeedType(value: unknown): value is NeedType {
  return typeof value === "string" && (NEED_TYPES as readonly string[]).includes(value);
}

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITIES as readonly string[]).includes(value);
}

function asOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return Math.floor(num);
}

export function validateQvacExtraction(input: unknown): {
  ok: true;
  data: QvacExtraction;
} | {
  ok: false;
  issues: QvacValidationIssue[];
} {
  const issues: QvacValidationIssue[] = [];

  if (!input || typeof input !== "object") {
    return { ok: false, issues: [{ field: "root", message: "The response is not a JSON object." }] };
  }

  const record = input as Record<string, unknown>;

  if (!isPriority(record.priority)) {
    issues.push({ field: "priority", message: "priority must be critical, high, medium, or low." });
  }

  if (typeof record.medicalEmergency !== "boolean") {
    issues.push({ field: "medicalEmergency", message: "medicalEmergency must be a boolean." });
  }

  if (!Array.isArray(record.needs)) {
    issues.push({ field: "needs", message: "needs must be an array." });
  } else {
    const invalid = record.needs.filter((need) => !isNeedType(need));
    if (invalid.length > 0) {
      issues.push({ field: "needs", message: "needs contains values outside the taxonomy." });
    }
    if (record.needs.length === 0) {
      issues.push({ field: "needs", message: "needs cannot be empty." });
    }
  }

  if (typeof record.summary !== "string" || record.summary.trim().length < 8) {
    issues.push({ field: "summary", message: "summary must be a short descriptive text." });
  }

  if (record.location !== undefined && typeof record.location !== "string") {
    issues.push({ field: "location", message: "location must be text." });
  }

  const affected = asOptionalNumber(record.affectedPeople);
  if (record.affectedPeople !== undefined && affected === undefined) {
    issues.push({ field: "affectedPeople", message: "affectedPeople must be a number >= 0." });
  }

  const trapped = asOptionalNumber(record.trappedPeople);
  if (record.trappedPeople !== undefined && trapped === undefined) {
    issues.push({ field: "trappedPeople", message: "trappedPeople must be a number >= 0." });
  }

  if (issues.length > 0) return { ok: false, issues };

  const needs = [...new Set(record.needs as NeedType[])];

  return {
    ok: true,
    data: {
      priority: record.priority as Priority,
      location: typeof record.location === "string" ? record.location.trim() || undefined : undefined,
      affectedPeople: affected,
      trappedPeople: trapped ?? 0,
      medicalEmergency: record.medicalEmergency as boolean,
      needs,
      summary: (record.summary as string).trim(),
    },
  };
}

export const QVAC_JSON_SCHEMA_HINT = `{
  "priority": "critical" | "high" | "medium" | "low",
  "location": "string (optional)",
  "affectedPeople": number (optional),
  "trappedPeople": number (optional),
  "medicalEmergency": boolean,
  "needs": ["rescue" | "medical" | "water" | "food" | "shelter" | "medicine" | "transport" | "infrastructure" | "other"],
  "summary": "short operational summary"
}`;
