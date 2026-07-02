import { NextRequest, NextResponse } from "next/server";
import { matchFormat } from "@/lib/anthropic";
import { enforceQuota } from "@/lib/quota";

interface MatchFormatBody {
  brandName?: string;
  product?: string;
  tone?: string;
  audience?: string;
  campaignGoal?: string;
}

const REQUIRED_FIELDS: (keyof MatchFormatBody)[] = [
  "brandName",
  "product",
  "tone",
  "audience",
  "campaignGoal",
];

/**
 * Agent 2 — Matching Agent (Day 19). Recommends the best narrative format
 * for the Step 1 brand profile; the wizard shows it as guidance on Step 2
 * (the client still picks freely). matchFormat() itself has existed since
 * Day 6 — this route finally exposes it.
 */
export async function POST(request: NextRequest) {
  let body: MatchFormatBody;

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

  const quotaError = await enforceQuota(request, "match");
  if (quotaError) return quotaError;

  try {
    const match = await matchFormat({
      brandName: body.brandName!,
      product: body.product!,
      tone: body.tone as "lifestyle" | "thriller" | "comedy",
      audience: body.audience!,
      campaignGoal: body.campaignGoal!,
    });
    return NextResponse.json({ match });
  } catch (error) {
    console.error("[/api/match-format] failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error matching format.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
