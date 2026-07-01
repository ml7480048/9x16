import { cookies } from "next/headers";
import { Wizard } from "@/components/wizard/Wizard";
import { LeadGateForm } from "@/components/wizard/LeadGateForm";

// Soft gate — no password, just contact details (see LeadGateForm) so
// anonymous visitors can't burn Kling/Anthropic credits, and Marian gets a
// lead list. Server-rendered check so the wizard's real content never
// ships to an unverified visitor's browser in the first place.
export default async function NewSessionPage() {
  const cookieStore = await cookies();
  const verified = cookieStore.get("9x16_lead")?.value;
  if (!verified) return <LeadGateForm />;
  return <Wizard />;
}
