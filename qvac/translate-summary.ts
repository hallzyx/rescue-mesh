import { NEED_LABELS, PRIORITY_LABELS, type NeedType } from "@/domain/incident";
import type { QvacExtraction } from "./schema";

const SPANISH_MARKERS =
  /\b(necesitamos|personas|heridos|atrapad|agua|edificio|somos|estamos|hay|refugio|escombros|colaps|sangr|herida|familias|vía|plaza|colegio)\b/i;

export function isSpanishText(text: string): boolean {
  return SPANISH_MARKERS.test(text);
}

function needPhrase(needs: NeedType[]): string {
  if (needs.length === 0) return "assistance needed";
  return `needs: ${needs.map((need) => NEED_LABELS[need]).join(", ")}`;
}

export function toOperationalSummaryEn(
  extraction: Pick<
    QvacExtraction,
    "priority" | "location" | "affectedPeople" | "trappedPeople" | "medicalEmergency" | "needs"
  >,
): string {
  const priority = PRIORITY_LABELS[extraction.priority];
  const parts: string[] = [`${priority} incident`];

  if (extraction.location) {
    parts.push(`at ${extraction.location}`);
  }

  const details: string[] = [];
  if (extraction.affectedPeople != null) {
    details.push(`${extraction.affectedPeople} affected`);
  }
  if (extraction.trappedPeople && extraction.trappedPeople > 0) {
    details.push(`${extraction.trappedPeople} trapped`);
  }
  if (extraction.medicalEmergency) {
    details.push("medical emergency");
  }

  const headline = parts.join(" ");
  const detailText = details.length > 0 ? ` — ${details.join(", ")}` : "";
  return `${headline}${detailText}. ${needPhrase(extraction.needs)}.`;
}

export function localizeSummary(extraction: QvacExtraction, rawReport: string): string {
  if (!isSpanishText(rawReport)) {
    return extraction.summary;
  }
  return toOperationalSummaryEn(extraction);
}
