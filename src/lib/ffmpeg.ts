// Episode export — stitches playlist clips into one downloadable mp4 via
// ffmpeg (reserve-days feature, 2026-07). Runs the concat DEMUXER with a
// forced re-encode (not `-c copy`) because clips come from separate Kling
// generation calls and aren't guaranteed to share identical codec
// parameters — re-encoding costs a little CPU time but always stitches
// cleanly regardless of minor per-clip differences. Audio is dropped
// (`-an`): every clip in this app is muted-by-default already (see
// VerticalPlayer) and Kling clips aren't guaranteed to agree on whether
// they even have an audio track, so mixing that in is more risk than value.
//
// Runs the `ffmpeg-static` prebuilt binary via child_process — needs
// `serverExternalPackages` + `outputFileTracingIncludes` in next.config.ts
// so Vercel's build actually bundles the binary into this route's function
// (the package just exports a path string; nothing about it triggers
// Next.js's automatic file tracing on its own).

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";

const execFileAsync = promisify(execFile);

export interface ExportClip {
  order: number;
  videoUrl: string;
}

/**
 * Downloads each clip, concatenates them in `order`, and returns the
 * resulting mp4 as a Buffer. Throws if the ffmpeg binary isn't available
 * (e.g. local dev before `npm install` has run) or the process fails —
 * callers should surface that as a clear error rather than a silent
 * fallback, since there's no lesser version of "download the episode."
 */
export async function stitchClips(clips: ExportClip[]): Promise<Buffer> {
  if (!ffmpegPath) {
    throw new Error(
      "ffmpeg binary not available in this environment (ffmpeg-static didn't resolve a path).",
    );
  }
  if (clips.length === 0) {
    throw new Error("No clips to stitch.");
  }

  const dir = await mkdtemp(join(tmpdir(), "9x16-export-"));
  try {
    const sorted = [...clips].sort((a, b) => a.order - b.order);
    const inputPaths: string[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const response = await fetch(sorted[i].videoUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to download clip ${i + 1} of ${sorted.length} (${response.status}).`,
        );
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const inputPath = join(dir, `clip-${String(i).padStart(2, "0")}.mp4`);
      await writeFile(inputPath, buffer);
      inputPaths.push(inputPath);
    }

    // Concat demuxer's list file — single-quoted paths, with any literal
    // single quotes in the (temp, generated) path escaped defensively.
    const listPath = join(dir, "list.txt");
    const listContent = inputPaths
      .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
      .join("\n");
    await writeFile(listPath, listContent);

    const outputPath = join(dir, "output.mp4");
    await execFileAsync(ffmpegPath, [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "-movflags",
      "+faststart",
      outputPath,
    ]);

    return await readFile(outputPath);
  } finally {
    // Best-effort cleanup — a warm Lambda instance reusing /tmp across
    // invocations shouldn't accumulate every past export's clips.
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
