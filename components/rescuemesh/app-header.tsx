"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearRole, getPeerId } from "@/lib/peer-session";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function AppHeader({
  role,
  title,
}: {
  role: "reporter" | "responder";
  title: string;
}) {
  const router = useRouter();
  const peerId = useSyncExternalStore(subscribe, getPeerId, () => "--------");

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-red-700 text-white">
            <Radio className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
              RescueMesh
            </p>
            <h1 className="truncate text-lg font-semibold text-slate-100">{title}</h1>
          </div>
        </div>
        <div className="hidden text-right text-xs text-slate-400 sm:block">
          <p className="font-mono">Peer {peerId}</p>
          <p className="capitalize">{role}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          onClick={() => {
            clearRole();
            router.push("/");
          }}
        >
          <RefreshCw data-icon="inline-start" />
          Cambiar rol
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-200"
          render={<Link href="/plan" />}
        >
          Plan
        </Button>
      </div>
    </header>
  );
}
