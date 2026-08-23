import Link from "next/link";
import { AlertTriangle, FileText, Network, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    href: "/reporter/report",
    title: "Report Emergency",
    description: "Describe what is happening in free text. QVAC processes it locally on your device.",
    icon: AlertTriangle,
    primary: true,
  },
  {
    href: "/reporter/reports",
    title: "My Reports",
    description: "Review your reports and their sync status.",
    icon: FileText,
    primary: false,
  },
  {
    href: "/reporter/network",
    title: "Network",
    description: "Peer, local AI, and P2P connectivity diagnostics.",
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
            <h2 className="text-2xl font-semibold text-slate-50">Report with clarity</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              You do not need complex forms. Write what you see and RescueMesh turns it into a
              structured incident with local QVAC.
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
                aria-label={`Open ${action.title}`}
                render={<Link href={action.href} />}
              >
                Open
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
