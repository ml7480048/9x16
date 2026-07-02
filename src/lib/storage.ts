// Permanent media storage — Vercel Blob (2026-07-02).
//
// Kling keeps generated assets only ~30 days (see lib/sessions.ts), which
// silently rots every saved session. Generation routes now copy each
// finished asset into Vercel Blob and hand the client OUR permanent URL
// instead of Kling's expiring one.
//
// Setup (one-time, manual): connect a Blob store to the Vercel project
// (Storage → Create → Blob) — Vercel injects BLOB_READ_WRITE_TOKEN
// automatically. Locally without the token everything still works, you
// just keep getting the raw (expiring) Kling URLs.
//
// Failure policy: best-effort. A generation that succeeded must never be
// thrown away because storage hiccuped — on any error (or timeout) we
// fall back to the original Kling URL.

import { put } from "@vercel/blob";

// Videos are persisted right after a poll that may have taken most of the
// route's 290s budget — cap the copy so persistence can't push the
// function over Vercel's limit. 25s moves ~15MB comfortably.
const PERSIST_TIMEOUT_MS = 25_000;

function hasBlobStore(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function extensionFor(url: string, kind: "image" | "video"): string {
  const path = new URL(url).pathname;
  const match = path.match(/\.(\w{2,4})$/);
  if (match) return match[1];
  return kind === "image" ? "png" : "mp4";
}

/**
 * Copies a remote (Kling) asset into Vercel Blob and returns the permanent
 * URL — or the original URL when there's no Blob store, the copy fails,
 * or it exceeds the time budget.
 */
export async function persistRemoteAsset(
  url: string,
  kind: "image" | "video",
): Promise<string> {
  if (!hasBlobStore()) return url;

  try {
    const copy = (async () => {
      const response = await fetch(url);
      if (!response.ok || !response.body) {
        throw new Error(`Fetching asset failed (${response.status}).`);
      }
      const key = `${kind}s/${crypto.randomUUID()}.${extensionFor(url, kind)}`;
      const blob = await put(key, response.body, {
        access: "public",
        contentType:
          response.headers.get("content-type") ??
          (kind === "image" ? "image/png" : "video/mp4"),
      });
      return blob.url;
    })();

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Blob persist timed out.")),
        PERSIST_TIMEOUT_MS,
      ),
    );

    return await Promise.race([copy, timeout]);
  } catch (error) {
    console.error(`[storage] persisting ${kind} failed, keeping Kling URL:`, error);
    return url;
  }
}
