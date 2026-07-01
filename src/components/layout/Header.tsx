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

// A24-minimalist pass (2026-07): thin, transparent, floating bar — no
// background fill, no border. Sits directly on top of whatever content
// scrolls beneath it.
export function Header({ subNav }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex flex-col gap-2 px-6 py-5">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl leading-none text-text-primary"
        >
          9×16
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
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
