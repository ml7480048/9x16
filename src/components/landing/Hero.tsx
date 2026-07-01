import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="flex flex-col items-start gap-6 px-6 py-24 sm:py-32">
      <h1 className="font-[family-name:var(--font-display)] max-w-xs text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:max-w-md sm:text-5xl">
        Test before you invest.
      </h1>
      <p className="max-w-sm text-lg leading-8 text-text-secondary">
        AI-generated story prototypes for brands — before a single camera
        rolls.
      </p>
      <Link href="/platform/new" className={buttonVariants()}>
        Start a Prototype
      </Link>
    </section>
  );
}
