"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "New Session", href: "/platform/new" },
  { label: "Sessions", href: "/platform/sessions" },
  { label: "Settings", href: "/platform/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-border bg-surface p-2 sm:h-full sm:w-56 sm:flex-col sm:gap-1 sm:overflow-visible sm:border-b-0 sm:border-r sm:p-4">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-input px-3 py-2 text-sm transition-colors",
              active
                ? "bg-surface-elevated text-accent"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
