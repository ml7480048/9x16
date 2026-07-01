const painPoints = [
  { number: "01", statement: "Agencies adapt, they don't create." },
  { number: "02", statement: "Social teams lack production polish." },
  { number: "03", statement: "Production houses don't speak 9:16." },
];

// A24-minimalist pass (2026-07): single vertical stack, one-line statements,
// no icons, no borders — generous spacing (80px+) does the separating.
export function ProblemSection() {
  return (
    <section className="flex flex-col gap-20 border-t border-border px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] max-w-sm text-4xl leading-[0.95] text-text-primary sm:text-5xl">
        Brands are producing content blind.
      </h2>
      <div className="flex flex-col gap-20">
        {painPoints.map((point) => (
          <div key={point.number} className="flex flex-col gap-2">
            <span className="text-xs font-medium text-text-secondary">
              {point.number}
            </span>
            <p className="max-w-lg text-xl leading-tight text-text-primary">
              {point.statement}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
