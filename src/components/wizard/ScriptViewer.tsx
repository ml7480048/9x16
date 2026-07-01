"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import type { EpisodeScript, SceneDraft } from "@/lib/anthropic";
import type { WizardFormData } from "@/lib/types";

interface ScriptViewerProps {
  brandData: WizardFormData;
  scenes: SceneDraft[];
  script: EpisodeScript | null;
  onScriptReady: (script: EpisodeScript) => void;
}

export function ScriptViewer({
  brandData,
  scenes,
  script,
  onScriptReady,
}: ScriptViewerProps) {
  const [loading, setLoading] = useState(!script);
  const [error, setError] = useState<string | null>(null);

  const runFetch = useCallback(() => {
    fetch("/api/generate-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName: brandData.brandName,
        product: brandData.product,
        tone: brandData.tone,
        audience: brandData.audience,
        campaignGoal: brandData.campaignGoal,
        scenes,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to generate script.");
        onScriptReady(data.script as EpisodeScript);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandData, scenes]);

  useEffect(() => {
    if (!script) runFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    runFetch();
  }, [runFetch]);

  if (loading) return <LoadingState text="Writing the story..." />;
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!script) return null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-text-primary">
        {script.title}
      </h2>
      <div className="flex flex-col">
        {script.scenes.map((scene) => (
          <div
            key={scene.sceneNumber}
            className="flex flex-col gap-2 border-b border-border py-5 first:pt-0 last:border-b-0"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Scene {scene.sceneNumber}
            </span>
            <p className="text-sm leading-6 text-text-primary">{scene.action}</p>
            <p className="text-sm font-medium leading-6 text-accent">
              {scene.brandIntegration}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
