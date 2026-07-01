"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VerticalPlayer } from "@/components/player/VerticalPlayer";
import { VariantSwitcher } from "@/components/player/VariantSwitcher";
import type { VariantLabel } from "@/lib/kling";

// Day 11-12 smoke test: VerticalPlayer + VariantSwitcher wired together with
// 3 distinct public sample clips (NOT Kling output) so switching is visually
// obvious. Real generated video + full Step 5 wiring is Day 12 evening.
const DEMO_VARIANTS: {
  label: VariantLabel;
  integrationStyle: "ambient" | "narrative-native" | "direct";
  videoUrl: string;
}[] = [
  {
    label: "A",
    integrationStyle: "ambient",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    label: "B",
    integrationStyle: "narrative-native",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    label: "C",
    integrationStyle: "direct",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/coffee.mp4",
  },
];

export default function DemoPage() {
  const [activeLabel, setActiveLabel] = useState<VariantLabel>("A");
  const activeVariant = DEMO_VARIANTS.find((v) => v.label === activeLabel)!;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-6 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
          Experience the Brand Prototype
        </h1>
        <p className="max-w-xs text-sm text-text-secondary">
          VerticalPlayer + VariantSwitcher preview — 3 placeholder clips (not
          Kling output) so switching between them is visually obvious. Real
          generated video lands Day 12 evening.
        </p>
        <div className="flex w-full max-w-[240px] flex-col gap-3">
          <VerticalPlayer
            key={activeVariant.videoUrl}
            videoUrl={activeVariant.videoUrl}
            posterUrl="https://picsum.photos/seed/9x16demo/720/1280"
            label={`Variant ${activeVariant.label} preview`}
          />
          <VariantSwitcher
            variants={DEMO_VARIANTS}
            activeLabel={activeLabel}
            onSelect={setActiveLabel}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
