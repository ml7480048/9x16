import { NextRequest, NextResponse } from "next/server";
import { generateVideoFromImage } from "@/lib/kling";

interface GenerateVideoBody {
  imageUrl?: string;
  description?: string;
  variantStyle?: "ambient" | "narrative-native" | "direct";
}

const VARIANT_MODIFIERS: Record<
  NonNullable<GenerateVideoBody["variantStyle"]>,
  string
> = {
  ambient: "Keep the product subtle, visible in the background only.",
  "narrative-native": "The product should visibly drive the moment of action.",
  direct: "Feature the product directly and prominently in the frame.",
};

export async function POST(request: NextRequest) {
  let body: GenerateVideoBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!body.imageUrl || !body.description) {
    return NextResponse.json(
      { error: "Missing required field(s): imageUrl, description." },
      { status: 400 }
    );
  }

  const modifier = body.variantStyle ? VARIANT_MODIFIERS[body.variantStyle] : undefined;
  const prompt = modifier ? `${body.description} ${modifier}` : body.description;

  try {
    const videoUrl = await generateVideoFromImage(body.imageUrl, prompt);
    return NextResponse.json({
      videoUrl,
      status: videoUrl ? "complete" : "mock",
      duration: 5,
    });
  } catch (error) {
    console.error("[/api/generate-video] failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error generating video.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
