import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

export function PlayerTeaser() {
  return (
    <section className="flex flex-col items-start gap-4 border-t border-border px-6 py-16 sm:py-20">
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        Player
      </span>
      <h2 className="font-[family-name:var(--font-display)] max-w-xs text-2xl font-bold leading-tight text-text-primary">
        Our finished series, made for vertical.
      </h2>
      <p className="max-w-sm text-sm leading-6 text-text-secondary">
        A dedicated vertical player showcasing our produced branded series —
        coming soon.
      </p>
      <Link href="/player" className={buttonVariants({ variant: "ghost" })}>
        Preview the Player
      </Link>
    </section>
  );
}
