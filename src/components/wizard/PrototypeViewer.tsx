"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { VerticalPlayer } from "@/components/player/VerticalPlayer";
import { VariantSwitcher } from "@/components/player/VariantSwitcher";
import type { SceneDraft } from "@/lib/anthropic";
import type { SceneImages } from "@/lib/types";
import type { VariantLabel, VariantResult } from "@/lib/kling";

const hasAnyFailure = (variants: VariantResult[]) =>
  variants.some((v) => !v.videoUrl);

interface PrototypeViewerProps {
  scenes: SceneDraft[];
  images: SceneImages;
  variants: VariantResult[] | null;
  onVariantsReady: (variants: VariantResult[]) => void;
  activeLabel: VariantLabel;
  onActiveLabelChange: (label: VariantLabel) => void;
}

/**
 * Step 5 — Prototype Viewer (dev spec 4.1). Generates the 3 Brand Prototype
 * variants for one hero scene (first scene with a successfully generated
 * image), then lets the client switch between them. Variants are lifted to
 * Wizard state (like `images`/`scenes`) so navigating Back/Next doesn't
 * re-trigger 3 more Kling video generations.
 */
export function PrototypeViewer({
  scenes,
  images,
  variants,
  onVariantsReady,
  activeLabel,
  onActiveLabelChange,
}: PrototypeViewerProps) {
  const [loading, setLoading] = useState(!variants);
  const [error, setError] = useState<string | null>(null);

  const heroScene = scenes.find((scene) => images[scene.id]?.url);
  const heroImageUrl = heroScene ? images[heroScene.id]?.url : undefined;

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
    fetch("/api/generate-variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: heroImageUrl,
        description: heroScene.description,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error ?? "Failed to generate variants.");
        onVariantsReady(data.variants as VariantResult[]);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroScene, heroImageUrl]);

  useEffect(() => {
    if (!variants) runFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    runFetch();
  }, [runFetch]);

  if (loading)
    return (
      <LoadingState
        text="Generating your Brand Prototype..."
        stages={[
          "Preparing the hero scene...",
          "Generating Ambient variant...",
          "Generating Narrative variant...",
          "Generating Direct variant...",
          "Almost ready...",
        ]}
        note="This can take up to 4-5 minutes — 3 video variants are generated at once."
      />
    );

  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!variants) return null;

  const active = variants.find((v) => v.label === activeLabel) ?? variants[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto w-full max-w-[280px]">
        <VerticalPlayer
          key={active.label + (active.videoUrl ?? "")}
          videoUrl={active.videoUrl}
          posterUrl={heroImageUrl}
          label={`Variant ${active.label} preview`}
        />
        {active.error && (
          <p className="mt-2 text-center text-xs text-text-secondary">
            This variant didn&apos;t finish generating ({active.error}) —
            showing the still image instead.
          </p>
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
