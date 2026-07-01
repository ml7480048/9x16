"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WIZARD_STORAGE_KEY } from "@/components/wizard/Wizard";

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
              // "New Session" should always start blank — without this, a
              // click here just resumes whatever wizard progress happened
              // to be sitting in localStorage from a previous attempt.
              // A plain browser reload/reopen mid-wizard still restores
              // normally, since that doesn't go through this onClick.
              if (item.href === "/platform/new") {
                window.localStorage.removeItem(WIZARD_STORAGE_KEY);
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
