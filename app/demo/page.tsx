"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DemoStatusBar } from "@/components/rescuemesh/demo-status-bar";
import { QvacWarmup } from "@/components/rescuemesh/qvac-warmup";
import { demoSteps } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PEER_A_URL = "http://127.0.0.1:43147";
const PEER_B_URL = "http://127.0.0.1:43148";

export default function DemoDirectorPage() {
  const [peerA, setPeerA] = useState("------");
  const [peerB, setPeerB] = useState("------");
  const [p2pConnected, setP2pConnected] = useState(false);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const status = await fetch(`${PEER_B_URL}/api/p2p/status`, { cache: "no-store" }).then(
          (response) => response.json(),
        );
        if (!active) return;
        setPeerB(status.peerId ?? "------");
        setP2pConnected((status.connectedCount ?? 0) > 0);
      } catch {
        if (!active) return;
        setPeerB("offline");
      }

      try {
        const status = await fetch(`${PEER_A_URL}/api/p2p/status`, { cache: "no-store" }).then(
          (response) => response.json(),
        );
        if (!active) return;
        setPeerA(status.peerId ?? "------");
      } catch {
        if (!active) return;
        setPeerA("offline");
      }
    }

    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 2000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <QvacWarmup />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
            RescueMesh · Demo Director
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">Fase 3 — OBS Layout</h1>
          <p className="max-w-3xl text-slate-400">
            Pantalla de control para grabar la demo. Abre Reporter y Responder en ventanas lado a lado
            (1080p). Precalienta QVAC antes de grabar.
          </p>
        </header>

        <DemoStatusBar />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-xl text-red-300">Peer A — Reporter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-2xl font-bold">{peerA}</p>
              <p className="text-sm text-slate-400">{PEER_A_URL}</p>
              <Button className="w-full bg-red-700 hover:bg-red-600" render={<Link href={`${PEER_A_URL}/reporter/report?demo=1`} target="_blank" />} >
                Abrir Report Emergency
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-xl text-violet-300">Peer B — Responder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-2xl font-bold">{peerB}</p>
              <p className="text-sm text-slate-400">{PEER_B_URL}</p>
              <Button className="w-full bg-violet-700 hover:bg-violet-600" render={<Link href={`${PEER_B_URL}/responder?demo=1`} target="_blank" />} >
                Abrir Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-lg">Flujo de 7 pasos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoSteps.map((step) => (
              <div
                key={step.step}
                className="rounded-lg border border-slate-800 bg-slate-950/50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Paso {step.step}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-100">{step.title}</p>
                <p className="mt-2 text-sm text-slate-400">{step.action}</p>
                <p className="mt-2 font-mono text-xs text-emerald-300">{step.show}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-center">
          <p className="text-lg font-semibold text-slate-200">
            {p2pConnected ? "P2P CONNECTED ✓" : "Levanta ambos peers: npm run dev:peer-a y dev:peer-b"}
          </p>
          <p className="mt-2 text-sm italic text-slate-400">
            The original reporter is gone. The incident isn&apos;t.
          </p>
        </div>
      </div>
    </div>
  );
}
