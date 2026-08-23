export const DEMO_PEER_IDS = ["a", "b", "c"] as const;

export type DemoPeerId = (typeof DEMO_PEER_IDS)[number];

export const DEMO_PEER_PROCESSES: Record<
  DemoPeerId,
  {
    id: DemoPeerId;
    port: number;
    url: string;
    distDir: string;
    storage: string;
    label: string;
    shortLabel: string;
  }
> = {
  a: {
    id: "a",
    port: 43147,
    url: "http://127.0.0.1:43147",
    distDir: ".next-a",
    storage: ".p2p-data-a",
    label: "Citizen",
    shortLabel: "Peer A",
  },
  b: {
    id: "b",
    port: 43148,
    url: "http://127.0.0.1:43148",
    distDir: ".next-b",
    storage: ".p2p-data-b",
    label: "Brigade",
    shortLabel: "Peer B",
  },
  c: {
    id: "c",
    port: 43149,
    url: "http://127.0.0.1:43149",
    distDir: ".next-c",
    storage: ".p2p-data-c",
    label: "Command Center",
    shortLabel: "Peer C",
  },
};

export function isDemoPeerId(value: string): value is DemoPeerId {
  return DEMO_PEER_IDS.includes(value as DemoPeerId);
}
