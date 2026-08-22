"use client";

import { useSearchParams } from "next/navigation";
import { DemoStatusBar } from "@/components/rescuemesh/demo-status-bar";
import { QvacWarmup } from "@/components/rescuemesh/qvac-warmup";
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
      </div>
      {children}
    </div>
  );
}
