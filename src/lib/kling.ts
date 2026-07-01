// DEPRECATED — not used.
//
// 9×16 originally planned Kling AI for both image and video generation (see dev spec).
// Decision (2026-07-01): switched to a cheaper-to-start provider split instead —
// Nano Banana (Gemini image API, see nanoBanana.ts) for scene images, Runway ML API
// for image-to-video (Day 9). Reason: Kling's official API requires large minimum
// prepay (~$9.80 for images, ~$4,200 for video) vs. Nano Banana's free tier and
// Runway's $10 minimum.
//
// This file is kept only so old branches/history make sense — nothing imports it.
// Safe to delete once confirmed unused.
export {};
