import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Vertical web player for 9×16's own produced series — distinct from the
// Platform's AI prototypes. No finished series exist yet, so this is a
// "coming soon" placeholder with a teaser list of concepts in development.
const seriesConcepts = [
  "OPA-FENCE",
  "ACCESS",
  "SMALL BIG CITY",
  "THE NERD",
  "URBAN HORROR",
  "ZOMBIE VIENNA",
  "ALPINE BOY",
  "EXPATS",
  "DISTRICTS",
];

export default function PlayerPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-6 py-20">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Player
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-text-primary">
            Coming soon.
          </h1>
          <p className="max-w-sm text-sm leading-6 text-text-secondary">
            Once we produce our own vertical branded series, this is where
            you&apos;ll watch them — a dedicated 9:16 player, built to show
            brands how their story looks in the real format their audience
            actually scrolls through.
          </p>
        </div>
        <div className="flex flex-col gap-3 border-t border-border pt-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            In development
          </span>
          <ul className="grid grid-cols-2 gap-2">
            {seriesConcepts.map((title) => (
              <li
                key={title}
                className="rounded-card border border-border bg-surface px-3 py-2 text-xs text-text-secondary"
              >
                {title}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
