"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { IncidentListItem } from "@/components/rescuemesh/incident-card";
import { AudioDictation } from "@/components/rescuemesh/audio-dictation";
import { ManualReviewForm } from "@/components/rescuemesh/manual-review-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { buildIncident, useIncidents } from "@/lib/incident-store";
import { getPeerId } from "@/lib/peer-session";
import { pushSystemError } from "@/lib/system-errors";
import { analyzeReport } from "@/qvac/client";
import type { QvacExtraction } from "@/qvac/schema";

const EXAMPLE =
  "Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.";

const EXAMPLE_ES =
  "Se cayó parte del edificio. Somos tres, una persona está atrapada y otra está sangrando. Estamos en Av. Grau 120.";

type Step = "compose" | "analyzing" | "preview" | "manual" | "saved";

export default function ReportEmergencyPage() {
  const router = useRouter();
  const { addIncident } = useIncidents();
  const [report, setReport] = useState("");
  const [step, setStep] = useState<Step>("compose");
  const [provider, setProvider] = useState<"qvac-sdk" | "local-engine">("local-engine");
  const [extraction, setExtraction] = useState<QvacExtraction | null>(null);
  const [issues, setIssues] = useState<{ field: string; message: string }[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function handleAnalyze() {
    const trimmed = report.trim();
    if (trimmed.length < 12) return;

    setStep("analyzing");
    try {
      const result = await analyzeReport(trimmed);
      setProvider(result.provider);

      if (result.ok) {
        setExtraction(result.extraction);
        setIssues([]);
        setStep("preview");
        return;
      }

      setIssues(result.issues);
      setExtraction(null);
      setStep("manual");
    } catch {
      pushSystemError({
        title: "QVAC no disponible",
        message: "El análisis local falló. Puedes completar el incidente manualmente.",
        severity: "error",
      });
      setIssues([{ field: "qvac", message: "Error inesperado durante el análisis." }]);
      setStep("manual");
    }
  }

  function persistIncident(data: QvacExtraction) {
    const peerId = getPeerId();
    const incident = buildIncident({
      rawReport: report.trim(),
      createdByPeerId: peerId,
      extraction: data,
    });
    addIncident(incident);
    setSavedId(incident.id);
    setStep("saved");
  }

  function handleConfirm() {
    if (!extraction) return;
    persistIncident(extraction);
  }

  function resetFlow() {
    setStep("compose");
    setExtraction(null);
    setIssues([]);
    setSavedId(null);
  }

  const previewIncident =
    extraction && step === "preview"
      ? buildIncident({
          rawReport: report.trim(),
          createdByPeerId: getPeerId(),
          extraction,
        })
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-50">Report Emergency</h2>
        <p className="mt-2 text-slate-400">
          Describe lo que ocurre. QVAC lo analiza localmente y crea un incidente estructurado.
        </p>
      </div>

      {step === "compose" ? (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-slate-100">Describe lo que ocurre</CardTitle>
            <CardDescription className="text-slate-400">
              Ubicación, personas afectadas, atrapados, heridos, necesidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report" className="text-slate-300">
                Reporte en texto libre
              </Label>
              <Textarea
                id="report"
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder={EXAMPLE}
                rows={8}
                className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <AudioDictation
                onTranscript={(text, append) => {
                  setReport((current) => (append && current ? `${current} ${text}` : text));
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 text-slate-300"
                onClick={() => setReport(EXAMPLE)}
              >
                Ejemplo EN (demo)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 text-slate-300"
                onClick={() => setReport(EXAMPLE_ES)}
              >
                Ejemplo ES (traducción)
              </Button>
              <Button
                className="bg-red-700 hover:bg-red-600"
                disabled={report.trim().length < 12}
                onClick={handleAnalyze}
              >
                Enviar reporte
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "analyzing" ? (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Loader2 className="size-10 animate-spin text-red-400" />
            <div>
              <p className="text-lg font-medium text-slate-100">Analyzing locally…</p>
              <p className="mt-2 text-sm text-slate-400">
                QVAC procesa el reporte en este dispositivo. Sin API cloud.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "preview" && previewIncident ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/20 p-4 text-sm text-emerald-100">
            <p className="font-semibold">Análisis completado</p>
            <p className="mt-1 text-emerald-100/80">
              Motor: {provider === "qvac-sdk" ? "QVAC SDK" : "Local engine (fallback)"}. Revisa el
              incidente antes de guardarlo.
            </p>
          </div>
          <IncidentListItem incident={previewIncident} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-slate-700" onClick={resetFlow}>
              Editar reporte
            </Button>
            <Button className="bg-red-700 hover:bg-red-600" onClick={handleConfirm}>
              Confirmar y guardar
            </Button>
          </div>
        </div>
      ) : null}

      {step === "manual" ? (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-slate-100">Revisión manual</CardTitle>
            <CardDescription className="text-slate-400">
              Completa los campos para registrar el incidente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManualReviewForm
              issues={issues}
              onSubmit={persistIncident}
              onCancel={resetFlow}
            />
          </CardContent>
        </Card>
      ) : null}

      {step === "saved" ? (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="space-y-4 py-10 text-center">
            <p className="text-lg font-medium text-slate-100">Incidente guardado localmente</p>
            <p className="text-sm text-slate-400">
              ID: <span className="font-mono text-slate-300">{savedId}</span> · replicando vía P2P
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="border-slate-700" onClick={resetFlow}>
                Nuevo reporte
              </Button>
              <Button
                className="bg-red-700 hover:bg-red-600"
                onClick={() => router.push("/reporter/reports")}
              >
                Ver mis reportes
              </Button>
              <Button variant="outline" className="border-slate-700" onClick={() => router.push("/responder")}>
                Ir al dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
