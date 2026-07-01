"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import type { SceneDraft } from "@/lib/anthropic";
import type { WizardFormData } from "@/lib/types";

interface StoryboardGridProps {
  brandData: WizardFormData;
  scenes: SceneDraft[] | null;
  onScenesReady: (scenes: SceneDraft[]) => void;
}

export function StoryboardGrid({
  brandData,
  scenes,
  onScenesReady,
}: StoryboardGridProps) {
  const [loading, setLoading] = useState(!scenes);
  const [error, setError] = useState<string | null>(null);

  const runFetch = useCallback(() => {
    fetch("/api/generate-scenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName: brandData.brandName,
        product: brandData.product,
        tone: brandData.tone,
        audience: brandData.audience,
        campaignGoal: brandData.campaignGoal,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to generate scenes.");
        onScenesReady(data.scenes as SceneDraft[]);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandData]);

  useEffect(() => {
    if (!scenes) runFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    runFetch();
  }, [runFetch]);

  if (loading) return <LoadingState text="Generating your story..." />;
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!scenes) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {scenes.map((scene) => (
        <Card key={scene.id} className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-accent">
            Scene {scene.order}
          </span>
          <div className="aspect-[9/16] w-full rounded-input bg-surface-elevated" />
          <p className="text-xs leading-5 text-text-secondary">
            {scene.description}
          </p>
          <button
            type="button"
            className="self-start text-xs text-text-secondary underline decoration-dotted transition-colors hover:text-text-primary"
          >
            Edit
          </button>
        </Card>
      ))}
    </div>
  );
}
