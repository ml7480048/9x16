import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-card border border-border p-6 transition-colors duration-150",
          elevated ? "bg-surface-elevated" : "bg-surface",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
