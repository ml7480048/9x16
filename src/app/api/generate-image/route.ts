import { NextRequest, NextResponse } from "next/server";
import { generateSceneImage } from "@/lib/kling";

interface GenerateImageBody {
  description?: string;
}

export async function POST(request: NextRequest) {
  let body: GenerateImageBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!body.description) {
    return NextResponse.json(
      { error: "Missing required field: description." },
      { status: 400 }
    );
  }

  try {
    const imageUrl = await generateSceneImage(body.description);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("[/api/generate-image] failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error generating image.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
