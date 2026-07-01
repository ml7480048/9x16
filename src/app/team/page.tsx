import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TeamPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 px-6 py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Team
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
          Coming soon.
        </h1>
        <p className="max-w-xs text-sm text-text-secondary">
          The people behind 9×16 — page in development.
        </p>
      </main>
      <Footer />
    </div>
  );
}
