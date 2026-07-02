"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VerticalPlayer } from "@/components/player/VerticalPlayer";
import { VariantSwitcher } from "@/components/player/VariantSwitcher";
import { buttonVariants } from "@/components/ui/Button";
import { VARIANT_DEFINITIONS, type VariantLabel } from "@/lib/kling";

// Public showcase demo — no real brand session behind it (no auth, no Kling
// spend), so it plays fixed public sample clips instead of generated video.
// Reuses VARIANT_DEFINITIONS from lib/kling.ts for the one-line explanation
// under the player, so this copy can't drift out of sync with what the real
// A/B/C variants actually do.
const DEMO_CLIPS: Record<VariantLabel, string> = {
  A: "https://www.w3schools.com/html/mov_bbb.mp4",
  B: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  C: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
};

export default function DemoPage() {
  const [activeLabel, setActiveLabel] = useState<VariantLabel>("A");
  const active = VARIANT_DEFINITIONS.find((v) => v.label === activeLabel)!;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-8 px-6 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-center text-5xl leading-[0.95] text-text-primary">
          Experience the Brand Prototype
        </h1>

        <div className="flex w-full max-w-[380px] flex-col gap-4">
          {/* All 3 players stay mounted (inactive hidden) so switching is
              instant — same preload pattern as the real wizard Step 5. */}
          {VARIANT_DEFINITIONS.map((variant) => (
            <div
              key={variant.label}
              className={
                variant.label === activeLabel ? "animate-fade-in" : "hidden"
              }
            >
              <VerticalPlayer
                videoUrl={DEMO_CLIPS[variant.label]}
                label={`Variant ${variant.label} sample`}
                active={variant.label === activeLabel}
              />
            </div>
          ))}
          <VariantSwitcher
            variants={VARIANT_DEFINITIONS}
            activeLabel={activeLabel}
            onSelect={setActiveLabel}
          />
          <p className="text-sm leading-6 text-text-secondary">
            {active.modifier}
          </p>
        </div>

        <Link
          href="/platform/new"
          className={buttonVariants({ variant: "accent" })}
        >
          Create Your Own Prototype <span aria-hidden="true">→</span>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
