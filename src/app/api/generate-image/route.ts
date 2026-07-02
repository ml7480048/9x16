import { NextRequest, NextResponse } from "next/server";
import { generateSceneImage } from "@/lib/kling";

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

  try {
    const imageUrl = await generateSceneImage(body.description, {
      sceneMood: body.sceneMood,
      visualMood: body.visualMood,
    });
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("[/api/generate-image] failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error generating image.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
