const steps = [
  { number: "01", title: "Select format", body: "Slice of Life, Micro-Thriller, or Character Comedy." },
  { number: "02", title: "Input brand", body: "Product, tone, positioning, campaign goals." },
  { number: "03", title: "AI generates", body: "A 30–60 second stylized episode prototype." },
  { number: "04", title: "Compare", body: "Switch between brand integration variants instantly." },
  { number: "05", title: "Produce", body: "The chosen version moves into full production." },
];

export function SolutionSection() {
  return (
    <section className="flex flex-col gap-8 border-t border-border px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-text-primary sm:text-3xl">
        From prototype to production.
      </h2>
      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <li
            key={step.number}
            className={`flex items-start gap-4 py-5 ${
              i !== steps.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="font-[family-name:var(--font-display)] text-sm font-bold text-accent">
              {step.number}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm leading-6 text-text-secondary">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
