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
const PEER_C_URL = "http://127.0.0.1:43149";

export default function DemoDirectorPage() {
  const [peerA, setPeerA] = useState("------");
  const [peerB, setPeerB] = useState("------");
  const [peerC, setPeerC] = useState("------");
  const [p2pConnected, setP2pConnected] = useState(false);

  useEffect(() => {
    let active = true;
    async function readStatus(base: string) {
      const response = await fetch(`${base}/api/p2p/status`, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      return response.json() as Promise<{
        peerId?: string;
        swarmPublicKey?: string;
        connectedCount?: number;
      }>;
    }

    async function refresh() {
      const [a, b, c] = await Promise.allSettled([
        readStatus(PEER_A_URL),
        readStatus(PEER_B_URL),
        readStatus(PEER_C_URL),
      ]);

      if (!active) return;

      const statusA = a.status === "fulfilled" ? a.value : null;
      const statusB = b.status === "fulfilled" ? b.value : null;
      const statusC = c.status === "fulfilled" ? c.value : null;

      setPeerA(statusA?.peerId ?? "offline");
      setPeerB(statusB?.peerId ?? "offline");
      setPeerC(statusC?.peerId ?? "offline");
      setP2pConnected((statusA?.connectedCount ?? 0) > 0 && (statusB?.connectedCount ?? 0) > 0);

      if (
        statusA?.swarmPublicKey &&
        statusB?.swarmPublicKey &&
        ((statusA.connectedCount ?? 0) === 0 || (statusB.connectedCount ?? 0) === 0)
      ) {
        await Promise.all([
          fetch(`${PEER_A_URL}/api/p2p/introduce`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey: statusB.swarmPublicKey }),
          }),
          fetch(`${PEER_B_URL}/api/p2p/introduce`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey: statusA.swarmPublicKey }),
          }),
        ]).catch(() => undefined);
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

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-xl text-red-300">Peer A — Citizen</CardTitle>
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
              <CardTitle className="text-xl text-sky-300">Peer B — Brigade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-2xl font-bold">{peerB}</p>
              <p className="text-sm text-slate-400">{PEER_B_URL}</p>
              <Button className="w-full bg-sky-700 hover:bg-sky-600" render={<Link href={`${PEER_B_URL}/responder?demo=1`} target="_blank" />} >
                Abrir Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-xl text-violet-300">Peer C — Command</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-2xl font-bold">{peerC}</p>
              <p className="text-sm text-slate-400">{PEER_C_URL}</p>
              <Button className="w-full bg-violet-700 hover:bg-violet-600" render={<Link href={`${PEER_C_URL}/responder?demo=1`} target="_blank" />} >
                Abrir Command Center
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
            {p2pConnected
              ? "P2P CONNECTED ✓"
              : "Levanta peers: npm run dev:peer-a, dev:peer-b y dev:peer-c"}
          </p>
          <p className="mt-2 text-sm italic text-slate-400">
            The original reporter is gone. The incident isn&apos;t.
          </p>
        </div>
      </div>
    </div>
  );
}
