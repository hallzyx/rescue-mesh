"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const EXAMPLE =
  "Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.";

export default function ReportEmergencyPage() {
  const [report, setReport] = useState("");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-50">Report Emergency</h2>
        <p className="mt-2 text-slate-400">
          Fase 0: captura de texto. En la Fase 1, QVAC procesará esto localmente y devolverá un
          incidente estructurado.
        </p>
      </div>

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
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300"
              onClick={() => setReport(EXAMPLE)}
            >
              Usar ejemplo del demo
            </Button>
            <Button disabled className="bg-red-700/50">
              Enviar (QVAC — Fase 1)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
