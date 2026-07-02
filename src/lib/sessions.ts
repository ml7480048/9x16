// Multi-session persistence — Day 13 (Week 3).
//
// Replaces the single `9x16-wizard-state` localStorage key with a store of
// many sessions, so a client can run several brand tests and come back to
// any of them (/platform/sessions list + /platform/session/[id] detail).
//
// Still localStorage, deliberately — per the Day 13 roadmap line and because
// there are no real accounts yet (Postgres only holds leads). Sessions are
// therefore per-browser: a different device/browser shows an empty list.
//
// EXPIRY CAVEAT: scene images and variant videos are Kling CDN URLs, and
// Kling keeps generated assets for a limited time (~30 days). A stored
// session older than that will still list fine, but its media may 404 —
// pages that render stored media should show an honest "previews expire"
// note instead of pretending everything is permanent. Real fix (download
// assets into our own storage, e.g. Vercel Blob) is deliberately deferred.

import type { SceneImages, WizardFormData } from "./types";
import type { EpisodeScript, FormatMatch, SceneDraft } from "./anthropic";
import type { VariantLabel, VariantResult } from "./kling";

export interface StoredSession {
  id: string;
  createdAt: string; // ISO — also the generation date media expiry counts from
  updatedAt: string; // ISO
  step: number;
  data: WizardFormData;
  /** Agent 2's format recommendation for this brand — cached per session
   * so revisiting Step 2 doesn't re-call Claude. Optional: pre-Day-19
   * sessions don't have it. */
  formatMatch?: FormatMatch | null;
  scenes: SceneDraft[] | null;
  script: EpisodeScript | null;
  images: SceneImages;
  variants: VariantResult[] | null;
  /** Which scene the variants were generated FROM — lets Step 5 detect
   * that the client changed the Money Shot after generating and offer an
   * explicit Regenerate instead of silently showing stale variants.
   * Optional: sessions saved before this field existed simply skip the
   * staleness check. */
  variantsSceneId?: string | null;
  activeVariantLabel: VariantLabel;
  heroSceneId: string | null;
}

export type SessionStatus = "in-progress" | "complete";

const SESSIONS_KEY = "9x16-sessions";
const CURRENT_ID_KEY = "9x16-current-session-id";
// Pre-Day-13 single-session key — migrated into the store on first touch so
// an in-flight wizard session from before this feature isn't lost.
const LEGACY_WIZARD_KEY = "9x16-wizard-state";

// How long Kling keeps generated assets (approximate, per their retention
// policy) — used to warn on old sessions, not to hide them.
export const MEDIA_EXPIRY_DAYS = 30;

export const FORMAT_LABELS: Record<string, string> = {
  "slice-of-life": "Slice of Life",
  "micro-thriller": "Micro-Thriller",
  "character-comedy": "Character Comedy",
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStore(): Record<string, StoredSession> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredSession>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, StoredSession>) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(store));
}

/**
 * One-time migration: if the pre-Day-13 single-session key exists, wrap it
 * into the store as a normal session and make it current. Call before any
 * read — cheap no-op once the legacy key is gone.
 */
export function migrateLegacySession() {
  if (!isBrowser()) return;
  const raw = window.localStorage.getItem(LEGACY_WIZARD_KEY);
  if (!raw) return;
  window.localStorage.removeItem(LEGACY_WIZARD_KEY);
  try {
    const legacy = JSON.parse(raw) as Omit<
      StoredSession,
      "id" | "createdAt" | "updatedAt"
    >;
    const now = new Date().toISOString();
    const session: StoredSession = {
      ...legacy,
      id: newSessionId(),
      // True creation date is unknown for legacy state — "now" is the safe
      // choice for the expiry warning (media was generated at most a day or
      // two before the migration shipped).
      createdAt: now,
      updatedAt: now,
    };
    const store = readStore();
    store[session.id] = session;
    writeStore(store);
    setCurrentSessionId(session.id);
  } catch {
    // Corrupt legacy state — nothing worth keeping.
  }
}

export function newSessionId(): string {
  if (isBrowser() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** All sessions, most recently touched first. */
export function listSessions(): StoredSession[] {
  return Object.values(readStore()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getSession(id: string): StoredSession | null {
  return readStore()[id] ?? null;
}

/**
 * Inserts or updates. `updatedAt` is set here; `createdAt` is preserved for
 * an existing id (callers don't need to track it).
 */
export function saveSession(
  session: Omit<StoredSession, "createdAt" | "updatedAt">,
) {
  const store = readStore();
  const now = new Date().toISOString();
  store[session.id] = {
    ...session,
    createdAt: store[session.id]?.createdAt ?? now,
    updatedAt: now,
  };
  writeStore(store);
}

export function deleteSession(id: string) {
  const store = readStore();
  delete store[id];
  writeStore(store);
  if (getCurrentSessionId() === id) clearCurrentSession();
}

/**
 * Pointer to the session /platform/new resumes by default — preserves the
 * pre-Day-13 UX where reopening the wizard mid-flow restores progress
 * (mobile Safari tab discards were the original reason for localStorage).
 */
export function getCurrentSessionId(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(CURRENT_ID_KEY);
}

export function setCurrentSessionId(id: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CURRENT_ID_KEY, id);
}

/** "New Session" — next /platform/new visit starts blank. */
export function clearCurrentSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CURRENT_ID_KEY);
}

/** Complete = Brand Prototype variants were generated (reached the end of
 * the flow); everything before that is in-progress. */
export function sessionStatus(session: StoredSession): SessionStatus {
  return session.variants && session.variants.length > 0
    ? "complete"
    : "in-progress";
}

/** True when the session is old enough that its Kling media may be gone.
 * Media persisted to Vercel Blob (2026-07-02+) doesn't expire — only warn
 * when something still points at Kling's CDN. */
export function mediaLikelyExpired(session: StoredSession): boolean {
  const ageMs = Date.now() - new Date(session.createdAt).getTime();
  if (ageMs <= MEDIA_EXPIRY_DAYS * 24 * 60 * 60 * 1000) return false;
  const urls = [
    ...Object.values(session.images).map((image) => image.url),
    ...(session.variants ?? []).flatMap((v) => [v.videoUrl, v.imageUrl]),
  ];
  return urls.some((url) => url?.includes("klingai.com"));
}
