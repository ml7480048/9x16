"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearCurrentSession } from "@/lib/sessions";

const navItems = [
  { label: "New Session", href: "/platform/new" },
  { label: "Sessions", href: "/platform/sessions" },
  { label: "Settings", href: "/platform/settings" },
];

// A24-minimalist pass (2026-07): no longer a full-width side column — a row
// of small text links rendered inside Header's subNav slot, directly under
// the "9×16" logo. One floating nav row for /platform instead of two bars.
export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              // "New Session" should always start blank — clearing the
              // current-session pointer makes the wizard mint a fresh id
              // instead of resuming in-flight progress. The previous
              // session itself stays in the store (visible under
              // Sessions), unlike the pre-Day-13 behavior which deleted
              // the only copy. A plain reload mid-wizard still restores,
              // since that doesn't go through this onClick.
              if (item.href === "/platform/new") {
                clearCurrentSession();
              }
            }}
            className={cn(
              "whitespace-nowrap text-xs transition-colors",
              active
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
