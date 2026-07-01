import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

// A24-minimalist hero (2026-07): centered video-first layout. Background
// clip is a real brand master (1618_EB_Jobs-der-Zukunft, provided by
// Marian) — converted from a 358MB ProRes .mov to a 720x1280 H.264 mp4
// (~4.3MB, no audio track) via ffmpeg so it's actually loadable on the web.
export function Hero() {
  return (
    <section className="flex min-h-[85vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="animate-fade-in aspect-[9/16] w-full max-w-[380px] overflow-hidden bg-surface">
        <video
          src="/hero-preview.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
      </div>

      <span className="animate-fade-in text-xs font-medium uppercase tracking-widest text-text-secondary">
        Vienna · Vertical Story Studio
      </span>

      <h1 className="animate-fade-in font-[family-name:var(--font-display)] text-6xl leading-[0.95] text-text-primary sm:text-7xl">
        Test the story.
      </h1>

      <p className="animate-fade-in max-w-sm text-sm leading-6 text-text-secondary">
        9×16 is a Vienna-based content-tech startup redefining how brands create
        and validate narrative content for the vertical era. The platform
        combines AI-generated prototypes with real production to reduce risk and
        improve content performance.
      </p>

      <Link
        href="/platform/new"
        className={buttonVariants({ variant: "accent" })}
      >
        Start a Prototype <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
