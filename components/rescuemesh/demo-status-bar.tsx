"use client";

import { useEffect, useState } from "react";
import { fetchP2PStatus } from "@/p2p/client";
import { fetchQvacStatus } from "@/qvac/client";

type RuntimeFlags = {
  aiLocal: boolean;
  p2pConnected: boolean;
  centralServerNone: boolean;
  qvacReady: boolean;
  loading: boolean;
};

export function DemoStatusBar({ compact = false }: { compact?: boolean }) {
  const [flags, setFlags] = useState<RuntimeFlags>({
    aiLocal: false,
    p2pConnected: false,
    centralServerNone: true,
    qvacReady: false,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    async function refresh() {
      const [qvac, p2p] = await Promise.all([
        fetchQvacStatus().catch(() => null),
        fetchP2PStatus().catch(() => null),
      ]);

      if (!active) return;

      setFlags({
        aiLocal: Boolean(qvac) && qvac.externalApi === false,
        p2pConnected: (p2p?.connectedCount ?? 0) > 0,
        centralServerNone: true,
        qvacReady: Boolean(qvac?.warmupReady || qvac?.modelLoaded),
        loading: false,
      });
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

  const items = [
    {
      label: "AI LOCAL",
      ok: flags.aiLocal,
      hint: flags.qvacReady ? "QVAC ready" : "Local engine online",
    },
    {
      label: flags.p2pConnected ? "P2P CONNECTED" : "P2P ISOLATED",
      ok: flags.p2pConnected,
      hint: flags.p2pConnected ? "Pear mesh active" : "No peers yet",
    },
    {
      label: "CENTRAL SERVER NONE",
      ok: flags.centralServerNone,
      hint: "No RescueMesh backend",
    },
  ];

  return (
    <div
      className={
        compact
          ? "border-b border-slate-800 bg-slate-950/95 px-4 py-2"
          : "rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4"
      }
    >
      <div
        className={
          compact
            ? "flex flex-wrap items-center justify-center gap-4 font-mono text-xs sm:gap-8 sm:text-sm"
            : "flex flex-wrap items-center justify-center gap-6 font-mono text-sm sm:gap-10 sm:text-base"
        }
      >
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className={
                flags.loading
                  ? "text-slate-500"
                  : item.ok
                    ? "text-emerald-400"
                    : "text-amber-400"
              }
            >
              {flags.loading ? "…" : item.ok ? "✓" : "!"}
            </span>
            <div>
              <p className="font-semibold tracking-wide text-slate-100">{item.label}</p>
              {!compact ? <p className="text-xs text-slate-500">{item.hint}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
