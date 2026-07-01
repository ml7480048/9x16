import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

// A24-minimalist pass (2026-07): no more filled/outline button pairs — every
// button is a text link with a trailing arrow. `variant="accent"` is
// reserved for the single primary action per screen (accent used sparingly,
// max one moment per screen); everything else stays `default`.
export type ButtonVariant = "default" | "accent";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base =
  "inline-flex items-center gap-2 text-sm font-medium transition-colors " +
  "duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:underline";

const variants: Record<ButtonVariant, string> = {
  default: "text-text-primary hover:text-accent",
  accent: "text-accent hover:text-accent-hover",
};

/** Shared className builder so non-<button> elements (e.g. next/link) can look like a Button. */
export function buttonVariants({
  variant = "default",
  className,
}: {
  variant?: ButtonVariant;
  className?: string;
} = {}) {
  return cn(base, variants[variant], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, className })}
        {...props}
      >
        {children}
        <span aria-hidden="true">→</span>
      </button>
    );
  },
);

Button.displayName = "Button";
