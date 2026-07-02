import { sql } from "@vercel/postgres";

/**
 * Lead capture — gates access to the wizard (see LeadGateForm.tsx) so
 * random visitors can't burn Kling/Anthropic credits, and gives Marian a
 * client list to follow up with. Backed by a Postgres database connected
 * via the Vercel Marketplace (Neon or similar) — the `sql` tag reads its
 * connection string from `POSTGRES_URL`, which Vercel injects
 * automatically once a Postgres integration is connected to the project.
 */
export interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  createdAt: string;
}

let schemaReady = false;

// Idempotent — cheap enough to run once per cold start rather than require
// a separate manual migration step for a table this simple.
async function ensureSchema() {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  schemaReady = true;
}

export async function saveLead(lead: {
  name: string;
  email: string;
  company: string;
}): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO leads (name, email, company)
    VALUES (${lead.name}, ${lead.email}, ${lead.company});
  `;
}

export async function listLeads(): Promise<Lead[]> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT id, name, email, company, created_at AS "createdAt"
    FROM leads
    ORDER BY created_at DESC;
  `;
  return rows as Lead[];
}

// ---------------------------------------------------------------------------
// Per-lead generation quotas (2026-07-02). The lead-cookie gate stops
// anonymous drive-by abuse, but one lead could still burn the whole Kling
// trial package by regenerating in a loop — every generation now records a
// usage event and each kind has a hard per-email cap. A stopgap like the
// rest of the auth story: no time windows, no admin reset UI (delete rows
// in the DB to reset someone).
// ---------------------------------------------------------------------------

export type UsageKind = "scenes" | "script" | "image" | "video" | "match";

// Videos are the real money (trial: 100 units); images are cheap (1000
// units); Claude calls are cents. 30 videos ≈ 10 full Step-5 runs.
const USAGE_LIMITS: Record<UsageKind, number> = {
  scenes: 60,
  script: 60,
  image: 120,
  video: 30,
  match: 60,
};

let usageSchemaReady = false;

async function ensureUsageSchema() {
  if (usageSchemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS usage_events (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      kind TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  usageSchemaReady = true;
}

export interface QuotaCheck {
  allowed: boolean;
  used: number;
  limit: number;
}

/**
 * Counts this email's past events of `kind`; if under the cap, records one
 * more and allows. Not transactional — two racing requests can each slip
 * in at the boundary, which is fine for a cost stopgap.
 *
 * Without POSTGRES_URL (local dev with no DB) quotas are skipped entirely
 * rather than breaking the wizard.
 */
export async function checkAndRecordUsage(
  email: string,
  kind: UsageKind,
): Promise<QuotaCheck> {
  const limit = USAGE_LIMITS[kind];
  if (!process.env.POSTGRES_URL) {
    return { allowed: true, used: 0, limit };
  }
  await ensureUsageSchema();
  const { rows } = await sql`
    SELECT count(*)::int AS used FROM usage_events
    WHERE email = ${email} AND kind = ${kind};
  `;
  const used = (rows[0]?.used as number) ?? 0;
  if (used >= limit) {
    return { allowed: false, used, limit };
  }
  await sql`
    INSERT INTO usage_events (email, kind) VALUES (${email}, ${kind});
  `;
  return { allowed: true, used: used + 1, limit };
}
