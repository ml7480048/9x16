"use client";

import { ReactNode } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { WizardFormData } from "@/lib/types";

interface BrandInputFormProps {
  data: WizardFormData;
  onChange: (partial: Partial<WizardFormData>) => void;
}

export function BrandInputForm({ data, onChange }: BrandInputFormProps) {
  return (
    <div className="flex flex-col gap-5">
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
        <Select
          value={data.tone}
          onChange={(e) =>
            onChange({ tone: e.target.value as WizardFormData["tone"] })
          }
        >
          <option value="" disabled>
            Select a tone
          </option>
          <option value="lifestyle">Lifestyle</option>
          <option value="thriller">Thriller</option>
          <option value="comedy">Comedy</option>
        </Select>
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
    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary">{label}</label>
      {children}
    </div>
  );
}
