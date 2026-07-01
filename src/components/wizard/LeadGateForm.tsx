"use client";

import { ReactNode, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/**
 * Soft gate in front of the wizard (see /platform/new/page.tsx). Not real
 * auth — just contact details (no password), so casual visitors can't
 * anonymously burn Kling/Anthropic credits, and Marian gets a lead list.
 * On success, /api/leads sets a cookie and we router.refresh() so the
 * server component re-checks it and swaps in the real Wizard.
 */
export function LeadGateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, company }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
        router.refresh();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setSubmitting(false);
      });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
          Before we start
        </h1>
        <p className="text-sm leading-6 text-text-secondary">
          A quick intro so we know who&apos;s testing — no password, takes 10
          seconds.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Your name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@brand.com"
            required
          />
        </Field>
        <Field label="Brand / company">
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Viennese Coffee Co."
            required
          />
        </Field>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button type="submit" disabled={submitting} className="mt-2">
          {submitting ? "Starting..." : "Start my prototype"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary">{label}</label>
      {children}
    </div>
  );
}
