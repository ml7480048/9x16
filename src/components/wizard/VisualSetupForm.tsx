"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  EPISODE_LENGTH_CONFIG,
  type EpisodeLength,
  type NarrativeFormat,
  type SceneMood,
  type WizardFormData,
} from "@/lib/types";
import type { FormatMatch } from "@/lib/anthropic";

interface VisualSetupFormProps {
  data: WizardFormData;
  onChange: (partial: Partial<WizardFormData>) => void;
  /** Agent 2's cached recommendation (lifted to Wizard + persisted) — null
   * until fetched. The client still picks freely; this is guidance only. */
  formatMatch: FormatMatch | null;
  onFormatMatch: (match: FormatMatch) => void;
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

export function VisualSetupForm({
  data,
  onChange,
  formatMatch,
  onFormatMatch,
}: VisualSetupFormProps) {
  const [matchLoading, setMatchLoading] = useState(!formatMatch);
  // Ref guard against StrictMode's double mount-effect (same pattern as
  // the other wizard steps' generation fetches).
  const matchFetchStarted = useRef(false);

  // Fetch Agent 2's recommendation once per session (cached in Wizard
  // state). Failure is silent — the recommendation is optional guidance,
  // not worth blocking Step 2 with an error screen.
  useEffect(() => {
    if (formatMatch || matchFetchStarted.current) {
      setMatchLoading(false);
      return;
    }
    matchFetchStarted.current = true;
    fetch("/api/match-format", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName: data.brandName,
        product: data.product,
        tone: data.tone,
        audience: data.audience,
        campaignGoal: data.campaignGoal,
      }),
    })
      .then(async (res) => {
        const payload = await res.json();
        if (res.ok && payload.match) onFormatMatch(payload.match);
      })
      .catch(() => {})
      .finally(() => setMatchLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <label className="text-sm text-text-secondary">Episode length</label>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(EPISODE_LENGTH_CONFIG) as EpisodeLength[]).map(
            (value) => {
              const config = EPISODE_LENGTH_CONFIG[value];
              return (
                <SelectableCard
                  key={value}
                  selected={data.episodeLength === value}
                  onClick={() => onChange({ episodeLength: value })}
                >
                  <span className="text-sm font-medium text-text-primary">
                    {config.label}
                  </span>
                  <span className="text-xs leading-4 text-text-secondary">
                    {config.description}
                  </span>
                </SelectableCard>
              );
            },
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-sm text-text-secondary">
            Narrative format
          </label>
          {matchLoading && (
            <span className="text-xs text-text-secondary/60">
              Matching your brand...
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {formats.map((format) => {
            const recommended = formatMatch?.recommended === format.value;
            return (
              <SelectableCard
                key={format.value}
                selected={data.selectedFormat === format.value}
                onClick={() => onChange({ selectedFormat: format.value })}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary">
                    {format.label}
                  </p>
                  {recommended && (
                    <span className="text-[10px] font-medium uppercase tracking-widest text-text-primary">
                      Recommended
                      {typeof formatMatch?.confidence === "number"
                        ? ` · ${Math.round(formatMatch.confidence * 100)}%`
                        : ""}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-6 text-text-secondary">
                  {format.description}
                </p>
                {recommended && formatMatch?.reasoning && (
                  <p className="text-xs leading-5 text-text-secondary/80">
                    {formatMatch.reasoning}
                  </p>
                )}
              </SelectableCard>
            );
          })}
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
        selected ? "!border-accent" : "hover:border-text-secondary",
      )}
    >
      {children}
    </Card>
  );
}
