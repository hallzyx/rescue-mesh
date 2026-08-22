import { AppHeader } from "@/components/rescuemesh/app-header";
import { RoleGuard } from "@/components/rescuemesh/role-guard";
import { ShellNav } from "@/components/rescuemesh/shell-nav";

export default function ReporterLayout({ children }: LayoutProps<"/reporter">) {
  return (
    <RoleGuard role="reporter">
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <AppHeader role="reporter" title="Reporter" />
        <ShellNav role="reporter" />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </RoleGuard>
  );
}
