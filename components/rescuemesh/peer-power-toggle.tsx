"use client";

import { useEffect, useState } from "react";
import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_PEER_PROCESSES, type DemoPeerId } from "@/lib/demo-peers";
import { cn } from "@/lib/utils";

type PeerPowerToggleProps = {
  peer: DemoPeerId;
  online: boolean;
  className?: string;
};

function livingControllerUrls(except: DemoPeerId): string[] {
  return (Object.values(DEMO_PEER_PROCESSES) as { id: DemoPeerId; url: string }[])
    .filter((item) => item.id !== except)
    .map((item) => item.url);
}

export function PeerPowerToggle({ peer, online, className }: PeerPowerToggleProps) {
  const config = DEMO_PEER_PROCESSES[peer];
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState<"idle" | "stopping" | "starting">("idle");

  useEffect(() => {
    setArmed(false);
    if (online && pending === "starting") setPending("idle");
    if (!online && pending === "stopping") setPending("idle");
  }, [online, pending]);

  async function stopPeer() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setPending("stopping");
    try {
      await fetch(`${config.url}/api/demo/stop`, { method: "POST" });
    } catch {
      // The process already dropped the connection.
    }
  }

  async function startPeer() {
    setPending("starting");
    const controllers = [config.url, ...livingControllerUrls(peer)];
    for (const base of controllers) {
      try {
        const response = await fetch(`${base}/api/demo/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peer }),
        });
        if (response.ok) return;
      } catch {
        // That controller is down; try the next one.
      }
    }
    setPending("idle");
  }

  const stopping = pending === "stopping";
  const starting = pending === "starting";

  if (!online) {
    return (
      <Button
        type="button"
        disabled={starting}
        onClick={() => {
          void startPeer();
        }}
        className={cn(
          "w-full border border-emerald-800/80 bg-emerald-950/80 text-emerald-100 hover:bg-emerald-900",
          className,
        )}
      >
        <Power data-icon="inline-start" />
        {starting ? "Starting…" : `Start ${config.shortLabel}`}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      disabled={stopping}
      onClick={() => {
        void stopPeer();
      }}
      className={cn(
        "w-full border border-red-800/80 bg-red-950/80 text-red-100 hover:bg-red-900",
        armed && !stopping ? "ring-2 ring-red-400" : null,
        className,
      )}
    >
      <PowerOff data-icon="inline-start" />
      {stopping
        ? "Stopping…"
        : armed
          ? `Confirm: kill ${config.shortLabel}`
          : `Stop ${config.shortLabel}`}
    </Button>
  );
}
