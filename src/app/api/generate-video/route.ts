import { NextRequest, NextResponse } from "next/server";
import {
  generateVideoFromImage,
  KlingTimeoutError,
  VARIANT_DEFINITIONS,
} from "@/lib/kling";
import type { ClipDuration, IntegrationStyle } from "@/lib/kling";
import { enforceQuota } from "@/lib/quota";
import { persistRemoteAsset } from "@/lib/storage";

// Must exceed kling.ts's POLL_TIMEOUT_MS (270s) or Vercel would kill the
// function with a generic timeout instead of our own clear error; 290s
// stays under the 300s ceiling shared by Hobby and Pro plans.
export const maxDuration = 290;

interface GenerateVideoBody {
  imageUrl?: string;
  description?: string;
  variantStyle?: IntegrationStyle;
  // "5" | "10" — Kling's only supported clip lengths. Optional, defaults "5".
  duration?: string;
}

// Motion modifiers come from VARIANT_DEFINITIONS (kling.ts) so every
// variant generation — initial batch and any retry — uses identical
// prompt wording.
const VARIANT_MODIFIERS: Record<IntegrationStyle, string> = Object.fromEntries(
  VARIANT_DEFINITIONS.map((def) => [def.integrationStyle, def.modifier]),
) as Record<IntegrationStyle, string>;

export async function POST(request: NextRequest) {
  let body: GenerateVideoBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!body.imageUrl || !body.description) {
    return NextResponse.json(
      { error: "Missing required field(s): imageUrl, description." },
      { status: 400 },
    );
  }

  const modifier = body.variantStyle
    ? VARIANT_MODIFIERS[body.variantStyle]
    : undefined;
  // Modifier first (primary instruction), scene description as context
  // after — front-loading gives it more weight than appending it.
  const prompt = modifier
    ? `${modifier} Scene: ${body.description}`
    : body.description;

  const quotaError = await enforceQuota(request, "video");
  if (quotaError) return quotaError;

  const duration: ClipDuration = body.duration === "10" ? "10" : "5";

  try {
    const videoUrl = await generateVideoFromImage(
      body.imageUrl,
      prompt,
      duration,
    );
    // Copy into Vercel Blob (time-boxed inside persistRemoteAsset so it
    // can't push this function past maxDuration after a long Kling poll).
    const permanentUrl = videoUrl
      ? await persistRemoteAsset(videoUrl, "video")
      : videoUrl;
    return NextResponse.json({
      videoUrl: permanentUrl,
      status: permanentUrl ? "complete" : "mock",
      duration: Number(duration),
    });
  } catch (error) {
    console.error("[/api/generate-video] failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error generating video.";
    // taskId lets the client offer "Check again" (no new credit) when the
    // failure was our own poll timeout rather than a real Kling failure —
    // this route now serves the per-variant flow, so it needs the same
    // recovery path the old batch route had.
    const taskId = error instanceof KlingTimeoutError ? error.taskId : undefined;
    return NextResponse.json({ error: message, taskId }, { status: 502 });
  }
}
