import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { PlatformTeaser } from "@/components/landing/PlatformTeaser";
import { PlayerTeaser } from "@/components/landing/PlayerTeaser";

// Company-level homepage — 9×16 is one brand covering the whole studio
// (AI Prototype / Verticals / Contacts / Team), not just the AI testing
// tool. Hero carries the single company pitch (previously split across two
// duplicate h1s in CompanyIntro + Hero — merged into one). ProblemSection
// is homepage-only content; PlatformTeaser/PlayerTeaser are intentionally
// condensed since the full explanations live on their own tabs.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <Hero />
        <ProblemSection />
        <PlatformTeaser />
        <PlayerTeaser />
      </main>
      <Footer />
    </div>
  );
}
