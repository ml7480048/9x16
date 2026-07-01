export function CompanyIntro() {
  return (
    <section className="flex flex-col gap-4 border-b border-border px-6 py-16 sm:py-20">
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        Vienna
      </span>
      <h1 className="font-[family-name:var(--font-display)] max-w-sm text-3xl font-bold leading-[1.1] tracking-tight text-text-primary sm:max-w-lg sm:text-4xl">
        Vertical stories, tested before they&apos;re shot.
      </h1>
      <p className="max-w-sm text-base leading-7 text-text-secondary">
        9×16 is a Vienna-based studio for branded vertical series. We validate
        the story and the brand fit with AI prototypes on our Platform, then
        produce it for real — with real cameras, real actors.
      </p>
    </section>
  );
}
