import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Vertical web player for 9×16's own produced series — distinct from the
// Platform's AI prototypes. No finished series or thumbnails/clips exist
// yet, so the grid below shows the 3 narrative formats the wizard actually
// offers (see VisualSetupForm.tsx) as empty placeholder tiles — swap in
// real stills/clips per format once produced content exists.
const formats = [
  { value: "slice-of-life", label: "Slice of Life" },
  { value: "micro-thriller", label: "Micro-Thriller" },
  { value: "character-comedy", label: "Character Comedy" },
];

export default function PlayerPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-14 px-6 py-24">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            Verticals
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-text-primary">
            Coming soon.
          </h1>
          <p className="max-w-sm text-sm leading-6 text-text-secondary">
            Once we produce our own vertical branded series, this is where
            you&apos;ll watch them — a dedicated 9:16 player, built to show
            brands how their story looks in the real format their audience
            actually scrolls through.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {formats.map((format) => (
            <div
              key={format.value}
              tabIndex={0}
              className="group relative aspect-[9/16] w-full overflow-hidden bg-surface"
            >
              {/* Labels always visible below md — hover-only reveal made the
                  tiles blank rectangles on touch screens (Day 14 mobile
                  pass), and mobile is the primary demo device. */}
              <div className="absolute inset-0 flex items-center justify-center p-1 text-center transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                <span className="text-[10px] leading-tight text-text-primary">
                  {format.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
