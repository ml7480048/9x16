const steps = [
  "Brand Input",
  "Visual Setup",
  "Storyboard",
  "Detailed Script",
  "Money Shot",
];

interface StepIndicatorProps {
  currentStep: number;
}

// A24-minimalist pass (2026-07): no circles, no per-step click targets —
// a single thin progress line with the current step's name below it in
// small caps. Matches the "one calm question at a time" wizard redesign;
// jumping between steps is Back/Next only now.
export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-px w-full bg-border">
        <div
          className="absolute left-0 top-0 h-px bg-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
        {String(currentStep).padStart(2, "0")} /{" "}
        {String(steps.length).padStart(2, "0")}
        {" · "}
        {steps[currentStep - 1]}
      </span>
    </div>
  );
}
