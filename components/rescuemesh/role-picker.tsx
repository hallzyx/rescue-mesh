"use client";

import Link from "next/link";
import { AlertTriangle, Building2, Headphones, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setRole } from "@/lib/peer-session";
import { useRouter } from "next/navigation";

export function RolePicker() {
  const router = useRouter();

  function choose(role: "reporter" | "responder") {
    setRole(role);
    router.push(role === "reporter" ? "/reporter" : "/responder");
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-slate-950 px-4 py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-red-700 text-white">
          <Radio className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">RescueMesh</h1>
        <p className="mt-2 max-w-md text-slate-400">
          Red descentralizada de coordinación para emergencias. Elige el rol de esta instancia.
        </p>
        <p className="mt-1 text-xs text-slate-500">Sin autenticación · Desktop MVP</p>
      </div>

      <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <AlertTriangle className="size-5 text-amber-400" />
              Reporter
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ciudadano afectado, voluntario o brigadista que registra lo que ocurre en texto libre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-700 hover:bg-red-600" onClick={() => choose("reporter")}>
              Entrar como Reporter
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Headphones className="size-5 text-sky-400" />
              Responder
            </CardTitle>
            <CardDescription className="text-slate-400">
              Brigada, ONG o centro de coordinación que prioriza incidentes y cambia su estado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-slate-100 text-slate-900 hover:bg-white"
              onClick={() => choose("responder")}
            >
              Entrar como Responder
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Building2 className="size-5 text-violet-400" />
              Command Center
            </CardTitle>
            <CardDescription className="text-slate-400">
              Tercer peer: vista operacional de mando. Usa{" "}
              <code className="text-violet-300">npm run dev:peer-c</code> (puerto 43149).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-violet-700 hover:bg-violet-600"
              onClick={() => choose("responder")}
            >
              Entrar como Command Center
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        <Link href="/plan" className="underline underline-offset-2 hover:text-slate-300">
          Ver plan de implementación
        </Link>
      </p>
    </div>
  );
}
