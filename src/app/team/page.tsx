import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Real roster not set yet — kept as an honest "coming soon" rather than
// inventing names. Once real people are added, list them as a plain
// typographic list (name left, role in #888888 beside it), no photo cards
// unless real team photos exist — see /team/team-member row pattern below,
// currently unused:
//   <div className="flex items-baseline justify-between border-t border-border py-4">
//     <span className="text-text-primary">{name}</span>
//     <span className="text-sm text-text-secondary">{role}</span>
//   </div>
export default function TeamPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-3 px-6 py-24">
        <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          Team
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] text-text-primary">
          Coming soon.
        </h1>
        <p className="max-w-xs text-sm text-text-secondary">
          The people behind 9×16 — page in development.
        </p>
      </main>
      <Footer />
    </div>
  );
}
