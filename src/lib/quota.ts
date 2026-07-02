import { NextRequest, NextResponse } from "next/server";
import { checkAndRecordUsage, type UsageKind } from "./db";

/**
 * Per-lead quota gate for the generation routes. Returns an error response
 * to short-circuit with, or null to proceed.
 *
 * The email comes from the 9x16_lead cookie (proxy.ts already guarantees
 * it's present, but re-checked here since this reads its value). A failed
 * quota LOOKUP fails open — cost bookkeeping should never take the
 * product down with it.
 */
export async function enforceQuota(
  request: NextRequest,
  kind: UsageKind,
): Promise<NextResponse | null> {
  const email = request.cookies.get("9x16_lead")?.value;
  if (!email) {
    return NextResponse.json(
      { error: "Please fill in the access form first." },
      { status: 401 },
    );
  }

  try {
    const check = await checkAndRecordUsage(email, kind);
    if (!check.allowed) {
      return NextResponse.json(
        {
          error: `Generation limit reached for this account (${check.used}/${check.limit} ${kind} generations). Contact hello@9x16.at to continue.`,
        },
        { status: 429 },
      );
    }
  } catch (error) {
    console.error("[quota] check failed — allowing request:", error);
  }

  return null;
}
