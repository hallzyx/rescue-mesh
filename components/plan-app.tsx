"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clapperboard,
  Layers,
  ListChecks,
  Menu,
  Radio,
  RotateCcw,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  architecture,
  demoSteps,
  owners,
  phaseForTask,
  phases,
  plan,
  risks,
  taskById,
  totals,
  type Owner,
  type Phase,
  type Priority,
  type Task,
} from "@/lib/plan";
import { useProgress } from "@/lib/use-progress";
import { cn } from "@/lib/utils";

const ownerTone: Record<Owner, string> = {
  UI: "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-100",
  Domain: "bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100",
  QVAC: "bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100",
  Storage: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
  P2P: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100",
  Demo: "bg-orange-100 text-orange-950 dark:bg-orange-950 dark:text-orange-100",
};

const priorityTone: Record<Priority, string> = {
  crítica: "border-red-400 text-red-800 dark:border-red-700 dark:text-red-200",
  alta: "border-amber-400 text-amber-900 dark:border-amber-700 dark:text-amber-200",
  media: "border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300",
};

export function PlanApp() {
  const progress = useProgress();
  const [tab, setTab] = useState("resumen");
  const [phaseId, setPhaseId] = useState(phases[0].id);
  const [ownerFilter, setOwnerFilter] = useState<Owner | "todas">("todas");
  const [navOpen, setNavOpen] = useState(false);

  const activePhase = phases.find((phase) => phase.id === phaseId) ?? phases[0];

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon-sm" className="lg:hidden" />
              }
            >
              <Menu />
              <span className="sr-only">Abrir fases</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] p-0">
              <SheetHeader className="border-b">
                <SheetTitle>Fases</SheetTitle>
                <SheetDescription>Orden obligatorio del PRD.</SheetDescription>
              </SheetHeader>
              <PhaseList
                phaseId={phaseId}
                onSelect={(id) => {
                  setPhaseId(id);
                  setTab("fases");
                  setNavOpen(false);
                }}
                stats={progress.stats}
              />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              RescueMesh
            </p>
            <h1 className="truncate text-lg font-semibold leading-tight sm:text-xl">
              Plan de implementación — MVP hackathon
            </h1>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="w-40">
              <Progress value={progress.hydrated ? progress.stats.percent : 0}>
                <div className="flex w-full items-baseline">
                  <ProgressLabel className="text-xs">Avance</ProgressLabel>
                  <ProgressValue className="text-xs" />
                </div>
              </Progress>
            </div>
            <Button variant="ghost" size="sm" onClick={progress.reset} disabled={!progress.hydrated}>
              <RotateCcw data-icon="inline-start" />
              Reiniciar
            </Button>
          </div>
        </div>
        <div className="mx-auto block max-w-7xl px-4 pb-3 sm:hidden">
          <Progress value={progress.hydrated ? progress.stats.percent : 0}>
            <div className="flex w-full items-baseline">
              <ProgressLabel className="text-xs">Avance</ProgressLabel>
              <ProgressValue className="text-xs" />
            </div>
          </Progress>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Card className="sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fases</CardTitle>
              <CardDescription>
                {progress.stats.completed} de {progress.stats.total} tareas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <PhaseList
                phaseId={phaseId}
                onSelect={(id) => {
                  setPhaseId(id);
                  setTab("fases");
                }}
                stats={progress.stats}
              />
            </CardContent>
          </Card>
        </aside>

        <main className="min-w-0 space-y-6">
          {progress.error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {progress.error}
            </div>
          ) : null}

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList variant="line" className="h-auto w-full flex-wrap justify-start gap-1">
              <TabsTrigger value="resumen">
                <Radio data-icon="inline-start" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="fases">
                <ListChecks data-icon="inline-start" />
                Fases
              </TabsTrigger>
              <TabsTrigger value="arquitectura">
                <Layers data-icon="inline-start" />
                Arquitectura
              </TabsTrigger>
              <TabsTrigger value="demo">
                <Clapperboard data-icon="inline-start" />
                Demo
              </TabsTrigger>
              <TabsTrigger value="riesgos">
                <AlertTriangle data-icon="inline-start" />
                Riesgos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resumen" className="space-y-6 pt-4">
              <Overview
                onOpenPhase={(id) => {
                  setPhaseId(id);
                  setTab("fases");
                }}
                progress={progress}
              />
            </TabsContent>

            <TabsContent value="fases" className="space-y-6 pt-4">
              <PhaseDetail
                phase={activePhase}
                ownerFilter={ownerFilter}
                onOwnerFilter={setOwnerFilter}
                progress={progress}
              />
            </TabsContent>

            <TabsContent value="arquitectura" className="space-y-6 pt-4">
              <ArchitectureView />
            </TabsContent>

            <TabsContent value="demo" className="space-y-6 pt-4">
              <DemoView />
            </TabsContent>

            <TabsContent value="riesgos" className="space-y-6 pt-4">
              <RisksView />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function PhaseList({
  phaseId,
  onSelect,
  stats,
}: {
  phaseId: string;
  onSelect: (id: string) => void;
  stats: ReturnType<typeof useProgress>["stats"];
}) {
  return (
    <ScrollArea className="h-[min(70vh,36rem)]">
      <nav className="flex flex-col p-2">
        {phases.map((phase) => {
          const stat = stats.byPhase.find((item) => item.id === phase.id);
          const active = phase.id === phaseId;
          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => onSelect(phase.id)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-left transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wider opacity-80">
                  Fase {phase.index}
                </span>
                <span className="text-[11px] tabular-nums opacity-80">
                  {stat?.done ?? 0}/{stat?.total ?? phase.tasks.length}
                </span>
              </div>
              <div className="font-medium leading-snug">{phase.name}</div>
            </button>
          );
        })}
      </nav>
    </ScrollArea>
  );
}

