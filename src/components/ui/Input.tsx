import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

// A24-minimalist pass (2026-07): underline-only, no box — transparent
// background, just a bottom border that turns accent on focus.
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full border-b border-border bg-transparent py-2 text-base sm:text-sm text-text-primary",
          "placeholder:text-text-secondary transition-colors duration-150",
          "focus:outline-none focus:border-accent",
          "disabled:opacity-40 disabled:pointer-events-none",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
