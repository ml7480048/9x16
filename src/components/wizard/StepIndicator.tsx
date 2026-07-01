import { cn } from "@/lib/utils";

const steps = [
  "Brand Input",
  "Visual Setup",
  "Storyboard",
  "Detailed Script",
  "Preview",
];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-1">
      {steps.map((label, i) => {
        const stepNumber = i + 1;
        const active = stepNumber === currentStep;
        const done = stepNumber < currentStep;

        return (
          <li key={label} className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                done && "border-accent bg-accent text-white",
                active && !done && "border-accent text-accent",
                !active && !done && "border-border text-text-secondary"
              )}
            >
              {stepNumber}
            </div>
            <span
              className={cn(
                "whitespace-nowrap text-xs",
                active ? "text-text-primary" : "text-text-secondary"
              )}
            >
              {label}
            </span>
            {stepNumber !== steps.length && (
              <div className="h-px w-4 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
