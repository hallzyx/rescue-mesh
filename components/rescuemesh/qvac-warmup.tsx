"use client";

import { useEffect } from "react";
import { LOCAL_PEER_ENDPOINTS } from "@/lib/local-peers";
import { warmupQvac } from "@/qvac/client";

export function QvacWarmup() {
  useEffect(() => {
    void warmupQvac();
    for (const peer of LOCAL_PEER_ENDPOINTS) {
      void fetch(`${peer.url}/api/qvac/warmup`, { method: "POST" }).catch(() => undefined);
    }
  }, []);

  return null;
}
