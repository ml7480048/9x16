import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompanyIntro } from "@/components/landing/CompanyIntro";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { PlayerTeaser } from "@/components/landing/PlayerTeaser";

// Company-level homepage — 9×16 is one brand covering the whole studio
// (Platform / Player / Contacts / Team), not just the AI testing tool.
// CompanyIntro sets that umbrella context; Hero/Problem/Solution below are
// the existing Platform pitch, now framed as one section of this page.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <CompanyIntro />
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <PlayerTeaser />
      </main>
      <Footer />
    </div>
  );
}
