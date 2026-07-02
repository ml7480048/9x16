import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { label: "AI Prototype", href: "/platform" },
  { label: "Verticals", href: "/player" },
  { label: "Contacts", href: "/contacts" },
  { label: "Team", href: "/team" },
];

interface HeaderProps {
  /** Optional small text-link row rendered under the logo — used by
   * /platform for its New Session / Sessions / Settings sub-nav, so it's
   * one floating nav row instead of a second full-width bar. */
  subNav?: ReactNode;
}

// A24-minimalist pass (2026-07): thin floating bar — no border, no shadow.
// Solid page-color background (not transparent): on the all-#0A0A0A pages
// it's visually identical to transparent, but when bright media scrolls
// underneath (session detail video, /demo) the nav text stayed legible —
// found unreadable over a light video frame in the Day 14 mobile pass.
export function Header({ subNav }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex flex-col gap-2 bg-background px-6 py-5">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl leading-none text-text-primary"
        >
          9×16
        </Link>
        {/* gap/size step down at mobile widths — at 375px the four labels
            plus logo overflow one line and "AI Prototype" wraps onto the
            logo (found in the Day 14 mobile pass). */}
        <nav className="flex items-center gap-3 sm:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-xs text-text-secondary transition-colors hover:text-text-primary sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {subNav && <div className="flex items-center gap-4">{subNav}</div>}
    </header>
  );
}
