import { NetworkPanel } from "@/components/rescuemesh/network-panel";

export default function ResponderNetworkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-50">Network Diagnostics</h2>
        <p className="mt-2 text-slate-400">
          Datos de runtime de esta instancia. Pear conectará peers en la Fase 2.
        </p>
      </div>
      <div className="max-w-lg">
        <NetworkPanel connectedPeers={0} />
      </div>
    </div>
  );
}
