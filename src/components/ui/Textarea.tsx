import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none rounded-input border border-border bg-surface px-4 py-3 text-base sm:text-sm text-text-primary",
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

Textarea.displayName = "Textarea";
