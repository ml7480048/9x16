// Kling AI wrapper — 9×16
// Used for: scene image generation (Storyboard, Step 3) AND image-to-video (Step 5 preview).
// Single provider for both, per Marian's preference — replaces the earlier Nano Banana
// (images, blocked on free tier) + Runway (video, unused) split.
//
// Decision history (2026-07-01): originally tried Nano Banana (Google Gemini) for images —
// blocked, free tier doesn't cover image generation. Then built Runway for video ($10 min).
// Then found Kling's real Trial Packages are much cheaper than the ~$4,200 figure from
// earlier research: Image API trial $2.45/1000 units, Video API trial $9.80/100 units
// (both 30-day validity) — see https://kling.ai/dev/pricing. Switched back to unified Kling.
//
// AUTH (corrected 2026-07-01): the kling.ai/dev platform Marian actually signed up on
// issues a single static API key (looks like `api-key-kling-...`), used directly as a
// Bearer token — not the Access Key + Secret Key JWT scheme documented by an older
// third-party SDK (github.com/aself101/kling-api), which appears to target a different/
// older Kling developer platform. Using the simple scheme since it matches the real key.
//
// CONFIDENCE NOTE: Kling's own reference pages (kling.ai/document-api/...) are JS-rendered
// and couldn't be fetched directly, so endpoint paths/field names below are still best-
// effort (cross-checked against the third-party SDK for the request/response shapes, just
// not the auth scheme). If real calls fail with a 401, double check whether this platform
// actually wants JWT after all; if they fail with an "unexpected shape" error, check field
// names against docs.dev or the kling-api SDK.
//
// MOCK MODE: if KLING_API_KEY is missing or still a placeholder, generateSceneImage returns
// a branded placeholder image, generateVideoFromImage returns null (caller falls back to
// showing the still image).

const BASE_URL = "https://api-singapore.klingai.com";
const POLL_INTERVAL_MS = 3000;
// 270s (4.5 min) — raised from 120s after a real test hit that ceiling.
// Bounded by Vercel's function duration limit: Hobby/Pro both default to
// 300s max with Fluid Compute (verified at vercel.com/docs/functions/
// configuring-functions/duration, 2026-07-01), so this leaves ~30s buffer
// for request/response overhead. The API routes that call this also set
// `export const maxDuration` explicitly to match.
const POLL_TIMEOUT_MS = 270_000;

function isMockMode(): boolean {
  const key = process.env.KLING_API_KEY;
  return !key || key === "your_key_here" || key === "test";
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.KLING_API_KEY}`,
  };
}

interface KlingTaskResponse {
  code: number;
  message?: string;
  data?: {
    task_id: string;
    task_status: "submitted" | "processing" | "succeed" | "failed";
    task_status_msg?: string;
    task_result?: {
      images?: { index: number; url: string }[];
      videos?: { id: string; url: string; duration: string }[];
    };
  };
}

/**
 * Thrown when our own poll loop gives up before Kling finishes — NOT the
 * same as the task actually failing. Carries `taskId` so callers can check
 * back later (via `checkTaskStatus`) instead of paying for a fresh
 * generation. Learned the hard way (2026-07-01): a real test showed 6 "timed
 * out" video tasks had all actually succeeded on Kling's side within 2.4-3.6
 * minutes — we just weren't listening anymore by the time they finished.
 */
export class KlingTimeoutError extends Error {
  taskId: string;
  constructor(taskId: string, timeoutSeconds: number) {
    super(`Kling generation timed out after ${timeoutSeconds} seconds.`);
    this.name = "KlingTimeoutError";
    this.taskId = taskId;
  }
}

async function pollTask(
  taskUrlBase: string,
  taskId: string,
): Promise<KlingTaskResponse> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const response = await fetch(`${taskUrlBase}/${taskId}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Kling API error checking task (${response.status}): ${body.slice(0, 500)}`,
      );
    }

    const task = (await response.json()) as KlingTaskResponse;
    const status = task.data?.task_status;

    if (status === "succeed") return task;
    if (status === "failed") {
      throw new Error(
        `Kling task failed: ${task.data?.task_status_msg ?? "no reason given"}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new KlingTimeoutError(taskId, POLL_TIMEOUT_MS / 1000);
}

/**
 * One-shot status check for a video task we already gave up polling on —
 * does NOT create a new task or spend a new credit. Use after a
 * KlingTimeoutError to see if the video finished after all.
 */
export async function checkVideoTaskStatus(taskId: string): Promise<{
  status: "succeed" | "processing" | "failed";
  videoUrl?: string;
  message?: string;
}> {
  const response = await fetch(`${BASE_URL}/v1/videos/image2video/${taskId}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Kling API error checking task (${response.status}): ${body.slice(0, 500)}`,
    );
  }

  const task = (await response.json()) as KlingTaskResponse;
  const status = task.data?.task_status;

  if (status === "succeed") {
    const videoUrl = task.data?.task_result?.videos?.[0]?.url;
    if (!videoUrl) {
      return {
        status: "failed",
        message: "Task succeeded but returned no video URL.",
      };
    }
    return { status: "succeed", videoUrl };
  }

  if (status === "failed") {
    return {
      status: "failed",
      message: task.data?.task_status_msg ?? "no reason given",
    };
  }

  return { status: "processing" };
}

