import { cn } from "@/lib/utils";

const steps = [
  "Brand Input",
  "Visual Setup",
  "Storyboard",
  "Detailed Script",
  "Money Shot",
];

interface StepIndicatorProps {
  currentStep: number;
  /** Called when a completed step number is tapped, so users can jump back
   * without repeatedly hitting Back — this was in the old design and got
   * dropped in the A24 pass by mistake. Only completed steps are clickable;
   * the current step and future ones may not have valid data yet. */
  onStepSelect?: (step: number) => void;
}

// A24-minimalist pass (2026-07): no circles/pills — a thin progress line,
// plus a row of plain "01 / 02 / ..." numerals (clickable for completed
// steps) with the current step's name below in small caps.
export function StepIndicator({
  currentStep,
  onStepSelect,
}: StepIndicatorProps) {
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-px w-full bg-border">
        <div
          className="absolute left-0 top-0 h-px bg-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest">
          {steps.map((label, i) => {
            const stepNumber = i + 1;
            const done = stepNumber < currentStep;
            const active = stepNumber === currentStep;
            const clickable = done && !!onStepSelect;
            return (
              <span key={label} className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onStepSelect(stepNumber)}
                  aria-label={`Go to ${label}`}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "transition-colors",
                    active
                      ? "text-accent"
                      : done
                        ? "text-text-primary"
                        : "text-text-secondary/40",
                    clickable && "cursor-pointer hover:text-accent",
                    !clickable && "cursor-default",
                  )}
                >
                  {String(stepNumber).padStart(2, "0")}
                </button>
                {stepNumber !== steps.length && (
                  <span className="text-text-secondary/40">/</span>
                )}
              </span>
            );
          })}
        </div>
        <span className="text-xs text-text-secondary">
          {steps[currentStep - 1]}
        </span>
      </div>
    </div>
  );
}
