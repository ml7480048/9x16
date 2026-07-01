"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import type { SceneDraft } from "@/lib/anthropic";
import type { WizardFormData } from "@/lib/types";

interface StoryboardGridProps {
  brandData: WizardFormData;
  scenes: SceneDraft[] | null;
  onScenesReady: (scenes: SceneDraft[]) => void;
}

interface ImageState {
  url?: string;
  error?: string;
}

export function StoryboardGrid({
  brandData,
  scenes,
  onScenesReady,
}: StoryboardGridProps) {
  const [loading, setLoading] = useState(!scenes);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, ImageState>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  // Tracks which scene IDs already have an image request in flight/done, so
  // editing one scene's description doesn't re-trigger fetches for the rest.
  const requestedIds = useRef<Set<string>>(new Set());

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

  // Fetches (or re-fetches) the image for a single scene. No synchronous
  // setState here — the request is kicked off directly, state only updates
  // inside the async .then/.catch handlers.
  const fetchImageFor = useCallback((sceneId: string, description: string) => {
    setImages((prev) => ({ ...prev, [sceneId]: {} })); // clear -> shows loading skeleton
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to generate image.");
        setImages((prev) => ({ ...prev, [sceneId]: { url: data.imageUrl } }));
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error.";
        setImages((prev) => ({ ...prev, [sceneId]: { error: message } }));
      });
  }, []);

  // Fire per-scene image generation once scenes are available — only for
  // scene IDs not already requested, so editing one scene's description
  // doesn't burn Kling credits re-generating every other scene's image too.
  useEffect(() => {
    if (!scenes) return;
    scenes.forEach((scene) => {
      if (requestedIds.current.has(scene.id)) return;
      requestedIds.current.add(scene.id);
      fetchImageFor(scene.id, scene.description);
    });
  }, [scenes, fetchImageFor]);

  function startEdit(scene: SceneDraft) {
    setEditingId(scene.id);
    setDraftText(scene.description);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftText("");
  }

  function saveEdit(scene: SceneDraft) {
    const trimmed = draftText.trim();
    setEditingId(null);
    if (!scenes || !trimmed || trimmed === scene.description) return;
    const updated = scenes.map((s) =>
      s.id === scene.id ? { ...s, description: trimmed } : s
    );
    onScenesReady(updated);
    fetchImageFor(scene.id, trimmed); // regenerate only this scene's image
  }

  if (loading) return <LoadingState text="Generating your story..." />;
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!scenes) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {scenes.map((scene) => {
        const image = images[scene.id];
        return (
          <Card key={scene.id} className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-accent">
              Scene {scene.order}
            </span>
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-input bg-surface-elevated">
              {image?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url}
                  alt={`Scene ${scene.order} storyboard still`}
                  className="h-full w-full object-cover"
                />
              )}
              {!image?.url && !image?.error && (
                <div className="absolute inset-0 animate-pulse bg-surface" />
              )}
              {image?.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 overflow-hidden p-2 text-center">
                  <span className="text-[10px] text-text-secondary">
                    Image failed to generate
                  </span>
                  <span className="line-clamp-4 text-[9px] leading-tight text-text-secondary/70">
                    {image.error}
                  </span>
                </div>
              )}
            </div>
            {editingId === scene.id ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  rows={4}
                  className="text-xs"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => saveEdit(scene)}
                    className="text-xs font-medium text-accent"
                  >
                    Save &amp; regenerate
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
                <p className="text-xs leading-5 text-text-secondary">
                  {scene.description}
                </p>
                <button
                  type="button"
                  onClick={() => startEdit(scene)}
                  className="self-start text-xs text-text-secondary underline decoration-dotted transition-colors hover:text-text-primary"
                >
                  Edit
                </button>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
