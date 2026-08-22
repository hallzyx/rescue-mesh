"use client";

import { useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { getPeerId } from "@/lib/peer-session";
import { fetchQvacStatus, type QvacRuntimeStatus } from "@/qvac/client";
import { fetchP2PStatus } from "@/p2p/client";

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

type P2PStatus = {
  peerId: string;
  connectedCount: number;
  isolated: boolean;
  connectedPeers: { peerId: string; status: string }[];
};

export function NetworkPanel() {
  const appPeerId = useSyncExternalStore(subscribe, getPeerId, () => "--------");
  const [qvacStatus, setQvacStatus] = useState<QvacRuntimeStatus | null>(null);
  const [p2pStatus, setP2pStatus] = useState<P2PStatus | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      const [qvac, p2p] = await Promise.all([
        fetchQvacStatus().catch(
          (): QvacRuntimeStatus => ({
            provider: "local-engine",
            externalApi: false,
            sdkInstalled: false,
            modelLoaded: false,
          }),
        ),
        fetchP2PStatus().catch(
          (): P2PStatus => ({
            peerId: "------",
            connectedCount: 0,
            isolated: true,
            connectedPeers: [],
          }),
        ),
      ]);

      if (!active) return;
      setQvacStatus(qvac);
      setP2pStatus(p2p);
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

  const nodeId = p2pStatus?.peerId ?? appPeerId;
  const connectedCount = p2pStatus?.connectedCount ?? 0;
  const isolated = p2pStatus?.isolated ?? true;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 font-mono text-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Network</p>
      <div className="space-y-3 text-slate-300">
        <div>
          <p className="text-slate-500">Node</p>
          <p>{nodeId}</p>
          <p className="mt-1 text-xs text-slate-500">App peer: {appPeerId}</p>
        </div>
        <div>
          <p className="text-slate-500">Connected peers</p>
          <p>{connectedCount}</p>
          {p2pStatus?.connectedPeers.length ? (
            <ul className="mt-2 space-y-1 text-xs text-emerald-300">
              {p2pStatus.connectedPeers.map((peer) => (
                <li key={peer.peerId}>
                  {peer.peerId} · {peer.status.toUpperCase()}
                </li>
              ))}
            </ul>
          ) : null}
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
        ) : (
          <div className="mt-4 rounded border border-emerald-800/60 bg-emerald-950/30 p-3 text-emerald-200">
            <p className="font-semibold">P2P CONNECTED</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
              Pear mesh active. Incidents and status updates replicate between peers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