function Overview({
  onOpenPhase,
  progress,
}: {
  onOpenPhase: (id: string) => void;
  progress: ReturnType<typeof useProgress>;
}) {
  return (
    <>
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
          <div className="space-y-4">
            <Badge variant="secondary">{plan.tagline}</Badge>
            <h2 className="text-3xl font-semibold leading-tight text-balance sm:text-4xl">
              Reportes caóticos → incidentes priorizados, en local y entre peers.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {plan.premise}
            </p>
            <p className="max-w-2xl text-base leading-relaxed">
              {plan.northStar}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Fases" value={String(totals.phases)} />
            <Stat label="Tareas" value={String(totals.tasks)} />
            <Stat label="Roles" value={String(totals.roles)} />
            <Stat
              label="Hechas"
              value={progress.hydrated ? `${progress.stats.percent}%` : "—"}
            />
          </div>
        </div>
      </section>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-base">Afirmación permitida</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-foreground">
            {plan.claimCorrect}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No afirmar: “{plan.claimForbidden}”. Sin canal físico no hay software que transmita.
        </CardContent>
      </Card>

      {!progress.hydrated ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Cargando el avance guardado en este navegador…
          </CardContent>
        </Card>
      ) : progress.stats.completed === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Todavía no hay tareas marcadas</CardTitle>
            <CardDescription>
              Empieza por Skeleton. Marca lo que cierres. El avance se guarda en este navegador, sin
              servidor.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avance por fase</CardTitle>
            <CardDescription>
              {progress.stats.completed} tareas hechas. No saltes una fase obligatoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {progress.stats.byPhase.map((item) => {
              const phase = phases.find((entry) => entry.id === item.id);
              if (!phase) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenPhase(item.id)}
                  className="rounded-lg border px-3 py-3 text-left hover:bg-accent"
                >
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{phase.name}</span>
                    <span className="tabular-nums text-muted-foreground">{item.percent}%</span>
                  </div>
                  <Progress value={item.percent} />
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      <section>
        <h3 className="mb-3 text-xl font-semibold">Tracks y listón de éxito</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {plan.tracks.map((track) => (
            <Card key={track.name}>
              <CardHeader>
                <CardTitle className="text-base">{track.name}</CardTitle>
                <CardDescription>{track.submission}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {track.items.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Punto de partida</CardTitle>
            <CardDescription>Lo que el PRD deja cerrado antes de escribir código.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm leading-relaxed">
              {plan.currentState.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fuera del MVP</CardTitle>
            <CardDescription>Sección 28 del PRD. No entra en la hackathon.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm leading-relaxed">
              {plan.nonGoals.map((item) => (
                <li key={item} className="flex gap-2">
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold">Principios (no se reabren)</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plan.decisions.map((decision) => (
            <Card key={decision.title}>
              <CardHeader>
                <CardTitle className="text-base">{decision.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {decision.body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <h3 className="text-xl font-semibold">Roles</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {plan.roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="text-base">{role.name}</CardTitle>
                <CardDescription>
                  {role.persona}. {role.job}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {role.needs.map((need) => (
                    <li key={need}>— {need}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold">Cómo se sabrá que funciona</h3>
        <div className="grid gap-3">
          {plan.metrics.map((metric) => (
            <Card key={metric.name}>
              <CardHeader className="gap-1">
                <CardTitle className="text-base">{metric.name}</CardTitle>
                <p className="text-sm text-foreground">{metric.target}</p>
                <CardDescription>{metric.why}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold">Orden obligatorio</h3>
        <ol className="grid gap-3">
          {phases.map((phase) => (
            <li key={phase.id}>
              <button
                type="button"
                onClick={() => onOpenPhase(phase.id)}
                className="w-full rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Fase {phase.index}
                </div>
                <div className="text-lg font-semibold">{phase.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{phase.headline}</p>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function PhaseDetail({
  phase,
  ownerFilter,
  onOwnerFilter,
  progress,
}: {
  phase: Phase;
  ownerFilter: Owner | "todas";
  onOwnerFilter: (owner: Owner | "todas") => void;
  progress: ReturnType<typeof useProgress>;
}) {
  const visibleTasks = useMemo(
    () =>
      phase.tasks.filter((task) => ownerFilter === "todas" || task.owner === ownerFilter),
    [phase.tasks, ownerFilter],
  );

  const phaseStat = progress.stats.byPhase.find((item) => item.id === phase.id);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Fase {phase.index} de {phases.length - 1}
        </p>
        <h2 className="text-3xl font-semibold text-balance">{phase.name}</h2>
        <p className="text-lg text-muted-foreground">{phase.headline}</p>
      </div>

      <Progress value={progress.hydrated ? phaseStat?.percent ?? 0 : 0}>
        <div className="flex w-full items-baseline">
          <ProgressLabel>Tareas de esta fase</ProgressLabel>
          <ProgressValue />
        </div>
      </Progress>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Por qué ahora</CardTitle>
            <CardDescription className="text-sm leading-relaxed">{phase.why}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">Resultado: </span>
              {phase.outcome}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entregables</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {phase.deliverables.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Definition of Done</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {phase.acceptance.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={ownerFilter === "todas"}
          onClick={() => onOwnerFilter("todas")}
          label="Todas las áreas"
        />
        {owners.map((owner) => (
          <FilterChip
            key={owner}
            active={ownerFilter === owner}
            onClick={() => onOwnerFilter(owner)}
            label={owner}
          />
        ))}
      </div>

      {visibleTasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay tareas de {ownerFilter} en esta fase. Prueba otro filtro o pasa a la siguiente.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} progress={progress} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskCard({
  task,
  progress,
}: {
  task: Task;
  progress: ReturnType<typeof useProgress>;
}) {
  const checked = progress.done.has(task.id);
  const blocked = (task.dependsOn ?? [])
    .map((id) => ({ id, task: taskById(id), phase: phaseForTask(id) }))
    .filter((dep) => dep.task);

  return (
    <li
      className={cn(
        "rounded-xl border bg-card p-4 transition-colors",
        checked && "border-primary/30 bg-primary/5",
      )}
    >
      <div className="flex gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={() => progress.toggle(task.id)}
          disabled={!progress.hydrated}
          aria-label={`Marcar ${task.title}`}
          className="mt-1"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("font-medium leading-snug", checked && "line-through opacity-70")}>
              {task.title}
            </h3>
            <Badge className={cn("border bg-transparent font-normal", priorityTone[task.priority])}>
              {task.priority}
            </Badge>
            <Badge className={cn("border-transparent font-normal", ownerTone[task.owner])}>
              {task.owner}
            </Badge>
            <span className="text-xs text-muted-foreground">Esfuerzo {task.effort}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{task.detail}</p>
          {blocked.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Depende de{" "}
              {blocked.map((dep, index) => (
                <span key={dep.id}>
                  {index > 0 ? ", " : ""}
                  <span className="text-foreground">
                    {dep.task?.title}
                    {dep.phase ? ` (${dep.phase.name})` : ""}
                  </span>
                </span>
              ))}
              .
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function ArchitectureView() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold">Arquitectura del PRD</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cinco capas separadas: domain, AI, P2P, storage, UI. No hay API RescueMesh ni base
          central. El incidente es el objeto que todas hablan.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <p className="mb-3 text-center text-xs uppercase tracking-wider text-muted-foreground">
          Pitch técnico
        </p>
        <div className="grid gap-3">
          <ArchBox>Human emergency report</ArchBox>
          <ArchArrow />
          <ArchBox>QVAC local</ArchBox>
          <ArchArrow />
          <ArchBox>Incident estructurado + storage local</ArchBox>
          <ArchArrow />
          <div className="rounded-lg bg-primary px-3 py-4 text-center text-sm font-medium text-primary-foreground">
            Pear — estado operacional distribuido
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ArchBox>Reporter</ArchBox>
            <ArchBox>Responder</ArchBox>
          </div>
        </div>
        <Separator className="my-4" />
        <p className="text-center text-xs text-muted-foreground">
          Prohibido: Peer A → RescueMesh API → Database → Peer B
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {architecture.map((layer) => (
          <Card key={layer.id} className={layer.id === "ui" ? "md:col-span-2" : undefined}>
            <CardHeader>
              <CardTitle className="text-lg">{layer.name}</CardTitle>
              <CardDescription>{layer.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {layer.items.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DemoView() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold">Demo objetivo</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Una laptop. Dos procesos: Reporter (Peer A) y Responder (Peer B). Storage distinto, Peer
          ID distinto. Si Pear no está, se graba el fallback y no se cancela.
        </p>
      </div>

      <ol className="grid gap-3">
        {demoSteps.map((step) => (
          <li key={step.step}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Paso {step.step} — {step.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {step.action}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-relaxed">
                  {step.show}
                </pre>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fallback</CardTitle>
          <CardDescription>
            Si Pear no está listo: Reporter → QVAC → Incident → Dashboard. Se presenta como Local
            Crisis Intelligence Copilot en QVAC + General.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function RisksView() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold">Riesgos que queman la submission</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Si Pear falla, se entrega el copilot local. Si se inventa un backend, IDs falsos o un
          “funciona sin radio”, el PRD se rompe.
        </p>
      </div>
      <div className="grid gap-3">
        {risks.map((risk) => (
          <Card key={risk.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{risk.title}</CardTitle>
                <Badge
                  variant={risk.level === "alto" ? "destructive" : "secondary"}
                  className="capitalize"
                >
                  {risk.level}
                </Badge>
              </div>
              <CardDescription>
                <span className="text-foreground">Señal: </span>
                {risk.signal}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <span className="font-medium">Mitigación: </span>
              {risk.mitigation}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ArchBox({ children }: { children: string }) {
  return (
    <div className="rounded-lg border bg-accent/40 px-3 py-4 text-center text-sm font-medium">
      {children}
    </div>
  );
}

function ArchArrow() {
  return <div className="text-center text-xs text-muted-foreground">↓</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background px-3 py-4">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="rounded-full"
    >
      {label}
    </Button>
  );
}
