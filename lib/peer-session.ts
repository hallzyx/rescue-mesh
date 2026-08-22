export type AppRole = "reporter" | "responder";

const ROLE_KEY = "rescuemesh-role";
const PEER_KEY = "rescuemesh-peer-id";

function randomPeerId(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).toUpperCase().padStart(2, "0")).join("");
}

export function getPeerId(): string {
  if (typeof window === "undefined") return "--------";
  const existing = window.localStorage.getItem(PEER_KEY);
  if (existing) return existing;
  const peerId = randomPeerId();
  window.localStorage.setItem(PEER_KEY, peerId);
  return peerId;
}

export function getRole(): AppRole | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ROLE_KEY);
  if (value === "reporter" || value === "responder") return value;
  return null;
}

export function setRole(role: AppRole): string {
  const peerId = getPeerId();
  window.localStorage.setItem(ROLE_KEY, role);
  return peerId;
}

export function clearRole(): void {
  window.localStorage.removeItem(ROLE_KEY);
}
