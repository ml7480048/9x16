import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

// A24-minimalist pass (2026-07): underline-only, matching Input — no box.
// Border brightened to text-secondary tint (see Input.tsx for why).
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none border-b border-text-secondary/40 bg-transparent py-2 text-base sm:text-sm text-text-primary",
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

Textarea.displayName = "Textarea";
