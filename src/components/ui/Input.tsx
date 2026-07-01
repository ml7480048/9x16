import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

// A24-minimalist pass (2026-07): underline-only, no box — transparent
// background, bottom border turns accent on focus. Border brightened from
// `border-border` (#2A2A2A, nearly invisible against the #0A0A0A page
// background) to a visible text-secondary tint — otherwise the fillable
// row looked identical to the label/placeholder text above it (real
// feedback from testing on a phone).
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full border-b border-text-secondary/40 bg-transparent py-2 text-base sm:text-sm text-text-primary",
          "placeholder:text-text-secondary/60 transition-colors duration-150",
          "focus:border-accent focus:outline-none",
          "disabled:opacity-40 disabled:pointer-events-none",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
