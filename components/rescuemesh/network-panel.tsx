"use client";

import { useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { getPeerId } from "@/lib/peer-session";
import { fetchQvacStatus, type QvacRuntimeStatus } from "@/qvac/client";

function subscribe() {
  return () => {};
}

function formatAiStatus(status: QvacRuntimeStatus | null): string {
  if (!status) return "Loading…";
  if (status.provider === "qvac-sdk") {
    return status.modelLoaded ? "QVAC SDK (model loaded)" : "QVAC SDK (model not loaded)";
  }
  return "LOCAL ENGINE (fallback)";
}

export function NetworkPanel({ connectedPeers = 0 }: { connectedPeers?: number }) {
  const peerId = useSyncExternalStore(subscribe, getPeerId, () => "--------");
  const isolated = connectedPeers === 0;
  const [qvacStatus, setQvacStatus] = useState<QvacRuntimeStatus | null>(null);

  useEffect(() => {
    let active = true;
    fetchQvacStatus()
      .then((status) => {
        if (active) setQvacStatus(status);
      })
      .catch(() => {
        if (active) {
          setQvacStatus({
            provider: "local-engine",
            externalApi: false,
            sdkInstalled: false,
            modelLoaded: false,
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 font-mono text-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Network</p>
      <div className="space-y-3 text-slate-300">
        <div>
          <p className="text-slate-500">Node</p>
          <p>{peerId}</p>
        </div>
        <div>
          <p className="text-slate-500">Connected peers</p>
          <p>{connectedPeers}</p>
        </div>
        <div>
          <p className="text-slate-500">AI</p>
          <p>{formatAiStatus(qvacStatus)}</p>
          {qvacStatus ? (
            <p className="mt-1 text-xs text-slate-500">
              External AI API: {qvacStatus.externalApi ? "YES" : "NONE"}
            </p>
          ) : null}
        </div>
        <div>
          <p className="text-slate-500">Central backend</p>
          <p className="text-emerald-400">NONE</p>
        </div>
        {isolated ? (
          <div className="mt-4 rounded border border-amber-800/60 bg-amber-950/30 p-3 text-amber-200">
            <p className="font-semibold">ISOLATED</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
              No peers currently available. Your report is safely stored locally. It will
              synchronize when connectivity returns.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
