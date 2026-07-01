import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VerticalPlayer } from "@/components/player/VerticalPlayer";

// Day 11 morning: VerticalPlayer component built. Wired in here purely as a
// visual smoke test — the real A/B/C VariantSwitcher + Kling-generated video
// flow is still Day 12's task. The videoUrl below is a public sample clip
// (NOT Kling output) used only to confirm tap-to-play/mute controls render
// and work; swap for real generated video once Day 12 wires it up.
export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-6 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
          Experience the Brand Prototype
        </h1>
        <p className="max-w-xs text-sm text-text-secondary">
          VerticalPlayer component preview — playing a placeholder test clip
          (not Kling output) to confirm tap-to-play and mute controls work.
          Real generated video + A/B/C switcher land Day 12.
        </p>
        <div className="w-full max-w-[240px]">
          <VerticalPlayer
            videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
            posterUrl="https://picsum.photos/seed/9x16demo/720/1280"
            label="Demo scene preview"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
