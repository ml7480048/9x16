"use client";

import { useCallback, useState } from "react";
import { LoadingState } from "./LoadingState";
import { PlaylistPlayer } from "@/components/player/PlaylistPlayer";
import type { SceneDraft } from "@/lib/anthropic";
import {
  VARIANT_DEFINITIONS,
  type ClipDuration,
  type PlaylistClip,
  type VariantLabel,
  type VariantResult,
} from "@/lib/kling";

interface PlaylistBuilderProps {
  scenes: SceneDraft[];
  heroSceneId: string;
  /** The variant the client currently has selected — its clip for the Money
   * Shot scene is reused as-is (no extra credit spent re-generating it). */
  activeVariant: VariantResult;
  clipDuration: ClipDuration;
  playlist: PlaylistClip[] | null;
  /** Which variant style the persisted playlist was built in — compared
   * against `activeVariant.label` so switching tabs after building offers a
   * rebuild instead of silently showing a mismatched episode. */
  playlistLabel: VariantLabel | null;
  onPlaylistReady: (clips: PlaylistClip[], label: VariantLabel) => void;
}

/**
 * "Full episode" playlist (reserve-days roadmap item, 2026-07): the Money
 * Shot scene already has a styled clip per chosen variant from
 * PrototypeViewer — this generates matching styled clips for the REMAINING
 * storyboard scenes (same two-phase image-then-video orchestration as the
 * variant flow) and hands the full ordered set to PlaylistPlayer.
 * Deliberately manual (button, not auto-triggered) — costs 1 image + 1 video
 * credit per remaining scene, same cost-consciousness as "Regenerate
 * variants" elsewhere on this step.
 */
export function PlaylistBuilder({
  scenes,
  heroSceneId,
  activeVariant,
  clipDuration,
  playlist,
  playlistLabel,
  onPlaylistReady,
}: PlaylistBuilderProps) {
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherScenes = scenes
    .filter((scene) => scene.id !== heroSceneId)
    .sort((a, b) => a.order - b.order);
  const def = VARIANT_DEFINITIONS.find((d) => d.label === activeVariant.label);
  const stale = !!playlist && playlistLabel !== activeVariant.label;

  const build = useCallback(() => {
    if (!def) return;
    setBuilding(true);
    setError(null);

    // Phase 1 — styled start frame per remaining scene (same imageModifier
    // that gave the Money Shot variants their look).
    const imagePromises = otherScenes.map((scene) =>
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: `${def.imageModifier} Scene: ${scene.description}`,
        }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error ?? "Failed to generate scene image.");
        return data.imageUrl as string;
      }),
    );

    Promise.allSettled(imagePromises)
      .then(async (imageResults) => {
        // Phase 2 — one video per scene, from its styled frame.
        const videoResults = await Promise.allSettled(
          otherScenes.map((scene, i) => {
            const imageResult = imageResults[i];
            if (imageResult.status !== "fulfilled") {
              return Promise.reject(imageResult.reason);
            }
            return fetch("/api/generate-video", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl: imageResult.value,
                description: scene.description,
                variantStyle: activeVariant.integrationStyle,
                duration: clipDuration,
              }),
            }).then(async (res) => {
              const data = await res.json();
              if (!res.ok)
                throw new Error(
                  data.error ?? "Failed to generate scene video.",
                );
              return data.videoUrl as string | null;
            });
          }),
        );

        const rest: PlaylistClip[] = otherScenes.map((scene, i) => {
          const imageResult = imageResults[i];
          const imageUrl =
            imageResult.status === "fulfilled" ? imageResult.value : undefined;
          const videoResult = videoResults[i];
          return {
            sceneId: scene.id,
            order: scene.order,
            imageUrl,
            videoUrl:
              videoResult.status === "fulfilled" ? videoResult.value : null,
            error:
              videoResult.status === "rejected"
                ? videoResult.reason instanceof Error
                  ? videoResult.reason.message
                  : "Failed to generate this scene."
                : undefined,
          };
        });

        const heroScene = scenes.find((scene) => scene.id === heroSceneId);
        const heroClip: PlaylistClip = {
          sceneId: heroSceneId,
          order: heroScene?.order ?? 0,
          imageUrl: activeVariant.imageUrl,
          videoUrl: activeVariant.videoUrl,
        };

        const assembled = [...rest, heroClip].sort((a, b) => a.order - b.order);
        onPlaylistReady(assembled, activeVariant.label);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => setBuilding(false));
  }, [
    otherScenes,
    def,
    activeVariant,
    clipDuration,
    scenes,
    heroSceneId,
    onPlaylistReady,
  ]);

  if (otherScenes.length === 0 && !playlist) return null;

  if (building) {
    return (
      <LoadingState
        text="Building your full episode..."
        stages={[
          "Styling the remaining scenes...",
          "Animating each scene...",
          "Almost ready...",
        ]}
        note={`Generates ${otherScenes.length} more scene${
          otherScenes.length === 1 ? "" : "s"
        } in ${activeVariant.label} style.\nUsually a few minutes.`}
      />
    );
  }

  if (playlist && !stale) {
    return (
      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-center text-xs font-medium uppercase tracking-widest text-text-secondary">
          Full Episode
        </h2>
        <PlaylistPlayer clips={playlist} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
      {stale && (
        <p className="text-xs text-accent">
          This episode was built in {playlistLabel} style — rebuild to match the{" "}
          {activeVariant.label} variant you have selected now.
        </p>
      )}
      {error && <p className="text-xs text-text-secondary">{error}</p>}
      <button
        type="button"
        onClick={build}
        className="text-xs font-medium text-accent underline decoration-dotted"
      >
        {stale
          ? `Rebuild full episode (${activeVariant.label} style)`
          : `Build full episode (${activeVariant.label} style) →`}
      </button>
      <p className="max-w-xs text-[10px] leading-4 text-text-secondary/70">
        Generates the remaining {otherScenes.length} scene
        {otherScenes.length === 1 ? "" : "s"} in this variant&apos;s style and
        plays them back to back.
      </p>
    </div>
  );
}
