import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost";
export type ButtonSize = "default" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center rounded-button font-medium transition-colors " +
  "duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  outline:
    "border border-border text-text-primary hover:border-accent hover:text-accent bg-transparent",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-surface",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-12 px-6 text-sm",
  sm: "h-9 px-4 text-sm",
};

/** Shared className builder so non-<button> elements (e.g. next/link) can look like a Button. */
export function buttonVariants({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
