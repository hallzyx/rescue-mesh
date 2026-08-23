"use client";

import { useState } from "react";
import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StopPeerButtonProps = {
  endpoint?: string;
  label: string;
  confirmLabel?: string;
  className?: string;
  variant?: "banner" | "card";
};

export function StopPeerButton({
  endpoint = "/api/demo/stop",
  label,
  confirmLabel = "Confirm: kill process",
  className,
  variant = "card",
}: StopPeerButtonProps) {
  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState<"idle" | "stopping" | "closed" | "error">("idle");

  async function stopPeer() {
    if (!armed) {
      setArmed(true);
      return;
    }

    setStatus("stopping");
    try {
      await fetch(endpoint, { method: "POST" });
      setStatus("closed");
    } catch {
      setStatus("closed");
    }
  }

  const closed = status === "closed" || status === "stopping";

  return (
    <Button
      type="button"
      disabled={closed}
      onClick={() => {
        void stopPeer();
      }}
      className={cn(
        "w-full",
        variant === "banner"
          ? "bg-red-800 text-white hover:bg-red-700"
          : "border border-red-800/80 bg-red-950/80 text-red-100 hover:bg-red-900",
        armed && !closed ? "ring-2 ring-red-400" : null,
        className,
      )}
    >
      <Power data-icon="inline-start" />
      {closed ? "Peer CLOSED" : armed ? confirmLabel : label}
    </Button>
  );
}
