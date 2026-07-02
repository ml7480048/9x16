"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Branded runtime-error boundary (Day 16 evening) — catches render/data
// crashes anywhere below the root layout so visitors get an on-brand
// recovery screen instead of Next.js's unstyled default.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="animate-fade-in mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-4 px-6 py-24">
        <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          Error
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-text-primary">
          Something broke mid-scene.
        </h1>
        <p className="max-w-sm text-sm leading-6 text-text-secondary">
          An unexpected error interrupted this page. Your session progress is
          saved — trying again usually picks up right where you left off.
        </p>
        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-accent transition-colors hover:text-text-primary"
        >
          Try again <span aria-hidden="true">→</span>
        </button>
      </main>
      <Footer />
    </div>
  );
}
