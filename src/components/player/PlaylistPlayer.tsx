"use client";

import { useEffect, useState } from "react";
import { VerticalPlayer } from "./VerticalPlayer";
import type { PlaylistClip } from "@/lib/kling";

interface PlaylistPlayerProps {
  clips: PlaylistClip[];
}

/**
 * Sequential "full episode" playback — plays each scene's clip in order,
 * auto-advancing on `ended` so it feels like one continuous episode instead
 * of a single hero shot. No real video stitching yet (that's a separate,
 * later ffmpeg step) — this is a client-side playlist illusion, same spirit
 * as the variant preload pattern elsewhere in the wizard.
 */
export function PlaylistPlayer({ clips }: PlaylistPlayerProps) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const clip = clips[index];

  function advance() {
    setIndex((i) => {
      if (i + 1 < clips.length) return i + 1;
      setFinished(true);
      return i;
    });
  }

  // Scenes whose video failed (or mock mode, no video at all) have nothing
  // to fire `onEnded` — without this, the playlist would stall forever on
  // that scene's still image instead of moving on.
  useEffect(() => {
    if (finished || !clip || clip.videoUrl) return;
    const timer = setTimeout(advance, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip, finished]);

  function replay() {
    setFinished(false);
    setIndex(0);
  }

  if (!clip) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="mx-auto w-full max-w-[280px]">
        {finished ? (
          <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-3 bg-surface-elevated text-center">
            <p className="text-sm text-text-secondary">Episode finished.</p>
            <button
              type="button"
              onClick={replay}
              className="text-xs font-medium text-accent underline decoration-dotted"
            >
              Replay
            </button>
          </div>
        ) : (
          <VerticalPlayer
            key={clip.sceneId}
            videoUrl={clip.videoUrl}
            posterUrl={clip.imageUrl}
            label={`Scene ${clip.order}`}
            autoPlay
            onEnded={advance}
          />
        )}
      </div>
      {!finished && (
        <p className="text-center text-xs text-text-secondary">
          Scene {clip.order} · {index + 1} of {clips.length}
        </p>
      )}
    </div>
  );
}
