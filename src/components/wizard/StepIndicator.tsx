"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const steps = [
  "Brand Input",
  "Visual Setup",
  "Storyboard",
  "Detailed Script",
  "Preview",
];

interface StepIndicatorProps {
  currentStep: number;
  /** Called when a completed step is tapped, so users can jump back without
   * repeatedly hitting the Back button. Only completed steps are clickable —
   * the current step and future ones (which may not have valid data yet)
   * are not. */
  onStepSelect?: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  onStepSelect,
}: StepIndicatorProps) {
  const activeRef = useRef<HTMLLIElement>(null);

  // Auto-scroll the active step into view — without this, the bar only ever
  // shows whatever fit on screen at Step 1, so by Step 5 the active step (and
  // its "generating..." context) can be scrolled off to the right, invisible.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentStep]);

  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-1">
      {steps.map((label, i) => {
        const stepNumber = i + 1;
        const active = stepNumber === currentStep;
        const done = stepNumber < currentStep;
        const clickable = done && !!onStepSelect;

        return (
          <li
            key={label}
            ref={active ? activeRef : undefined}
            className="flex shrink-0 items-center gap-2"
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepSelect(stepNumber)}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                done && "border-accent bg-accent text-white",
                active && !done && "border-accent text-accent",
                !active && !done && "border-border text-text-secondary",
                clickable && "cursor-pointer hover:opacity-80",
                !clickable && "cursor-default",
              )}
            >
              {stepNumber}
            </button>
            <span
              onClick={() => clickable && onStepSelect(stepNumber)}
              className={cn(
                "whitespace-nowrap text-xs",
                active ? "text-text-primary" : "text-text-secondary",
                clickable && "cursor-pointer hover:text-text-primary",
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
