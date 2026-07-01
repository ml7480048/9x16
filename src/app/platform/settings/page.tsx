// No real settings fields exist yet — there's no account/workspace data
// model to back them (the only stored user data today is the lead-capture
// gate, see LeadGateForm.tsx). Kept as an honest "coming soon" rather than
// fabricating inputs with nothing behind them. Whichever fields land here
// first should follow the wizard's underline-input pattern (Input.tsx /
// Textarea.tsx) and be grouped under plain typographic section labels —
// no Card containers.
export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-3 px-6 py-24">
      <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
        Account
      </span>
      <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] text-text-primary">
        Settings
      </h1>
      <p className="max-w-xs text-sm text-text-secondary">
        Account and workspace settings — not in MVP scope yet.
      </p>
    </div>
  );
}
