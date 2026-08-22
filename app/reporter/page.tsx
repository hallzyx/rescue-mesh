import Link from "next/link";
import { AlertTriangle, FileText, Network, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    href: "/reporter/report",
    title: "Report Emergency",
    description: "Describe lo que ocurre en texto libre. QVAC lo procesará localmente en la Fase 1.",
    icon: AlertTriangle,
    primary: true,
  },
  {
    href: "/reporter/reports",
    title: "My Reports",
    description: "Consulta tus reportes y el estado de sincronización.",
    icon: FileText,
    primary: false,
  },
  {
    href: "/reporter/network",
    title: "Network",
    description: "Diagnóstico de peer, AI local y conectividad P2P.",
    icon: Network,
    primary: false,
  },
];

export default function ReporterHomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-red-700/20 p-3 text-red-400">
            <Radio className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-50">Reporta con claridad</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              No necesitas formularios complejos. Escribe lo que ves y RescueMesh lo convertirá en un
              incidente estructurado cuando QVAC esté conectado.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Card key={action.href} className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <action.icon className="size-5 text-red-400" />
                {action.title}
              </CardTitle>
              <CardDescription className="text-slate-400">{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className={
                  action.primary
                    ? "w-full bg-red-700 hover:bg-red-600"
                    : "w-full border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                }
                variant={action.primary ? "default" : "outline"}
                render={<Link href={action.href} />}
              >
                Abrir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
