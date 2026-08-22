"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/lib/peer-session";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function RoleGuard({
  role,
  children,
}: {
  role: "reporter" | "responder";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const currentRole = useSyncExternalStore(subscribe, getRole, () => null);

  useEffect(() => {
    if (currentRole === null) {
      router.replace("/");
      return;
    }
    if (currentRole !== role) {
      router.replace(currentRole === "reporter" ? "/reporter" : "/responder");
    }
  }, [currentRole, role, router]);

  if (currentRole !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Cargando instancia…
      </div>
    );
  }

  return children;
}
