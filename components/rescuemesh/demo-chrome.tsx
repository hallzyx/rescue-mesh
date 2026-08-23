"use client";

import { useSearchParams } from "next/navigation";
import { DemoStatusBar } from "@/components/rescuemesh/demo-status-bar";
import { QvacWarmup } from "@/components/rescuemesh/qvac-warmup";
import { StopPeerButton } from "@/components/rescuemesh/stop-peer-button";
import { SystemBanner } from "@/components/rescuemesh/system-banner";

export function DemoChrome({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const demoMode = searchParams.get("demo") === "1";

  return (
    <div className={demoMode ? "demo-mode" : undefined}>
      <QvacWarmup />
      <DemoStatusBar compact />
      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-4 sm:px-6">
        <SystemBanner />
        {demoMode ? (
          <div className="flex flex-col gap-2 rounded-xl border border-red-900/70 bg-red-950/40 p-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-red-100">
              Step 6: stop this peer from the UI. It kills the process, not just the tab.
            </p>
            <StopPeerButton
              variant="banner"
              className="sm:w-auto"
              label="Stop this peer"
              confirmLabel="Confirm: kill process"
            />
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
