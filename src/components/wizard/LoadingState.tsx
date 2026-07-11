"use client";

import { useEffect, useState } from "react";

interface LoadingStateProps {
  /** Fallback single-line message, used when `stages` isn't provided. */
  text: string;
  /**
   * Optional sequence of status messages to cycle through while waiting —
   * gives a sense of staged progress during longer AI generation calls
   * instead of a single static spinner (per dev spec: no plain spinner).
   */
  stages?: string[];
  /**
   * Optional persistent expectation-setting line (e.g. "This can take up to
   * 3 minutes") — doesn't rotate with `stages`, stays visible the whole time
   * so users don't wonder if it's stuck on a long call like video generation.
   */
  note?: string;
}

export function LoadingState({ text, stages, note }: LoadingStateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!stages || stages.length < 2) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % stages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [stages]);

  const message = stages && stages.length > 0 ? stages[index] : text;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16">
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 animate-pulse bg-accent"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 animate-pulse bg-accent"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="h-2 w-2 animate-pulse bg-accent"
          style={{ animationDelay: "400ms" }}
        />
      </div>
      <p key={message} className="animate-fade-in text-sm text-text-secondary">
        {message}
      </p>
      {note && (
        <p className="whitespace-pre-line text-center text-xs text-text-secondary/70">
          {note}
        </p>
      )}
    </div>
  );
}
