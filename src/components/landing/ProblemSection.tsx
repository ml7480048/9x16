import { Card } from "@/components/ui/Card";

const painPoints = [
  {
    title: "Agencies adapt, they don't create",
    body: "Traditional agencies crop horizontal ads into vertical — bad framing, zero storytelling.",
  },
  {
    title: "Social teams lack production polish",
    body: "UGC-style content misses the production quality and brand consistency clients need.",
  },
  {
    title: "Production houses don't speak 9:16",
    body: "Vertical is a different cinematic language, not a rotated camera.",
  },
];

export function ProblemSection() {
  return (
    <section className="flex flex-col gap-8 border-t border-border px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] max-w-sm text-2xl font-bold leading-tight text-text-primary sm:text-3xl">
        Brands are producing content blind.
      </h2>
      <div className="flex flex-col gap-4">
        {painPoints.map((point) => (
          <Card key={point.title} className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-text-primary">
              {point.title}
            </h3>
            <p className="text-sm leading-6 text-text-secondary">
              {point.body}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
