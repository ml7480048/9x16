"use client";

import { ReactNode } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { ToneOption, WizardFormData } from "@/lib/types";

interface BrandInputFormProps {
  data: WizardFormData;
  onChange: (partial: Partial<WizardFormData>) => void;
}

const tones: { value: ToneOption; label: string }[] = [
  { value: "lifestyle", label: "Lifestyle" },
  { value: "thriller", label: "Thriller" },
  { value: "comedy", label: "Comedy" },
];

// A24-minimalist pass (2026-07): one calm question at a time — underline
// inputs, small-caps labels above, 48px+ between fields. Tone is now 3
// plain text options instead of a dropdown.
export function BrandInputForm({ data, onChange }: BrandInputFormProps) {
  return (
    <div className="flex flex-col gap-12">
      <Field label="Brand name">
        <Input
          value={data.brandName}
          onChange={(e) => onChange({ brandName: e.target.value })}
          placeholder="e.g. Viennese Coffee Co."
        />
      </Field>

      <Field label="Product / service">
        <Input
          value={data.product}
          onChange={(e) => onChange({ product: e.target.value })}
          placeholder="e.g. Cold brew coffee line"
        />
      </Field>

      <Field label="Tone">
        <div className="flex gap-6">
          {tones.map((tone) => (
            <button
              key={tone.value}
              type="button"
              onClick={() => onChange({ tone: tone.value })}
              className={cn(
                "text-sm transition-colors",
                data.tone === tone.value
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Target audience">
        <Input
          value={data.audience}
          onChange={(e) => onChange({ audience: e.target.value })}
          placeholder="e.g. Urban professionals, 25–35"
        />
      </Field>

      <Field label="Campaign goal">
        <Textarea
          rows={3}
          value={data.campaignGoal}
          onChange={(e) => onChange({ campaignGoal: e.target.value })}
          placeholder="What should this campaign achieve?"
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-medium uppercase tracking-widest text-text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}
