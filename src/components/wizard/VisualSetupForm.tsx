"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { NarrativeFormat, SceneMood, WizardFormData } from "@/lib/types";

interface VisualSetupFormProps {
  data: WizardFormData;
  onChange: (partial: Partial<WizardFormData>) => void;
}

const moods: { value: SceneMood; label: string }[] = [
  { value: "urban", label: "Urban" },
  { value: "domestic", label: "Domestic" },
  { value: "outdoor", label: "Outdoor" },
  { value: "abstract", label: "Abstract" },
];

const formats: {
  value: NarrativeFormat;
  label: string;
  description: string;
}[] = [
  {
    value: "slice-of-life",
    label: "Slice of Life",
    description: "Everyday moments, organic brand integration.",
  },
  {
    value: "micro-thriller",
    label: "Micro-Thriller",
    description: "Cliffhanger endings, peak emotional tension.",
  },
  {
    value: "character-comedy",
    label: "Character Comedy",
    description: "Fixed character, recurring situations.",
  },
];

export function VisualSetupForm({ data, onChange }: VisualSetupFormProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <label className="text-sm text-text-secondary">Scene mood</label>
        <div className="grid grid-cols-2 gap-3">
          {moods.map((mood) => (
            <SelectableCard
              key={mood.value}
              selected={data.sceneMood === mood.value}
              onClick={() => onChange({ sceneMood: mood.value })}
            >
              <span className="text-sm font-medium text-text-primary">
                {mood.label}
              </span>
            </SelectableCard>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm text-text-secondary">
          Narrative format
        </label>
        <div className="flex flex-col gap-3">
          {formats.map((format) => (
            <SelectableCard
              key={format.value}
              selected={data.selectedFormat === format.value}
              onClick={() => onChange({ selectedFormat: format.value })}
            >
              <p className="text-sm font-semibold text-text-primary">
                {format.label}
              </p>
              <p className="text-sm leading-6 text-text-secondary">
                {format.description}
              </p>
            </SelectableCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col gap-1 transition-colors",
        selected ? "border-accent" : "hover:border-text-secondary"
      )}
    >
      {children}
    </Card>
  );
}
