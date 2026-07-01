import { NextRequest, NextResponse } from "next/server";
import { generateSceneDescriptions } from "@/lib/anthropic";

interface GenerateScenesBody {
  brandName?: string;
  product?: string;
  tone?: string;
  audience?: string;
  campaignGoal?: string;
}

const REQUIRED_FIELDS: (keyof GenerateScenesBody)[] = [
  "brandName",
  "product",
  "tone",
  "audience",
  "campaignGoal",
];

export async function POST(request: NextRequest) {
  let body: GenerateScenesBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const scenes = await generateSceneDescriptions({
      brandName: body.brandName!,
      product: body.product!,
      tone: body.tone as "lifestyle" | "thriller" | "comedy",
      audience: body.audience!,
      campaignGoal: body.campaignGoal!,
    });

    return NextResponse.json({ scenes });
  } catch (error) {
    console.error("[/api/generate-scenes] failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error generating scenes.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
