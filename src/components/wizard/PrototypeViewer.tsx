"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { VerticalPlayer } from "@/components/player/VerticalPlayer";
import { VariantSwitcher } from "@/components/player/VariantSwitcher";
import type { SceneDraft } from "@/lib/anthropic";
import type { SceneImages } from "@/lib/types";
import {
  VARIANT_DEFINITIONS,
  type ClipDuration,
  type VariantLabel,
  type VariantResult,
} from "@/lib/kling";

const hasAnyFailure = (variants: VariantResult[]) =>
  variants.some((v) => !v.videoUrl);

/** Error from /api/generate-video that may carry a Kling taskId — the
 * "Check again, no new credit" recovery hook. */
class VideoGenError extends Error {
  taskId?: string;
  constructor(message: string, taskId?: string) {
    super(message);
    this.taskId = taskId;
  }
}

interface PrototypeViewerProps {
  scenes: SceneDraft[];
  images: SceneImages;
  /** Client-chosen "money shot" scene (set on Storyboard) — the one
   * variants get generated from. Falls back to the first scene with a
   * successfully generated image if nothing was explicitly chosen yet. */
  heroSceneId: string | null;
  variants: VariantResult[] | null;
  /** Scene the current variants were generated from — compared against the
   * (possibly re-chosen) Money Shot to flag stale variants. */
  variantsSceneId: string | null;
  onVariantsReady: (
    variants: VariantResult[],
    sourceSceneId: string,
  ) => void;
  activeLabel: VariantLabel;
  onActiveLabelChange: (label: VariantLabel) => void;
  /** Kling clip length from the Step 2 episode-length choice ("5" | "10"). */
  clipDuration: ClipDuration;
}

/**
 * Step 5 — Prototype Viewer / Money Shot (dev spec 4.1). Generates the 3
 * Brand Prototype variants for the chosen money-shot scene, then lets the
 * client switch between them. Variants are lifted to Wizard state (like
 * `images`/`scenes`) so navigating Back/Next doesn't re-trigger 3 more Kling
 * video generations.
 */
