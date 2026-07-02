import { NextRequest, NextResponse } from "next/server";
import { generateSceneDescriptions } from "@/lib/anthropic";
import { enforceQuota } from "@/lib/quota";
import type { NarrativeFormat, SceneMood } from "@/lib/types";

interface GenerateScenesBody {
  brandName?: string;
  product?: string;
  tone?: string;
  audience?: string;
  campaignGoal?: string;
  sceneMood?: string;
  selectedFormat?: string;
  // From the Step 2 episode-length choice. Optional (older sessions):
  // omitted → the prompt's original 4-6 range.
  sceneCount?: number;
}

// sceneMood/selectedFormat are required too — Step 2 validation guarantees
// they're set before the wizard ever calls this, and without them the
// client's Visual Setup choices would silently not influence the output
// (the exact bug this fixed on 2026-07-02).
const REQUIRED_FIELDS: (keyof GenerateScenesBody)[] = [
  "brandName",
  "product",
  "tone",
  "audience",
  "campaignGoal",
  "sceneMood",
  "selectedFormat",
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

  const quotaError = await enforceQuota(request, "scenes");
  if (quotaError) return quotaError;

  try {
    const scenes = await generateSceneDescriptions(
      {
        brandName: body.brandName!,
        product: body.product!,
        tone: body.tone as "lifestyle" | "thriller" | "comedy",
        audience: body.audience!,
        campaignGoal: body.campaignGoal!,
      },
      {
        sceneMood: body.sceneMood as SceneMood,
        selectedFormat: body.selectedFormat as NarrativeFormat,
      },
      // Clamp to a sane band so a hand-crafted request can't ask Claude for
      // 50 scenes (each one later costs a Kling image credit).
      typeof body.sceneCount === "number"
        ? Math.max(2, Math.min(8, Math.floor(body.sceneCount)))
        : undefined,
    );

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
