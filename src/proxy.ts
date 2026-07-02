import { NextResponse, type NextRequest } from "next/server";

// Proxy (the file convention formerly named `middleware` — renamed per the
// Next.js 16 deprecation warning). Two guards live here:
//
// 1. AI generation API routes require the `9x16_lead` cookie. The lead gate
//    used to protect only the /platform/new PAGE — the /api/generate-*
//    routes themselves were wide open, so anyone who found them in DevTools
//    could burn real Kling/Anthropic credits with curl, no form needed.
//    The cookie is httpOnly and set by /api/leads, so a browser can only
//    have it by actually going through the lead form. This is still the
//    same soft gate as the page (no signature, an attacker could forge the
//    cookie header) — it stops drive-by/anonymous abuse, not a determined
//    attacker; per-lead quotas are the planned next layer.
//
// 2. /platform/leads gets HTTP Basic Auth. A stopgap, not a real admin
//    login system — good enough since it's the only admin page right now.
const AI_API_PREFIXES = [
  "/api/generate-scenes",
  "/api/generate-script",
  "/api/generate-image",
  "/api/generate-video",
  "/api/check-video-status",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (AI_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!req.cookies.get("9x16_lead")?.value) {
      return NextResponse.json(
        { error: "Please fill in the access form first." },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // Basic Auth guard — admin surfaces: leads table + ops health check.
  if (
    !pathname.startsWith("/platform/leads") &&
    !pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  if (!user || !password) {
    // Fail closed — no credentials configured means no access, not open access.
    return new NextResponse("Admin credentials not configured.", {
      status: 503,
    });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const [reqUser, reqPassword] = atob(encoded).split(":");
      if (reqUser === user && reqPassword === password) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="9x16 admin"' },
  });
}

export const config = {
  matcher: [
    "/platform/leads/:path*",
    "/api/generate-scenes/:path*",
    "/api/generate-script/:path*",
    "/api/generate-image/:path*",
    "/api/generate-video/:path*",
    "/api/check-video-status/:path*",
    "/api/health/:path*",
  ],
};
