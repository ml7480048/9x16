"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { WIZARD_STORAGE_KEY } from "@/components/wizard/Wizard";

const steps = [
  {
    number: "1",
    title: "Tell us about your brand",
    body: "Brand name, product, tone, audience, campaign goal — a couple minutes of input.",
  },
  {
    number: "2",
    title: "AI generates a vertical episode",
    body: "Storyboard, script, and scene visuals for a short branded story, ready in minutes.",
  },
  {
    number: "3",
    title: "Compare 3 integration styles",
    body: "Ambient, narrative, or direct — watch your product in each and pick what fits your brand.",
  },
];

export default function PlatformDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-10 py-16 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary">
          Test your brand in a vertical story before shooting a frame
        </h1>
        <p className="text-sm leading-6 text-text-secondary">
          AI Prototype turns a brand brief into a short vertical video concept —
          with three ways your product can appear on screen — so you can see
          what works before committing to production.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 text-left">
        {steps.map((step) => (
          <Card key={step.number} className="flex items-start gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              {step.number}
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-text-primary">
                {step.title}
              </h2>
              <p className="text-xs leading-5 text-text-secondary">
                {step.body}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Link
        href="/platform/new"
        onClick={() => window.sessionStorage.removeItem(WIZARD_STORAGE_KEY)}
        className={buttonVariants()}
      >
        Start my free prototype
      </Link>
    </div>
  );
}
