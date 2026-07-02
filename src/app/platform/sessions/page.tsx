"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import {
  FORMAT_LABELS,
  listSessions,
  sessionStatus,
  type StoredSession,
} from "@/lib/sessions";

// Day 13 — real session list, following the row pattern documented here
// while this was an empty stub: plain rows (no card grid), brand name left,
// format label + date right in #888888, a 1px divider between rows, status
// as plain accent text, no pill background.
//
// Sessions live in localStorage (see lib/sessions.ts) — client component,
// loaded after mount to avoid a server/client hydration mismatch.
export default function SessionsPage() {
  const [sessions, setSessions] = useState<StoredSession[] | null>(null);

  useEffect(() => {
    queueMicrotask(() => setSessions(listSessions()));
  }, []);

  // Pre-hydration: render nothing rather than flashing the empty state at
  // someone who does have sessions.
  if (sessions === null) return <div className="flex-1" />;

  if (sessions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-lg text-text-primary">No prototypes yet.</p>
        <Link
          href="/platform/new"
          className={buttonVariants({ variant: "accent" })}
        >
          Start your first session <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] text-text-primary">
        Sessions
      </h1>
      <div className="flex flex-col">
        {sessions.map((session) => {
          const status = sessionStatus(session);
          const formatLabel = session.data.selectedFormat
            ? FORMAT_LABELS[session.data.selectedFormat]
            : null;
          const date = new Date(session.updatedAt).toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "short", year: "numeric" },
          );
          return (
            <Link
              key={session.id}
              href={`/platform/session/${session.id}`}
              className="group flex items-baseline justify-between gap-4 border-b border-border py-4 first:pt-0"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm text-text-primary transition-colors group-hover:text-accent">
                  {session.data.brandName || "Untitled session"}
                </span>
                <span className="text-xs text-accent">
                  {status === "complete" ? "Complete" : "In Progress"}
                </span>
              </span>
              <span className="shrink-0 text-right text-xs text-text-secondary">
                {formatLabel ? `${formatLabel} · ` : ""}
                {date}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
