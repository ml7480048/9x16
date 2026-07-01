import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-input border border-border bg-surface px-4 text-base sm:text-sm text-text-primary",
          "transition-colors duration-150",
          "focus:outline-none focus:border-accent",
          "disabled:opacity-40 disabled:pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
