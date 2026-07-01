"use client";

import { useRef, useState } from "react";

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
  className,
}: VerticalPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

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
    return (
      <div className={containerClass}>
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-text-secondary">No preview yet</span>
          </div>
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
        className="h-full w-full object-cover"
      />

      {/* Center play/pause overlay — fades in/out, subtle motion only. */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </div>
      </div>

      {/* Mute toggle — always reachable, doesn't fade with play controls. */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        {isMuted ? <MutedIcon /> : <UnmutedIcon />}
      </button>
    </div>
  );
}
