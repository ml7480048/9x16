import Link from "next/link";

const navItems = [
  { label: "AI Prototype", href: "/platform" },
  { label: "Verticals", href: "/player" },
  { label: "Contacts", href: "/contacts" },
  { label: "Team", href: "/team" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-text-primary"
      >
        9×16
      </Link>
      <nav className="flex items-center gap-5">
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
    </header>
  );
}