export function PrototypeViewer({
  scenes,
  images,
  heroSceneId,
  variants,
  variantsSceneId,
  onVariantsReady,
  activeLabel,
  onActiveLabelChange,
  clipDuration,
}: PrototypeViewerProps) {
  const [loading, setLoading] = useState(!variants);
  const [error, setError] = useState<string | null>(null);
  const [checkingLabel, setCheckingLabel] = useState<VariantLabel | null>(null);
  const [checkMessage, setCheckMessage] = useState<{
    label: VariantLabel;
    text: string;
  } | null>(null);

  const explicitHeroScene = heroSceneId
    ? scenes.find((scene) => scene.id === heroSceneId && images[scene.id]?.url)
    : undefined;
  const heroScene =
    explicitHeroScene ?? scenes.find((scene) => images[scene.id]?.url);
  const heroImageUrl = heroScene ? images[heroScene.id]?.url : undefined;
  const usedFallback = !!heroScene && !explicitHeroScene;

  // v3 variant flow (2026-07-02): each variant gets its OWN styled start
  // image, then its own video — two client-orchestrated phases (3 images in
  // parallel, then 3 videos in parallel). Two reasons this lives here and
  // not in one server route: a serial image+video chain would exceed
  // Vercel's 300s function cap, and per-variant failures stay independent
  // (allSettled) exactly like the old batch route.
  const runFetch = useCallback(() => {
    if (!heroScene || !heroImageUrl) {
      // Deferred to a microtask (not called synchronously) to satisfy the
      // "no setState directly in effect" rule — same pattern used in
      // Wizard.tsx's session-restore effect.
      Promise.resolve().then(() => {
        setError(
          "No generated scene image available yet — go back to Storyboard and wait for at least one image to finish.",
        );
        setLoading(false);
      });
      return;
    }

    // Phase 1 — three styled start frames. Integration style is baked into
    // the IMAGE prompt: this is where the A/B/C difference actually comes
    // from (motion prompts alone proved insufficient twice).
    const imagePromises = VARIANT_DEFINITIONS.map((def) =>
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: `${def.imageModifier} Scene: ${heroScene.description}`,
        }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error ?? "Failed to generate variant image.");
        return data.imageUrl as string;
      }),
    );

    Promise.allSettled(imagePromises)
      .then(async (imageResults) => {
        // Phase 2 — one video per variant, from its styled frame. If a
        // variant's image failed, fall back to the hero scene image so the
        // variant still gets a video rather than nothing.
        const videoResults = await Promise.allSettled(
          VARIANT_DEFINITIONS.map((def, i) => {
            const imageResult = imageResults[i];
            const startImage =
              imageResult.status === "fulfilled"
                ? imageResult.value
                : heroImageUrl;
            return fetch("/api/generate-video", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl: startImage,
                description: heroScene.description,
                variantStyle: def.integrationStyle,
                duration: clipDuration,
              }),
            }).then(async (res) => {
              const data = await res.json();
              if (!res.ok) {
                throw new VideoGenError(
                  data.error ?? "Failed to generate this variant.",
                  data.taskId,
                );
              }
              return data.videoUrl as string | null;
            });
          }),
        );

        const assembled: VariantResult[] = VARIANT_DEFINITIONS.map(
          (def, i) => {
            const imageResult = imageResults[i];
            const styledImage =
              imageResult.status === "fulfilled"
                ? imageResult.value
                : undefined;
            const videoResult = videoResults[i];
            if (videoResult.status === "fulfilled") {
              return {
                label: def.label,
                integrationStyle: def.integrationStyle,
                imageUrl: styledImage,
                videoUrl: videoResult.value,
              };
            }
            const reason = videoResult.reason;
            return {
              label: def.label,
              integrationStyle: def.integrationStyle,
              imageUrl: styledImage,
              videoUrl: null,
              error:
                reason instanceof Error
                  ? reason.message
                  : "Unknown error generating this variant.",
              taskId:
                reason instanceof VideoGenError ? reason.taskId : undefined,
            };
          },
        );
        onVariantsReady(assembled, heroScene.id);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroScene, heroImageUrl, clipDuration]);

  // Ref guard against StrictMode's double mount-effect in dev — this one
  // mattered most: the doubled call here generated SIX Kling videos
  // instead of three (caught in the Day 15 E2E network log; see
  // StoryboardGrid's sceneFetchStarted).
  const variantsFetchStarted = useRef(false);
  useEffect(() => {
    if (!variants && !variantsFetchStarted.current) {
      variantsFetchStarted.current = true;
      runFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    runFetch();
  }, [runFetch]);

  // "Check again" — asks Kling whether a task we previously gave up polling
  // on has actually finished, WITHOUT creating a new task (no extra credit
  // spend). Only shown for variants where the failure was our own timeout
  // (taskId set), not a genuine Kling failure.
  const handleCheckStatus = useCallback(
    (variant: VariantResult) => {
      if (!variant.taskId || !variants) return;
      setCheckingLabel(variant.label);
      setCheckMessage(null);
      fetch("/api/check-video-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: variant.taskId }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to check status.");
          if (data.status === "succeed" && data.videoUrl) {
            const updated = variants.map((v) =>
              v.label === variant.label
                ? {
                    ...v,
                    videoUrl: data.videoUrl as string,
                    error: undefined,
                    taskId: undefined,
                  }
                : v,
            );
            // A recovered task belongs to the same generation batch — keep
            // its original source scene rather than the current hero.
            onVariantsReady(updated, variantsSceneId ?? heroScene?.id ?? "");
          } else if (data.status === "processing") {
            setCheckMessage({
              label: variant.label,
              text: "Still processing — try again in a moment.",
            });
          } else {
            setCheckMessage({
              label: variant.label,
              text: data.message ?? "This variant failed.",
            });
          }
        })
        .catch((err) => {
          setCheckMessage({
            label: variant.label,
            text: err instanceof Error ? err.message : "Something went wrong.",
          });
        })
        .finally(() => setCheckingLabel(null));
    },
    [variants, onVariantsReady, variantsSceneId, heroScene],
  );

  if (loading)
    return (
      <LoadingState
        text="Generating your Brand Prototype..."
        stages={[
          "Framing three brand-integration styles...",
          "Ambient: product in the background...",
          "Narrative: product in hand...",
          "Direct: product close-up...",
          "Animating all three variants...",
          "Almost ready...",
        ]}
        note="Each variant gets its own styled frame and video — usually 5-6 minutes."
      />
    );

  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!variants) return null;

  const active = variants.find((v) => v.label === activeLabel) ?? variants[0];

  // The client changed the Money Shot on Storyboard AFTER these variants
  // were generated. Deliberately NOT auto-regenerating (3 video credits) —
  // show the mismatch and let them decide via the Regenerate button.
  const staleVariants =
    !!variantsSceneId && !!heroScene && variantsSceneId !== heroScene.id;
  const variantsSourceScene = staleVariants
    ? scenes.find((scene) => scene.id === variantsSceneId)
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      {staleVariants && heroScene && (
        <p className="text-center text-xs text-accent">
          These variants were generated from Scene{" "}
          {variantsSourceScene?.order ?? "?"}, but Scene {heroScene.order} is
          now the Money Shot — use Regenerate below to re-create them.
        </p>
      )}
      {usedFallback && heroScene && (
        <p className="text-center text-xs text-text-secondary">
          Using Scene {heroScene.order} as the money shot (no explicit choice
          made) — go back to Storyboard to pick a different one.
        </p>
      )}
      <div className="mx-auto w-full max-w-[280px]">
        {/* All 3 players stay mounted (inactive ones hidden) so their videos
            preload and A/B/C switching is instant — dev spec §11 "variant
            switching must be instant". Rendering only the active one meant a
            full video reload on every tab switch. */}
        {variants.map((variant) => (
          // animate-fade-in restarts whenever the wrapper leaves
          // display:none, so each A/B/C switch gets the subtle fade without
          // remounting (which would throw away the preloaded videos).
          <div
            key={variant.label}
            className={
              variant.label === active.label ? "animate-fade-in" : "hidden"
            }
          >
            <VerticalPlayer
              videoUrl={variant.videoUrl}
              posterUrl={variant.imageUrl ?? heroImageUrl}
              label={`Variant ${variant.label} preview`}
              active={variant.label === active.label}
            />
          </div>
        ))}
        {active.error && (
          <div className="mt-2 flex flex-col items-center gap-1 text-center">
            <p className="text-xs text-text-secondary">
              This variant didn&apos;t finish generating ({active.error}) —
              showing the still image instead.
            </p>
            {active.taskId && (
              <button
                type="button"
                onClick={() => handleCheckStatus(active)}
                disabled={checkingLabel === active.label}
                className="text-xs font-medium text-accent underline decoration-dotted disabled:opacity-50"
              >
                {checkingLabel === active.label
                  ? "Checking..."
                  : "Check again (no new credit spent)"}
              </button>
            )}
            {checkMessage &&
              checkMessage.label === active.label &&
              checkingLabel === null && (
                <p className="text-xs text-text-secondary/70">
                  {checkMessage.text}
                </p>
              )}
          </div>
        )}
      </div>
      <VariantSwitcher
        variants={variants}
        activeLabel={activeLabel}
        onSelect={onActiveLabelChange}
      />
      <button
        type="button"
        onClick={handleRetry}
        className="self-center text-xs text-text-secondary underline decoration-dotted transition-colors hover:text-text-primary"
      >
        {hasAnyFailure(variants)
          ? "Regenerate all 3 variants"
          : "Regenerate variants anyway"}
      </button>
    </div>
  );
}
