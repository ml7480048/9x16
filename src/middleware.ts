import { NextResponse, type NextRequest } from "next/server";

// Guards /platform/leads with HTTP Basic Auth. This is a stopgap, not a
// real admin login system — good enough since it's the only sensitive page
// in the app right now (everything else is either public marketing or
// gated only by the soft lead-capture cookie). Revisit if more admin
// surface area gets added later.
export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/platform/leads")) {
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
  matcher: "/platform/leads/:path*",
};
