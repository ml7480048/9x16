import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

// A24-minimalist pass (2026-07): underline-only, matching Input — no box.
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none border-b border-border bg-transparent py-2 text-base sm:text-sm text-text-primary",
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

Textarea.displayName = "Textarea";
