"use client";

import { useState } from "react";
import {
  NEED_LABELS,
  NEED_TYPES,
  PRIORITIES,
  PRIORITY_LABELS,
  type NeedType,
  type Priority,
} from "@/domain/incident";
import { validateQvacExtraction, type QvacExtraction } from "@/qvac/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ManualReviewFormProps = {
  initial?: Partial<QvacExtraction>;
  issues?: { field: string; message: string }[];
  onSubmit: (extraction: QvacExtraction) => void;
  onCancel: () => void;
};

const defaultExtraction: QvacExtraction = {
  priority: "medium",
  medicalEmergency: false,
  needs: ["other"],
  summary: "",
  trappedPeople: 0,
};

export function ManualReviewForm({
  initial,
  issues = [],
  onSubmit,
  onCancel,
}: ManualReviewFormProps) {
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? defaultExtraction.priority);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [affectedPeople, setAffectedPeople] = useState(
    initial?.affectedPeople != null ? String(initial.affectedPeople) : "",
  );
  const [trappedPeople, setTrappedPeople] = useState(
    initial?.trappedPeople != null ? String(initial.trappedPeople) : "0",
  );
  const [medicalEmergency, setMedicalEmergency] = useState(
    initial?.medicalEmergency ?? defaultExtraction.medicalEmergency,
  );
  const [needs, setNeeds] = useState<NeedType[]>(
    initial?.needs?.length ? initial.needs : defaultExtraction.needs,
  );
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  function toggleNeed(need: NeedType) {
    setNeeds((current) =>
      current.includes(need) ? current.filter((item) => item !== need) : [...current, need],
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const extraction = {
      priority,
      location: location.trim() || undefined,
      affectedPeople: affectedPeople === "" ? undefined : Number(affectedPeople),
      trappedPeople: trappedPeople === "" ? 0 : Number(trappedPeople),
      medicalEmergency,
      needs,
      summary,
    };

    const validated = validateQvacExtraction(extraction);
    if (!validated.ok) {
      setErrors(validated.issues.map((issue) => `${issue.field}: ${issue.message}`));
      return;
    }

    setErrors([]);
    onSubmit(validated.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-amber-800/60 bg-amber-950/30 p-4 text-sm text-amber-100">
        <p className="font-semibold">Revisión manual requerida</p>
        <p className="mt-1 text-amber-100/80">
          QVAC no devolvió un JSON válido tras el reintento. Completa los campos para crear el
          incidente.
        </p>
        {issues.length > 0 ? (
          <ul className="mt-2 list-inside list-disc text-xs text-amber-200/80">
            {issues.map((issue) => (
              <li key={`${issue.field}-${issue.message}`}>
                {issue.field}: {issue.message}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-slate-300">
            Prioridad
          </Label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className="text-slate-300">
            Ubicación
          </Label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Av. Grau 120"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="affected" className="text-slate-300">
            Personas afectadas
          </Label>
          <input
            id="affected"
            type="number"
            min={0}
            value={affectedPeople}
            onChange={(e) => setAffectedPeople(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trapped" className="text-slate-300">
            Personas atrapadas
          </Label>
          <input
            id="trapped"
            type="number"
            min={0}
            value={trappedPeople}
            onChange={(e) => setTrappedPeople(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <Checkbox
          checked={medicalEmergency}
          onCheckedChange={(checked) => setMedicalEmergency(checked === true)}
        />
        Emergencia médica
      </label>

      <div className="space-y-2">
        <Label className="text-slate-300">Necesidades</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {NEED_TYPES.map((need) => (
            <label key={need} className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox
                checked={needs.includes(need)}
                onCheckedChange={() => toggleNeed(need)}
              />
              {NEED_LABELS[need]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary" className="text-slate-300">
          Resumen operacional
        </Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="border-slate-700 bg-slate-950 text-slate-100"
        />
      </div>

      {errors.length > 0 ? (
        <ul className="rounded border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-200">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="border-slate-700" onClick={onCancel}>
          Volver
        </Button>
        <Button type="submit" className="bg-red-700 hover:bg-red-600">
          Guardar incidente
        </Button>
      </div>
    </form>
  );
}
