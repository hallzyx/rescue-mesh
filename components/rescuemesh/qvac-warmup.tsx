"use client";

import { useEffect } from "react";
import { warmupQvac } from "@/qvac/client";

export function QvacWarmup() {
  useEffect(() => {
    void warmupQvac();
  }, []);

  return null;
}
