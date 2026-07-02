import { NextRequest, NextResponse } from "next/server";
import { generateScript, type SceneDraft } from "@/lib/anthropic";
import type { NarrativeFormat, SceneMood } from "@/lib/types";

interface GenerateScriptBody {
  brandName?: string;
  product?: string;
  tone?: string;
  audience?: string;
  campaignGoal?: string;
  sceneMood?: string;
  selectedFormat?: string;
  scenes?: SceneDraft[];
}

const REQUIRED_FIELDS: (keyof GenerateScriptBody)[] = [
  "brandName",
  "product",
  "tone",
  "audience",
  "campaignGoal",
];

export async function POST(request: NextRequest) {
  let body: GenerateScriptBody;

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

  if (!Array.isArray(body.scenes) || body.scenes.length === 0) {
    return NextResponse.json(
      { error: "Missing required field: scenes (non-empty array)." },
      { status: 400 },
    );
  }

  try {
    const script = await generateScript(
      {
        brandName: body.brandName!,
        product: body.product!,
        tone: body.tone as "lifestyle" | "thriller" | "comedy",
        audience: body.audience!,
        campaignGoal: body.campaignGoal!,
      },
      body.scenes,
      // Optional (not in REQUIRED_FIELDS): pre-fix persisted sessions may
      // retry the script call without these — the prompt just omits the
      // lines rather than failing the whole step.
      {
        sceneMood: (body.sceneMood ?? "") as SceneMood | "",
        selectedFormat: (body.selectedFormat ?? "") as NarrativeFormat | "",
      },
    );

    return NextResponse.json({ script });
  } catch (error) {
    console.error("[/api/generate-script] failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error generating script.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
