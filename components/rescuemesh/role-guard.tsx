"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/lib/peer-session";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function useHasMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function RoleGuard({
  role,
  children,
}: {
  role: "reporter" | "responder";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const mounted = useHasMounted();
  const currentRole = useSyncExternalStore(subscribe, getRole, () => null);

  useEffect(() => {
    if (!mounted) return;
    if (currentRole === null) {
      router.replace("/");
      return;
    }
    if (currentRole !== role) {
      router.replace(currentRole === "reporter" ? "/reporter" : "/responder");
    }
  }, [mounted, currentRole, role, router]);

  if (!mounted || currentRole !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading instance…
      </div>
    );
  }

  return children;
}
