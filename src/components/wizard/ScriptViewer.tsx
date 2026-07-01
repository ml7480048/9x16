"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { Textarea } from "@/components/ui/Textarea";
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
  // Manual, no-Claude-call edit of a scene's action/brandIntegration text —
  // same pattern as StoryboardGrid's inline Edit, but nothing gets
  // regenerated here since there's no image tied to this text.
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [draftAction, setDraftAction] = useState("");
  const [draftBrandIntegration, setDraftBrandIntegration] = useState("");

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
        if (!res.ok)
          throw new Error(data.error ?? "Failed to generate script.");
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

  function startEdit(scene: EpisodeScript["scenes"][number]) {
    setEditingScene(scene.sceneNumber);
    setDraftAction(scene.action);
    setDraftBrandIntegration(scene.brandIntegration);
  }

  function cancelEdit() {
    setEditingScene(null);
  }

  function saveEdit(sceneNumber: number) {
    setEditingScene(null);
    if (!script) return;
    const updated: EpisodeScript = {
      ...script,
      scenes: script.scenes.map((s) =>
        s.sceneNumber === sceneNumber
          ? {
              ...s,
              action: draftAction.trim() || s.action,
              brandIntegration:
                draftBrandIntegration.trim() || s.brandIntegration,
            }
          : s,
      ),
    };
    onScriptReady(updated);
  }

  if (loading)
    return (
      <LoadingState
        text="Writing the story..."
        stages={[
          "Reviewing your storyboard...",
          "Writing scene action...",
          "Weaving in the brand...",
          "Finishing touches...",
        ]}
      />
    );
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
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Scene {scene.sceneNumber}
              </span>
              {editingScene !== scene.sceneNumber && (
                <button
                  type="button"
                  onClick={() => startEdit(scene)}
                  className="text-xs text-text-secondary underline decoration-dotted transition-colors hover:text-text-primary"
                >
                  Edit
                </button>
              )}
            </div>
            {editingScene === scene.sceneNumber ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wide text-text-secondary">
                    Action
                  </label>
                  <Textarea
                    value={draftAction}
                    onChange={(e) => setDraftAction(e.target.value)}
                    rows={3}
                    className="text-sm"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wide text-text-secondary">
                    Brand integration
                  </label>
                  <Textarea
                    value={draftBrandIntegration}
                    onChange={(e) => setDraftBrandIntegration(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => saveEdit(scene.sceneNumber)}
                    className="text-xs font-medium text-accent"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-6 text-text-primary">
                  {scene.action}
                </p>
                <p className="text-sm font-medium leading-6 text-accent">
                  {scene.brandIntegration}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
