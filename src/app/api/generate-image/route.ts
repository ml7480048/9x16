import { NextRequest, NextResponse } from "next/server";
import { generateSceneImage } from "@/lib/kling";
import { enforceQuota } from "@/lib/quota";
import { persistRemoteAsset } from "@/lib/storage";

interface GenerateImageBody {
  description?: string;
  // Optional styling context: the client's Step 2 environment choice and
  // Claude's per-scene lighting/camera phrase. Omitted → base prompt only.
  sceneMood?: string;
  visualMood?: string;
}

export async function POST(request: NextRequest) {
  let body: GenerateImageBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!body.description) {
    return NextResponse.json(
      { error: "Missing required field: description." },
      { status: 400 },
    );
  }

  const quotaError = await enforceQuota(request, "image");
  if (quotaError) return quotaError;

  try {
    const imageUrl = await generateSceneImage(body.description, {
      sceneMood: body.sceneMood,
      visualMood: body.visualMood,
    });
    // Copy into Vercel Blob so the stored session outlives Kling's ~30-day
    // retention (data-URL mock images pass through untouched — not http).
    const permanentUrl = imageUrl.startsWith("http")
      ? await persistRemoteAsset(imageUrl, "image")
      : imageUrl;
    return NextResponse.json({ imageUrl: permanentUrl });
  } catch (error) {
    console.error("[/api/generate-image] failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error generating image.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
