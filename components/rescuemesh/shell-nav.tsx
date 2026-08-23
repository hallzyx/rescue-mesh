"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const reporterLinks = [
  { href: "/reporter", label: "Home" },
  { href: "/reporter/report", label: "Report Emergency" },
  { href: "/reporter/reports", label: "My Reports" },
  { href: "/reporter/network", label: "Network" },
];

const responderLinks = [
  { href: "/responder", label: "Dashboard" },
  { href: "/responder/network", label: "Network" },
];

export function ShellNav({ role }: { role: "reporter" | "responder" }) {
  const pathname = usePathname();
  const links = role === "reporter" ? reporterLinks : responderLinks;

  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== `/${role}` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-red-500 text-red-300"
                  : "border-transparent text-slate-400 hover:text-slate-200",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
