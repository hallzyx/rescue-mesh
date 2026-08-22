export type PeerConnectionInfo = {
  peerId: string;
  publicKey: string;
  status: "connected" | "disconnected";
};

export type P2PDiagnostics = {
  peerId: string;
  publicKey: string;
  coreKey: string;
  connectedPeers: PeerConnectionInfo[];
  connectedCount: number;
  isolated: boolean;
  storagePath: string;
};

export function shortPeerId(publicKey: string): string {
  return publicKey.replace(/[^a-f0-9]/gi, "").slice(0, 6).toUpperCase() || "------";
}
