import { Suspense } from "react";
import { AppHeader } from "@/components/rescuemesh/app-header";
import { DemoChrome } from "@/components/rescuemesh/demo-chrome";
import { RoleGuard } from "@/components/rescuemesh/role-guard";
import { ShellNav } from "@/components/rescuemesh/shell-nav";

export default function ResponderLayout({ children }: LayoutProps<"/responder">) {
  return (
    <RoleGuard role="responder">
      <Suspense fallback={null}>
        <DemoChrome>
          <div className="min-h-screen bg-slate-950 text-slate-100">
            <AppHeader role="responder" title="Responder" />
            <ShellNav role="responder" />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
          </div>
        </DemoChrome>
      </Suspense>
    </RoleGuard>
  );
}
