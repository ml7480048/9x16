// A24-minimalist pass (2026-07): trimmed to just the headline — the 01/02/03
// supporting stack read as filler on mobile (per Marian: "informational
// garbage"), so it's gone. Statement is enough on its own.
export function ProblemSection() {
  return (
    <section className="flex flex-col border-t border-border px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] max-w-sm text-4xl leading-[0.95] text-text-primary sm:text-5xl">
        Brands are producing blind.
      </h2>
    </section>
  );
}
