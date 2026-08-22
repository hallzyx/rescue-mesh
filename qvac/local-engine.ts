import { NEED_TYPES, type NeedType, type Priority } from "@/domain/incident";

const NEED_KEYWORDS: Record<NeedType, RegExp[]> = {
  rescue: [
    /\batrapad[oa]s?\b/i,
    /\btrapped\b/i,
    /\brescue\b/i,
    /\brescate\b/i,
    /\bcollapse\b/i,
    /\bcolaps/i,
    /\bescombros\b/i,
    /\bdebris\b/i,
  ],
  medical: [
    /\bmedical\b/i,
    /\bherid[oa]s?\b/i,
    /\binjur/i,
    /\bbleeding\b/i,
    /\bsangr/i,
    /\bbotiqu[ií]n\b/i,
    /\bhospital\b/i,
    /\bemergencia m[eé]dica\b/i,
  ],
  water: [/\bagua\b/i, /\bwater\b/i, /\bpotable\b/i, /\bdrinking water\b/i],
  food: [/\bcomida\b/i, /\bfood\b/i, /\baliment/i],
  shelter: [/\brefugio\b/i, /\bshelter\b/i, /\balbergue\b/i],
  medicine: [/\bmedicina\b/i, /\bmedicamentos?\b/i, /\bmedicine\b/i, /\bmedicamentos\b/i],
  transport: [/\btransporte\b/i, /\btransport\b/i, /\bv[ií]a bloqueada\b/i, /\bblocked road\b/i],
  infrastructure: [
    /\binfraestructura\b/i,
    /\binfrastructure\b/i,
    /\bedificio\b/i,
    /\bbuilding\b/i,
    /\belectric/i,
    /\bluz\b/i,
  ],
  other: [],
};

function detectNeeds(text: string): NeedType[] {
  const needs = NEED_TYPES.filter((need) =>
    NEED_KEYWORDS[need].some((pattern) => pattern.test(text)),
  );
  return needs.length > 0 ? needs : ["other"];
}

function detectPriority(text: string, needs: NeedType[], trapped: number, medical: boolean): Priority {
  if (
    trapped > 0 ||
    /\bcritical\b/i.test(text) ||
    /\bhemorrag/i.test(text) ||
    /\bsevere bleeding\b/i.test(text) ||
    /\bincendio\b/i.test(text) ||
    /\bfire\b/i.test(text) ||
    (needs.includes("rescue") && /\bcollapse\b|\bcolaps/i.test(text))
  ) {
    return "critical";
  }

  if (
    medical ||
    needs.includes("medical") ||
    needs.includes("medicine") ||
    /\burgent\b/i.test(text) ||
    /\bpeligros/i.test(text)
  ) {
    return "high";
  }

  if (
    needs.some((need) =>
      ["water", "shelter", "food", "infrastructure"].includes(need),
    )
  ) {
    return "medium";
  }

  return "low";
}

function extractLocation(text: string): string | undefined {
  const patterns = [
    /\b(?:at|en|ubicad[oa]s? en|we are at)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ0-9.,\- ]{4,80})/i,
    /\b(Av\.?\s+[A-Za-zÁÉÍÓÚáéíóúñÑ0-9.\- ]{3,60})/i,
    /\b(Colegio\s+[A-Za-zÁÉÍÓÚáéíóúñÑ ]{3,40})/i,
    /\b(Plaza\s+[A-Za-zÁÉÍÓÚáéíóúñÑ ]{3,40})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/[.,\s]+$/g, "").trim();
    }
  }

  return undefined;
}

function extractCount(text: string, patterns: RegExp[]): number {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const words: Record<string, number> = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        uno: 1,
        una: 1,
        dos: 2,
        tres: 3,
        cuatro: 4,
        cinco: 5,
      };
      const token = match[1].toLowerCase();
      if (words[token] !== undefined) return words[token];
      const num = Number(token);
      if (Number.isFinite(num)) return Math.max(0, Math.floor(num));
    }
  }
  return 0;
}

function buildSummary(text: string, location?: string, priority?: Priority): string {
  const snippet = text.replace(/\s+/g, " ").trim();
  const short = snippet.length > 140 ? `${snippet.slice(0, 137)}...` : snippet;
  if (location) {
    return `${priority?.toUpperCase() ?? "INCIDENT"} report near ${location}: ${short}`;
  }
  return short;
}

export function analyzeWithLocalEngine(rawReport: string) {
  const text = rawReport.trim();
  const needs = detectNeeds(text);
  const trappedPeople = extractCount(text, [
    /(\d+|one|two|three|four|five|uno|dos|tres)\s+(?:people\s+)?(?:are\s+)?trapped/i,
    /(\d+|one|two|three|four|five|uno|dos|tres)\s+personas?\s+atrapad/i,
    /one person is trapped/i,
  ]);
  const affectedPeople = extractCount(text, [
    /(\d+|one|two|three|four|five|twelve|uno|dos|tres|doce)\s+(?:of us|people|personas|familias)/i,
    /there are (three|two|one|\d+)/i,
    /somos (tres|dos|uno|\d+)/i,
    /(\d+)\s+familias/i,
  ]);
  const medicalEmergency =
    /\bbleeding\b/i.test(text) ||
    /\bsangr/i.test(text) ||
    /\bherid/i.test(text) ||
    /\binjur/i.test(text) ||
    /\bmedical emergency\b/i.test(text) ||
    needs.includes("medical");
  const location = extractLocation(text);
  const priority = detectPriority(text, needs, trappedPeople, medicalEmergency);

  return {
    priority,
    location,
    affectedPeople: affectedPeople || undefined,
    trappedPeople,
    medicalEmergency,
    needs,
    summary: buildSummary(text, location, priority),
  };
}
