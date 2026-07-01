import { NextResponse } from "next/server";
import { saveLead } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const company = typeof body?.company === "string" ? body.company.trim() : "";

  if (!name || !email || !company) {
    return NextResponse.json(
      { error: "Please fill in name, email, and brand/company." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    await saveLead({ name, email, company });
  } catch (err) {
    console.error("Failed to save lead:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your details. Please try again." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  // Soft gate, not real auth: this cookie just remembers "this browser
  // already gave us contact details," so returning visitors on the same
  // device skip the form. No password, no account — see dev spec for the
  // planned upgrade to real accounts later.
  res.cookies.set("9x16_lead", email, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
