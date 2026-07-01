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
