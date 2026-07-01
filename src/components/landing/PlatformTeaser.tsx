import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

// Condensed teaser only — the full "how it works" breakdown now lives on
// /platform itself (see PlatformDashboard), so it isn't duplicated here.
export function PlatformTeaser() {
  return (
    <section className="flex flex-col items-start gap-4 border-t border-border px-6 py-16 sm:py-20">
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        AI Prototype
      </span>
      <h2 className="font-[family-name:var(--font-display)] max-w-xs text-2xl font-bold leading-tight text-text-primary">
        See your brand in a story before you shoot it.
      </h2>
      <p className="max-w-sm text-sm leading-6 text-text-secondary">
        Brand brief in, AI-generated vertical episode out — with three ways your
        product can appear on screen.
      </p>
      <Link href="/platform" className={buttonVariants({ variant: "ghost" })}>
        See how it works
      </Link>
    </section>
  );
}
