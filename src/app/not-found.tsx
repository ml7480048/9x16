import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { buttonVariants } from "@/components/ui/Button";

// Branded 404 (Day 16 evening) — before this, unknown routes fell back to
// Next.js's unstyled default, which broke the A24 look for something as
// simple as a mistyped link.
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="animate-fade-in mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-4 px-6 py-24">
        <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          404
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-text-primary">
          This scene doesn&apos;t exist.
        </h1>
        <p className="max-w-sm text-sm leading-6 text-text-secondary">
          The page you&apos;re looking for was moved, renamed, or never made
          it past the storyboard.
        </p>
        <Link href="/" className={buttonVariants({ variant: "accent" })}>
          Back to the homepage <span aria-hidden="true">→</span>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
