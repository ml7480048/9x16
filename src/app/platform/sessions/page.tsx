import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

// No session-listing backend exists yet (Day 13 roadmap: "Session
// persistence" hasn't been built), so this is the only real state right
// now. Once real sessions exist, list them as plain rows — no card grid:
// brand name left, format label + date right in #888888, a 1px divider
// between rows, status as plain accent text (e.g. "In Progress"), no pill
// background. Keep that pattern in mind rather than reaching for Card.
export default function SessionsPage() {
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
