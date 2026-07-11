import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ffmpeg-static ships a prebuilt binary that /api/export-episode shells
  // out to (see lib/ffmpeg.ts). It only exports a path string — nothing
  // about it triggers Next.js's automatic file tracing — so without both
  // of these the binary silently doesn't make it into the deployed
  // function and the route fails with "ffmpeg binary not available."
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/export-episode/route": ["./node_modules/ffmpeg-static/**"],
  },
};

export default nextConfig;