/** Branded 720x1280 placeholder — used only in mock mode. */
function mockImageUrl(seed: string): string {
  const label = seed.replace(/[<>&]/g, "").slice(0, 44);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    <rect width="720" height="1280" fill="#1A1A1A"/>
    <rect x="1" y="1" width="718" height="1278" fill="none" stroke="#2A2A2A" stroke-width="2"/>
    <g transform="translate(360 600)" stroke="#FF3C00" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-70" y="-45" width="140" height="90" rx="6"/>
      <circle cx="0" cy="0" r="28"/>
      <rect x="35" y="-70" width="35" height="25" rx="4"/>
    </g>
    <text x="360" y="700" font-family="sans-serif" font-size="24" fill="#888888" text-anchor="middle">AI image placeholder</text>
    <text x="360" y="734" font-family="sans-serif" font-size="16" fill="#555555" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Step 3 — generates a single cinematic still for a scene description. */
export async function generateSceneImage(description: string): Promise<string> {
  if (isMockMode()) {
    return mockImageUrl(description);
  }

  const createResponse = await fetch(`${BASE_URL}/v1/images/generations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      model_name: "kling-v1",
      prompt: `Cinematic, dark, premium film-still aesthetic, vertical composition. ${description}`,
      n: 1,
      aspect_ratio: "9:16",
    }),
  });

  if (!createResponse.ok) {
    const body = await createResponse.text();
    throw new Error(
      `Kling API error creating image task (${createResponse.status}): ${body.slice(0, 500)}`,
    );
  }

  const created = (await createResponse.json()) as KlingTaskResponse;
  if (!created.data?.task_id) {
    throw new Error("Kling image task creation returned no task_id.");
  }

  const finished = await pollTask(
    `${BASE_URL}/v1/images/generations`,
    created.data.task_id,
  );
  const imageUrl = finished.data?.task_result?.images?.[0]?.url;

  if (!imageUrl) {
    throw new Error("Kling image task succeeded but returned no image URL.");
  }

  return imageUrl;
}

/**
 * Generates a vertical (9:16) video clip from a scene image + description.
 * Returns `null` in mock mode — caller should fall back to the still image.
 */
export async function generateVideoFromImage(
  imageUrl: string,
  description: string,
): Promise<string | null> {
  if (isMockMode()) {
    return null;
  }

  const createResponse = await fetch(`${BASE_URL}/v1/videos/image2video`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      model_name: "kling-v1-6",
      image: imageUrl,
      prompt: description,
      mode: "std",
      duration: "5",
      aspect_ratio: "9:16",
    }),
  });

  if (!createResponse.ok) {
    const body = await createResponse.text();
    throw new Error(
      `Kling API error creating video task (${createResponse.status}): ${body.slice(0, 500)}`,
    );
  }

  const created = (await createResponse.json()) as KlingTaskResponse;
  if (!created.data?.task_id) {
    throw new Error("Kling video task creation returned no task_id.");
  }

  const finished = await pollTask(
    `${BASE_URL}/v1/videos/image2video`,
    created.data.task_id,
  );
  const videoUrl = finished.data?.task_result?.videos?.[0]?.url;

  if (!videoUrl) {
    throw new Error("Kling video task succeeded but returned no video URL.");
  }

  return videoUrl;
}

// ---------------------------------------------------------------------------
// Brand Prototype variants — Day 11 evening (Week 3 feature). Same hero
// scene, 3 different brand-integration styles per dev spec 4.2. Deliberately
// scoped to ONE scene (not every scene × 3) to keep Kling video-credit spend
// bounded per test — see 916_progress_status.md 2026-07-01 note.
// ---------------------------------------------------------------------------

export type VariantLabel = "A" | "B" | "C";
export type IntegrationStyle = "ambient" | "narrative-native" | "direct";

export const VARIANT_DEFINITIONS: {
  label: VariantLabel;
  integrationStyle: IntegrationStyle;
  modifier: string;
}[] = [
  {
    label: "A",
    integrationStyle: "ambient",
    modifier: "Keep the product subtle, visible in the background only.",
  },
  {
    label: "B",
    integrationStyle: "narrative-native",
    modifier: "The product should visibly drive the moment of action.",
  },
  {
    label: "C",
    integrationStyle: "direct",
    modifier: "Feature the product directly and prominently in the frame.",
  },
];

export interface VariantResult {
  label: VariantLabel;
  integrationStyle: IntegrationStyle;
  /** null when this specific variant failed or we're in mock mode — caller
   * falls back to the still image for that variant, same as the single-video path. */
  videoUrl: string | null;
  error?: string;
  /** Set when the failure was OUR poll giving up (not an actual Kling
   * failure) — lets the caller offer "Check again" instead of re-generating
   * from scratch. See KlingTimeoutError. */
  taskId?: string;
}

/**
 * Generates all 3 Brand Prototype variants for one hero scene, in parallel.
 * Uses Promise.allSettled (not Promise.all) so one variant's Kling timeout
 * or failure doesn't wipe out the other two — each variant reports its own
 * success/error independently, same spirit as the per-scene Retry in Storyboard.
 */
export async function generateBrandVariants(
  imageUrl: string,
  description: string,
): Promise<VariantResult[]> {
  const settled = await Promise.allSettled(
    VARIANT_DEFINITIONS.map((def) =>
      generateVideoFromImage(imageUrl, `${description} ${def.modifier}`),
    ),
  );

  return VARIANT_DEFINITIONS.map((def, i) => {
    const result = settled[i];
    if (result.status === "fulfilled") {
      return {
        label: def.label,
        integrationStyle: def.integrationStyle,
        videoUrl: result.value,
      };
    }
    const reason = result.reason;
    return {
      label: def.label,
      integrationStyle: def.integrationStyle,
      videoUrl: null,
      error:
        reason instanceof Error
          ? reason.message
          : "Unknown error generating this variant.",
      taskId: reason instanceof KlingTimeoutError ? reason.taskId : undefined,
    };
  });
}
