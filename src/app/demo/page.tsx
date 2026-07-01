import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VerticalPlayer } from "@/components/player/VerticalPlayer";

// Day 11 morning: VerticalPlayer component built. Wired in here (with a
// placeholder still, no real video yet) purely as a visual smoke test — the
// real A/B/C VariantSwitcher + generation flow is still Day 12's task.
export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-6 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
          Experience the Brand Prototype
        </h1>
        <p className="max-w-xs text-sm text-text-secondary">
          VerticalPlayer component preview (still image fallback — the A/B/C
          variant switcher and real generated video land Day 12).
        </p>
        <div className="w-full max-w-[240px]">
          <VerticalPlayer
            posterUrl="https://picsum.photos/seed/9x16demo/720/1280"
            label="Demo scene preview"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
