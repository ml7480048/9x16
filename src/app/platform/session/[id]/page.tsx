"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { VerticalPlayer } from "@/components/player/VerticalPlayer";
import { VariantSwitcher } from "@/components/player/VariantSwitcher";
import { WIZARD_STEP_NAMES } from "@/components/wizard/StepIndicator";
import {
  deleteSession,
  FORMAT_LABELS,
  getSession,
  mediaLikelyExpired,
  sessionStatus,
  type StoredSession,
} from "@/lib/sessions";
import type { VariantLabel } from "@/lib/kling";

// Day 13 — session detail. In-progress sessions get a "Continue" CTA that
// reopens the wizard at the saved step (via ?session=<id>); complete ones
// replay the stored Brand Prototype variants with the same preloaded
// player setup as wizard Step 5. Sessions live in localStorage, so this is
// a client component that loads after mount (no server data to fetch).
export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeLabel, setActiveLabel] = useState<VariantLabel>("A");

  useEffect(() => {
    queueMicrotask(() => {
      const found = id ? getSession(id) : null;
      setSession(found);
      if (found) setActiveLabel(found.activeVariantLabel ?? "A");
      setHydrated(true);
    });
  }, [id]);

  if (!hydrated) return <div className="flex-1" />;

  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-lg text-text-primary">Session not found.</p>
        <p className="max-w-xs text-xs text-text-secondary">
          Sessions are stored in this browser only — a link opened on a
          different device starts empty.
        </p>
        <Link
          href="/platform/sessions"
          className={buttonVariants({ variant: "accent" })}
        >
          All sessions <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  const status = sessionStatus(session);
  const expired = mediaLikelyExpired(session);
  const formatLabel = session.data.selectedFormat
    ? FORMAT_LABELS[session.data.selectedFormat]
    : null;
  const createdDate = new Date(session.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Same money-shot resolution as wizard Step 5: explicit choice if it has
  // a generated image, otherwise first scene that does.
  const heroScene =
    session.scenes?.find(
      (scene) =>
        scene.id === session.heroSceneId && session.images[scene.id]?.url,
    ) ?? session.scenes?.find((scene) => session.images[scene.id]?.url);
  const heroImageUrl = heroScene ? session.images[heroScene.id]?.url : null;

  function handleDelete() {
    if (!window.confirm("Delete this session? This can't be undone.")) return;
    deleteSession(session!.id);
    router.push("/platform/sessions");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] text-text-primary">
          {session.data.brandName || "Untitled session"}
        </h1>
        <p className="text-xs text-text-secondary">
          {[session.data.product, formatLabel, createdDate]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {expired && (
        <p className="text-xs text-text-secondary">
          Generated previews are kept for about 30 days — media in this
          session may no longer load. Re-run the session to generate fresh
          previews.
        </p>
      )}

      {status === "in-progress" ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Paused at Step {String(session.step).padStart(2, "0")} ·{" "}
            {WIZARD_STEP_NAMES[session.step - 1]}
          </p>
          <div>
            <Link
              href={`/platform/new?session=${session.id}`}
              className={buttonVariants({ variant: "accent" })}
            >
              Continue session <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="mx-auto w-full max-w-[280px]">
            {/* All 3 players stay mounted (inactive hidden) so switching is
                instant — same preload pattern as wizard Step 5 and /demo. */}
            {session.variants!.map((variant) => (
              <div
                key={variant.label}
                className={variant.label === activeLabel ? "" : "hidden"}
              >
                <VerticalPlayer
                  videoUrl={variant.videoUrl}
                  posterUrl={heroImageUrl}
                  label={`Variant ${variant.label} preview`}
                  active={variant.label === activeLabel}
                />
              </div>
            ))}
          </div>
          <VariantSwitcher
            variants={session.variants!}
            activeLabel={activeLabel}
            onSelect={setActiveLabel}
          />
        </div>
      )}

      {session.scenes && session.scenes.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            Storyboard
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {session.scenes.map((scene) => {
              const imageUrl = session.images[scene.id]?.url;
              return (
                <div
                  key={scene.id}
                  className="relative aspect-[9/16] w-full overflow-hidden bg-surface-elevated"
                >
                  {/* Numbered placeholder always renders underneath; the
                      image hides itself on load failure (expired Kling URL)
                      so we degrade to the placeholder instead of the
                      browser's broken-image icon. */}
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-[10px] text-text-secondary">
                      {String(scene.order).padStart(2, "0")}
                    </span>
                  </div>
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={`Scene ${scene.order} storyboard still`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <Link
          href="/platform/sessions"
          className="text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          <span aria-hidden="true">←</span> All sessions
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-text-secondary underline decoration-dotted transition-colors hover:text-text-primary"
        >
          Delete session
        </button>
      </div>
    </div>
  );
}
