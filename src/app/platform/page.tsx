"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { clearCurrentSession } from "@/lib/sessions";

const steps = [
  {
    number: "01",
    title: "Tell us about your brand",
    body: "Brand name, product, tone, audience, campaign goal — a couple minutes of input.",
  },
  {
    number: "02",
    title: "AI generates a vertical episode",
    body: "Storyboard, script, and scene visuals for a short branded story, ready in minutes.",
  },
  {
    number: "03",
    title: "Compare 3 integration styles",
    body: "Ambient, narrative, or direct — watch your product in each and pick what fits your brand.",
  },
];

// A24-minimalist pass (2026-07): dropped the numbered-circle Card grid —
// plain 01/02/03 typographic labels instead, no boxes, no icons.
export default function PlatformDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-16 py-20">
      <div className="relative flex flex-col gap-4 overflow-hidden py-10">
        <video
          src="/hero-preview.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.15]"
        />
        <h1 className="relative font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-text-primary sm:text-6xl">
          Test your brand in a vertical story
          <br />
          before shooting a frame
        </h1>
      </div>

      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div
            key={step.number}
            className={`flex flex-col gap-2 py-8 ${
              i !== 0 ? "border-t border-border" : ""
            }`}
          >
            <span className="text-xs font-medium text-text-secondary">
              {step.number}
            </span>
            <h2 className="text-lg font-medium text-text-primary">
              {step.title}
            </h2>
            <p className="max-w-sm text-xs leading-5 text-text-secondary">
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <div>
        <Link
          href="/platform/new"
          onClick={() => clearCurrentSession()}
          className={buttonVariants({ variant: "accent" })}
        >
          Start my free prototype <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
