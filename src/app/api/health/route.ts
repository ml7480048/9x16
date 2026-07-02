import { NextResponse } from "next/server";

// Admin-only ops endpoint (Basic Auth via proxy.ts, same creds as
// /platform/leads). Reports PRESENCE of critical env config — never
// values — so "did the Blob store / DB actually get connected on Vercel?"
// is answerable without digging through the dashboard.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      kling: !!process.env.KLING_API_KEY,
      postgres: !!process.env.POSTGRES_URL,
      blob: !!process.env.BLOB_READ_WRITE_TOKEN,
      adminAuth: !!process.env.ADMIN_USER && !!process.env.ADMIN_PASSWORD,
    },
  });
}
