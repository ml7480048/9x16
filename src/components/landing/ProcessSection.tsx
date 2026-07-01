"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Brand input",
    body: "Product, tone, audience, and campaign goal.",
  },
  {
    number: "02",
    title: "AI generates",
    body: "A storyboard and script prototype, ready in minutes.",
  },
  {
    number: "03",
    title: "Pick your money shot",
    body: "Choose the scene that should sell the product.",
  },
  {
    number: "04",
    title: "Compare variants",
    body: "Ambient, narrative, or direct brand integration.",
  },
  {
    number: "05",
    title: "Produce",
    body: "The chosen version moves into full production.",
  },
];

function ProcessStep({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-2 border-t border-border py-10 transition-opacity duration-700 ease-out first:border-t-0 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="text-xs font-medium text-text-secondary">{number}</span>
      <h3 className="font-[family-name:var(--font-display)] text-2xl leading-[0.95] text-text-primary">
        {title}
      </h3>
      <p className="max-w-sm text-sm leading-6 text-text-secondary">{body}</p>
    </div>
  );
}

// A24-minimalist pass (2026-07): plain typographic step number, no circles,
// stacked full-width (not a grid). Each step fades in on scroll via
// IntersectionObserver — a simple opacity transition, no bounce/slide.
export function ProcessSection() {
  return (
    <section className="flex flex-col gap-4 border-t border-border px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] text-text-primary sm:text-5xl">
        From prototype to production.
      </h2>
      <div className="flex flex-col">
        {steps.map((step) => (
          <ProcessStep key={step.number} {...step} />
        ))}
      </div>
    </section>
  );
}
