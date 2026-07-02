"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import type { SceneDraft } from "@/lib/anthropic";
import type { SceneImages, WizardFormData } from "@/lib/types";

interface StoryboardGridProps {
  brandData: WizardFormData;
  scenes: SceneDraft[] | null;
  onScenesReady: (scenes: SceneDraft[]) => void;
  // Lifted up to Wizard (and persisted to localStorage there) so navigating
  // Back to this step doesn't burn Kling credits re-generating every image.
  images: SceneImages;
  onImagesChange: Dispatch<SetStateAction<SceneImages>>;
  // Which scene is the "money shot" the Step 5 Brand Prototype variants get
  // generated from. Explicit, client-chosen — previously this defaulted to
  // "whichever scene's image finished first," which had nothing to do with
  // which scene actually sells the product.
  heroSceneId: string | null;
  onHeroSceneChange: (sceneId: string) => void;
}

export function StoryboardGrid({
  brandData,
  scenes,
  onScenesReady,
  images,
  onImagesChange,
  heroSceneId,
  onHeroSceneChange,
}: StoryboardGridProps) {
  const [loading, setLoading] = useState(!scenes);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  // Tracks which scene IDs already have an image request in flight/done, so
  // editing one scene's description doesn't re-trigger fetches for the rest.
  // Seeded from the persisted `images` prop so remounting this step (e.g. via
  // Back/Next navigation) doesn't re-request images that already exist.
  const requestedIds = useRef<Set<string>>(new Set(Object.keys(images)));

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
        sceneMood: brandData.sceneMood,
        selectedFormat: brandData.selectedFormat,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error ?? "Failed to generate scenes.");
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
  const fetchImageFor = useCallback(
    (scene: SceneDraft, description: string) => {
      const sceneId = scene.id;
      onImagesChange((prev) => ({ ...prev, [sceneId]: {} })); // clear -> shows loading skeleton
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          sceneMood: brandData.sceneMood,
          visualMood: scene.visualMood,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error ?? "Failed to generate image.");
          onImagesChange((prev) => ({
            ...prev,
            [sceneId]: { url: data.imageUrl },
          }));
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : "Unknown error.";
          onImagesChange((prev) => ({
            ...prev,
            [sceneId]: { error: message },
          }));
        });
    },
    [onImagesChange, brandData.sceneMood],
  );

  // Fire per-scene image generation once scenes are available — only for
  // scene IDs not already requested, so editing one scene's description
  // doesn't burn Kling credits re-generating every other scene's image too.
  useEffect(() => {
    if (!scenes) return;
    scenes.forEach((scene) => {
      if (requestedIds.current.has(scene.id)) return;
      requestedIds.current.add(scene.id);
      fetchImageFor(scene, scene.description);
    });
  }, [scenes, fetchImageFor]);

  // Default the money shot to the first scene with a successful image, so
  // there's always a sensible choice without forcing a manual pick — but
  // only until the client explicitly overrides it (guarded by `heroSceneId`
  // already being set), via the "Set as Money Shot" button on other cards.
  useEffect(() => {
    if (heroSceneId || !scenes) return;
    const firstReady = scenes.find((scene) => images[scene.id]?.url);
    if (firstReady) onHeroSceneChange(firstReady.id);
  }, [scenes, images, heroSceneId, onHeroSceneChange]);

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
      s.id === scene.id ? { ...s, description: trimmed } : s,
    );
    onScenesReady(updated);
    fetchImageFor(scene, trimmed); // regenerate only this scene's image
  }

  if (loading)
    return (
      <LoadingState
        text="Generating your story..."
        stages={[
          "Reading your brand brief...",
          "Sketching out scene beats...",
          "Almost ready...",
        ]}
      />
    );
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!scenes) return null;

  const readyCount = scenes.filter(
    (s) => images[s.id]?.url || images[s.id]?.error,
  ).length;
  const allReady = readyCount === scenes.length;

  return (
    <div className="flex flex-col gap-3">
      {!allReady && (
        <p className="animate-fade-in text-xs text-text-secondary">
          Generating images: {readyCount} of {scenes.length} ready...
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {scenes.map((scene) => {
          const image = images[scene.id];
          const isHero = scene.id === heroSceneId;
          return (
            <Card
              key={scene.id}
              className={
                "flex flex-col gap-2" + (isHero ? " !border-accent" : "")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-accent">
                  Scene {scene.order}
                </span>
                {isHero && (
                  <span className="rounded-input bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                    ★ Money Shot
                  </span>
                )}
              </div>
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden p-2 text-center">
                    <span className="text-[10px] text-text-secondary">
                      Image failed to generate
                    </span>
                    <span className="line-clamp-4 text-[9px] leading-tight text-text-secondary/70">
                      {image.error}
                    </span>
                    <button
                      type="button"
                      onClick={() => fetchImageFor(scene, scene.description)}
                      className="text-[10px] font-medium text-accent underline decoration-dotted"
                    >
                      Retry
                    </button>
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(scene)}
                      className="text-xs text-text-secondary underline decoration-dotted transition-colors hover:text-text-primary"
                    >
                      Edit
                    </button>
                    {image?.url && !isHero && (
                      <button
                        type="button"
                        onClick={() => onHeroSceneChange(scene.id)}
                        className="text-xs text-text-secondary underline decoration-dotted transition-colors hover:text-accent"
                      >
                        Set as Money Shot
                      </button>
                    )}
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
