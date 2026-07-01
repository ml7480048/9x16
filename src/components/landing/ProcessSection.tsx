// A24-minimalist pass (2026-07): trimmed to just the headline — the 01-05
// step stack read as filler on mobile (per Marian: "informational garbage"),
// so it's gone along with the scroll-fade-in logic that drove it. The full
// step breakdown still lives on /platform for anyone who wants it.
export function ProcessSection() {
  return (
    <section className="flex flex-col border-t border-border px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] text-text-primary sm:text-5xl">
        From prototype to production.
      </h2>
    </section>
  );
}
