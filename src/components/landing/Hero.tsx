import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

const variantFrames = [
  { label: "A", rotateDeg: -6 },
  { label: "B", rotateDeg: 0 },
  { label: "C", rotateDeg: 6 },
];

// Company-level hero — merges the old CompanyIntro + Hero into one section
// (they duplicated the same "test before you shoot" message under two
// separate h1s). The stacked A/B/C frames are a direct, literal reference
// to the actual product feature (Brand Prototype integration variants),
// not generic decoration.
export function Hero() {
  return (
    <section className="relative flex flex-col gap-8 overflow-hidden border-b border-border px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-6">
        <span className="animate-fade-in text-xs font-semibold uppercase tracking-widest text-accent">
          Vienna · Vertical Story Studio
        </span>
        <h1 className="animate-fade-in font-[family-name:var(--font-display)] max-w-lg text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-6xl">
          Test the story.
          <br />
          Then shoot it for real.
        </h1>
        <p className="animate-fade-in max-w-md text-lg leading-8 text-text-secondary">
          9×16 is a Vienna studio for branded vertical series. We prototype the
          story and the brand fit with AI first — real cameras only once
          it&apos;s proven.
        </p>
        <div className="animate-fade-in flex flex-wrap gap-3">
          <Link href="/platform/new" className={buttonVariants()}>
            Start a Prototype
          </Link>
          <Link
            href="/platform"
            className={buttonVariants({ variant: "outline" })}
          >
            See how it works
          </Link>
        </div>
      </div>

      <div className="relative mt-6 flex h-72 items-center justify-center sm:h-80">
        {variantFrames.map((frame, i) => (
          <div
            key={frame.label}
            className="animate-fade-in absolute aspect-[9/16] h-64 rounded-card border border-border bg-surface-elevated shadow-2xl sm:h-72"
            style={{
              zIndex: i === 1 ? 2 : 1,
              transform: `translateX(${(i - 1) * 78}px) rotate(${frame.rotateDeg}deg)`,
            }}
          >
            <div className="flex h-full flex-col justify-between p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                {frame.label}
              </span>
              <div className="h-1/2 w-full rounded-input bg-gradient-to-t from-accent/25 to-transparent" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
