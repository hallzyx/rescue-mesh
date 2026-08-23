import { spawn } from "node:child_process";
import { DEMO_PEER_PROCESSES, type DemoPeerId } from "@/lib/demo-peers";

const starting = new Set<DemoPeerId>();

export async function isDemoPeerOnline(peer: DemoPeerId): Promise<boolean> {
  const { url } = DEMO_PEER_PROCESSES[peer];
  try {
    const response = await fetch(`${url}/api/p2p/status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(900),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function startDemoPeer(
  peer: DemoPeerId,
): Promise<{ alreadyRunning: boolean; pid?: number }> {
  if (await isDemoPeerOnline(peer)) {
    return { alreadyRunning: true };
  }
  if (starting.has(peer)) {
    return { alreadyRunning: true };
  }

  starting.add(peer);
  setTimeout(() => starting.delete(peer), 20_000);

  const config = DEMO_PEER_PROCESSES[peer];
  const env = {
    ...process.env,
    RESCUEMESH_NEXT_DIST: config.distDir,
    RESCUEMESH_P2P_STORAGE: config.storage,
    RESCUEMESH_INSTANCE_LABEL: config.label,
  };

  const child =
    process.platform === "win32"
      ? spawn(
          "cmd.exe",
          ["/d", "/s", "/c", `npx next dev --port ${config.port}`],
          {
            cwd: process.cwd(),
            env,
            detached: true,
            stdio: "ignore",
            windowsHide: true,
          },
        )
      : spawn("npx", ["next", "dev", "--port", String(config.port)], {
          cwd: process.cwd(),
          env,
          detached: true,
          stdio: "ignore",
        });

  child.unref();
  return { alreadyRunning: false, pid: child.pid };
}
