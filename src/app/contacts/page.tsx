import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// A24-minimalist pass (2026-07): single centered block, nothing else on
// the page — no eyebrow label, no supporting paragraph, no dt/dl structure.
export default function ContactsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-text-primary">
          Let&apos;s talk.
        </h1>
        <a href="mailto:hello@9x16.at" className="text-lg text-accent">
          hello@9x16.at
        </a>
        <p className="text-sm text-text-secondary">Vienna, Austria</p>
      </main>
      <Footer />
    </div>
  );
}
