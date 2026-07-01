import { NextRequest, NextResponse } from "next/server";
import { generateVideoFromImage, VARIANT_DEFINITIONS } from "@/lib/kling";
import type { IntegrationStyle } from "@/lib/kling";

interface GenerateVideoBody {
  imageUrl?: string;
  description?: string;
  variantStyle?: IntegrationStyle;
}

// Shares its modifier text with generateBrandVariants (kling.ts) so a single
// re-generated variant (e.g. Retry after a timeout) uses the exact same
// prompt wording as the initial parallel batch.
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
  const prompt = modifier
    ? `${body.description} ${modifier}`
    : body.description;

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
      error instanceof Error
        ? error.message
        : "Unknown error generating video.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
