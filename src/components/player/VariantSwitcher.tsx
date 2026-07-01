"use client";

import type { IntegrationStyle, VariantLabel } from "@/lib/kling";

interface VariantTab {
  label: VariantLabel;
  integrationStyle: IntegrationStyle;
}

interface VariantSwitcherProps {
  variants: VariantTab[];
  activeLabel: VariantLabel;
  onSelect: (label: VariantLabel) => void;
}

const STYLE_TITLES: Record<IntegrationStyle, string> = {
  ambient: "Ambient",
  "narrative-native": "Narrative",
  direct: "Direct",
};

/**
 * A/B/C tabs for the Brand Prototype feature (dev spec 4.2). Switching must
 * feel instant — the caller is responsible for pre-loading all 3 variant
 * videos before rendering this, so a tap here never waits on a network call.
 */
export function VariantSwitcher({
  variants,
  activeLabel,
  onSelect,
}: VariantSwitcherProps) {
  return (
    <div className="flex gap-1 rounded-input border border-border bg-surface p-1">
      {variants.map((variant) => {
        const active = variant.label === activeLabel;
        return (
          <button
            key={variant.label}
            type="button"
            onClick={() => onSelect(variant.label)}
            aria-pressed={active}
            className={`flex-1 rounded-input px-3 py-2 text-xs font-semibold transition-colors ${
              active
                ? "bg-accent text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {variant.label} · {STYLE_TITLES[variant.integrationStyle]}
          </button>
        );
      })}
    </div>
  );
}
