import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { stitchClips, type ExportClip } from "@/lib/ffmpeg";
import { enforceQuota } from "@/lib/quota";

// Downloading N clips + running ffmpeg + uploading the result comfortably
// fits well under Vercel's 300s ceiling for a handful of short clips, but
// give it real headroom above the video-generation routes' 290s since this
// one does several sequential network round-trips instead of one poll.
export const maxDuration = 120;

interface ExportEpisodeBody {
  clips?: { order?: number; videoUrl?: string | null }[];
}

function isUsableClip(
  clip: NonNullable<ExportEpisodeBody["clips"]>[number],
): clip is ExportClip {
  return typeof clip.order === "number" && typeof clip.videoUrl === "string";
}

export async function POST(request: NextRequest) {
  let body: ExportEpisodeBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const clips = (body.clips ?? []).filter(isUsableClip);

  if (clips.length === 0) {
    return NextResponse.json(
      { error: "No generated clips to export yet." },
      { status: 400 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "No storage configured for this environment — connect a Vercel Blob store to enable episode export.",
      },
      { status: 500 },
    );
  }

  const quotaError = await enforceQuota(request, "export");
  if (quotaError) return quotaError;

  try {
    const file = await stitchClips(clips);
    const blob = await put(`episodes/${crypto.randomUUID()}.mp4`, file, {
      access: "public",
      contentType: "video/mp4",
    });
    return NextResponse.json({ videoUrl: blob.url });
  } catch (error) {
    console.error("[/api/export-episode] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to export episode.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
