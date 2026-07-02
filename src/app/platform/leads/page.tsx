import { listLeads } from "@/lib/db";

// Rendered per-request, never prerendered: without this the build tried to
// bake the leads table into static HTML — a build-time DB snapshot that
// would only refresh on redeploy (and the build failed outright wherever
// POSTGRES_URL isn't set, e.g. locally).
export const dynamic = "force-dynamic";

// Protected by proxy.ts (Basic Auth, ADMIN_USER/ADMIN_PASSWORD) — this
// page itself has no auth check of its own. Not linked from the main nav.
export default async function LeadsPage() {
  const leads = await listLeads();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl leading-[0.95] text-text-primary">
        Leads ({leads.length})
      </h1>
      {leads.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No leads yet — they&apos;ll show up here once someone starts a
          session.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated text-xs uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Brand / company</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">{lead.name}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {lead.email}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {lead.company}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
