import { NextRequest, NextResponse } from "next/server";
import { generateBrandVariants } from "@/lib/kling";

interface GenerateVariantsBody {
  imageUrl?: string;
  description?: string;
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

  const variants = await generateBrandVariants(body.imageUrl, body.description);
  return NextResponse.json({ variants });
}
