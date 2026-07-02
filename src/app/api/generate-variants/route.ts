import { NextRequest, NextResponse } from "next/server";
import { generateBrandVariants, type ClipDuration } from "@/lib/kling";

// Kling video generation can take a few minutes; must exceed kling.ts's own
// POLL_TIMEOUT_MS (270s) or Vercel would kill the function first with a
// generic timeout instead of our own clear error. 290s stays under the 300s
// ceiling shared by Hobby and Pro plans with Fluid Compute.
export const maxDuration = 290;

interface GenerateVariantsBody {
  imageUrl?: string;
  description?: string;
  // "5" | "10" — Kling's only supported clip lengths. Optional: defaults
  // to "5" (pre-episode-length sessions don't send it).
  duration?: string;
}

/**
 * Day 11 evening — generates all 3 Brand Prototype variants (A/B/C) for one
 * hero scene in parallel. Scoped to a single scene, not every scene, to keep
 * Kling video-credit spend bounded per test (see progress tracker note).
 */
export async function POST(request: NextRequest) {
  let body: GenerateVariantsBody;

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

  const duration: ClipDuration = body.duration === "10" ? "10" : "5";
  const variants = await generateBrandVariants(
    body.imageUrl,
    body.description,
    duration,
  );
  return NextResponse.json({ variants });
}
