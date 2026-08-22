import type { Incident } from "@/domain/incident";

export type P2PHello = {
  type: "hello";
  peerId: string;
  publicKey: string;
  coreKey: string;
};

export type P2PUpsert = {
  type: "upsert";
  incident: Incident;
};

export type P2PMessage = P2PHello | P2PUpsert;

export function encodeMessage(message: P2PMessage): Buffer {
  const json = JSON.stringify(message);
  const body = Buffer.from(json, "utf8");
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}

export function createMessageDecoder(onMessage: (message: P2PMessage) => void) {
  let buffer = Buffer.alloc(0);

  return (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 4) {
      const length = buffer.readUInt32BE(0);
      if (length > 2_000_000) {
        buffer = Buffer.alloc(0);
        return;
      }
      if (buffer.length < 4 + length) return;
      const body = buffer.subarray(4, 4 + length);
      buffer = buffer.subarray(4 + length);

      try {
        const message = JSON.parse(body.toString("utf8")) as P2PMessage;
        onMessage(message);
      } catch {
        // ignore malformed frames
      }
    }
  };
}
