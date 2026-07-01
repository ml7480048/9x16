import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ProcessSection } from "@/components/landing/ProcessSection";

// Company-level homepage (A24-minimalist redesign, 2026-07): Hero → Problem
// → Process → Footer, per the explicit homepage brief. PlatformTeaser and
// PlayerTeaser are no longer part of the homepage — the Process section now
// covers "how it works" here, and /platform / /player carry their own full
// explanations. Both teaser components are unused now (kept on disk, not
// deleted — this sandbox can't delete files).
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <Hero />
        <ProblemSection />
        <ProcessSection />
      </main>
      <Footer />
    </div>
  );
}
