import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-input border border-border bg-surface px-4 text-sm text-text-primary",
          "placeholder:text-text-secondary transition-colors duration-150",
          "focus:outline-none focus:border-accent",
          "disabled:opacity-40 disabled:pointer-events-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
