import { NetworkPanel } from "@/components/rescuemesh/network-panel";

export default function ReporterNetworkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-50">Network</h2>
        <p className="mt-2 text-slate-400">
          Diagnóstico de esta instancia: Pear mesh, QVAC local y estado de sincronización.
        </p>
      </div>
      <div className="max-w-lg">
        <NetworkPanel />
      </div>
    </div>
  );
}
