export const LOCAL_PEER_ENDPOINTS = [
  { url: "http://127.0.0.1:43147", shortLabel: "Peer A", label: "Peer A — Citizen" },
  { url: "http://127.0.0.1:43148", shortLabel: "Peer B", label: "Peer B — Brigade" },
  { url: "http://127.0.0.1:43149", shortLabel: "Peer C", label: "Peer C — Command Center" },
] as const;

export type LocalPeerEndpoint = (typeof LOCAL_PEER_ENDPOINTS)[number];

export type LocalDeviceStatus = {
  url: string;
  shortLabel: string;
  label: string;
  peerId: string;
  instanceLabel: string;
  online: boolean;
  self: boolean;
};

export async function probeLocalDevices(selfPeerId?: string): Promise<LocalDeviceStatus[]> {
  return Promise.all(
    LOCAL_PEER_ENDPOINTS.map(async (peer) => {
      try {
        const response = await fetch(`${peer.url}/api/p2p/status?t=${Date.now()}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(900),
        });
        if (!response.ok) {
          return {
            url: peer.url,
            shortLabel: peer.shortLabel,
            label: peer.label,
            peerId: "offline",
            instanceLabel: "",
            online: false,
            self: false,
          };
        }
        const body = (await response.json()) as {
          peerId?: string;
          instanceLabel?: string;
        };
        const peerId = body.peerId || "------";
        return {
          url: peer.url,
          shortLabel: peer.shortLabel,
          label: peer.label,
          peerId,
          instanceLabel: body.instanceLabel?.trim() || "",
          online: true,
          self: Boolean(selfPeerId && peerId === selfPeerId),
        };
      } catch {
        return {
          url: peer.url,
          shortLabel: peer.shortLabel,
          label: peer.label,
          peerId: "offline",
          instanceLabel: "",
          online: false,
          self: false,
        };
      }
    }),
  );
}
