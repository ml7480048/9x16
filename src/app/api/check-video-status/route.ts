import { NextRequest, NextResponse } from "next/server";
import { checkVideoTaskStatus } from "@/lib/kling";
import { persistRemoteAsset } from "@/lib/storage";

interface CheckVideoStatusBody {
  taskId?: string;
}

/**
 * One-shot check for a video task that our own poll previously gave up on
 * (KlingTimeoutError) — does NOT create a new task or spend a new Kling
 * credit, just asks "is it done yet?". See kling.ts's checkVideoTaskStatus.
 */
export async function POST(request: NextRequest) {
  let body: CheckVideoStatusBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!body.taskId) {
    return NextResponse.json(
      { error: "Missing required field: taskId." },
      { status: 400 },
    );
  }

  try {
    const result = await checkVideoTaskStatus(body.taskId);
    // Recovered videos need the same permanence as first-try ones.
    if (result.status === "succeed" && result.videoUrl) {
      result.videoUrl = await persistRemoteAsset(result.videoUrl, "video");
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/check-video-status] failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error checking task.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
