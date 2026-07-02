"use client";

import { useEffect, useRef, useState } from "react";

interface VerticalPlayerProps {
  /** Generated video clip URL. If missing (still generating, or Kling video
   * failed / mock mode), the player falls back to showing `posterUrl` as a
   * static still — never a broken player. */
  videoUrl?: string | null;
  /** Still image shown as the video poster, and as the fallback when there's
   * no video yet. */
  posterUrl?: string | null;
  /** Accessible label for the still/scene, used in alt text. */
  label?: string;
  /** Set false when this player is mounted but hidden (the variant-preload
   * pattern: all 3 players stay mounted so A/B/C switching is instant, per
   * dev spec §11) — pauses playback so a hidden, unmuted video can't keep
   * playing audio underneath the visible one. Defaults to true. */
  active?: boolean;
  className?: string;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function UnmutedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

/**
 * 9:16 vertical video player, per dev spec section 7 (`/player/VerticalPlayer.tsx`).
 * Custom minimal chrome (tap-to-play, corner mute toggle) instead of native
 * browser controls — native controls look clunky at this aspect ratio and
 * break the premium feel. Muted-by-default autoplay avoids browser autoplay
 * blocks; user can unmute with one tap.
 */
export function VerticalPlayer({
  videoUrl,
  posterUrl,
  label = "Scene preview",
  active = true,
  className,
}: VerticalPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Pause when hidden by the variant switcher; when this player becomes
  // visible again it's back at the paused frame with controls showing.
  // setState deferred to a microtask per the "no setState directly in
  // effect" rule — same pattern as Wizard.tsx's session-restore effect.
  useEffect(() => {
    if (active) return;
    const video = videoRef.current;
    if (video && !video.paused) video.pause();
    queueMicrotask(() => {
      setIsPlaying(false);
      setShowControls(true);
    });
  }, [active]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setShowControls(false);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  const containerClass = [
    "relative aspect-[9/16] w-full overflow-hidden rounded-card bg-surface-elevated",
    className ?? "",
  ]
    .join(" ")
    .trim();

  if (!videoUrl) {
    // No video yet — fall back to the still image (or an empty branded box).
    // The "No preview" box always renders underneath and the image hides
    // itself on load failure (e.g. expired Kling URL), so a dead link
    // degrades gracefully instead of showing the broken-image icon.
    return (
      <div className={containerClass}>
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-xs text-text-secondary">No preview yet</span>
        </div>
        {posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={label}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={containerClass}
      onClick={togglePlay}
      onMouseEnter={() => !isPlaying && setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl ?? undefined}
        muted={isMuted}
        loop
        playsInline
        preload="auto"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
          <span className="px-4 text-center text-xs text-text-secondary">
            Video failed to load
          </span>
        </div>
      )}

      {/* Center play/pause overlay — fades in/out, subtle motion only. */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center bg-black/50 text-white">
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </div>
      </div>

      {/* Mute toggle — always reachable, doesn't fade with play controls. */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center bg-black/50 text-white transition-colors hover:bg-black/70"
      >
        {isMuted ? <MutedIcon /> : <UnmutedIcon />}
      </button>
    </div>
  );
}
