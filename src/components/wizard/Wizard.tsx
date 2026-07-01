"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "./StepIndicator";
import { BrandInputForm } from "./BrandInputForm";
import { VisualSetupForm } from "./VisualSetupForm";
import { StoryboardGrid } from "./StoryboardGrid";
import { ScriptViewer } from "./ScriptViewer";
import { emptyWizardFormData, type WizardFormData } from "@/lib/types";
import type { EpisodeScript, SceneDraft } from "@/lib/anthropic";

const TOTAL_STEPS = 5;
const STORAGE_KEY = "9x16-wizard-state";

interface PersistedState {
  step: number;
  data: WizardFormData;
  scenes: SceneDraft[] | null;
  script: EpisodeScript | null;
}

function loadPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function Wizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardFormData>(emptyWizardFormData);
  const [scenes, setScenes] = useState<SceneDraft[] | null>(null);
  const [script, setScript] = useState<EpisodeScript | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore persisted progress once, after mount. Deliberately not done via a
  // useState lazy initializer — sessionStorage isn't available during server
  // render, so reading it there would cause a hydration mismatch. The state
  // updates are deferred to a microtask (rather than called synchronously in
  // the effect body) to satisfy the "no setState directly in effect" rule.
  useEffect(() => {
    queueMicrotask(() => {
      const persisted = loadPersisted();
      if (persisted) {
        setStep(persisted.step);
        setData(persisted.data);
        setScenes(persisted.scenes);
        setScript(persisted.script);
      }
      setHydrated(true);
    });
  }, []);

  // Persist progress so an accidental reload (e.g. mobile pull-to-refresh) doesn't
  // wipe the session. Gated on `hydrated` so we don't overwrite a just-restored
  // session with pre-restore defaults on the very first render.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const payload: PersistedState = { step, data, scenes, script };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, step, data, scenes, script]);

  function update(partial: Partial<WizardFormData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  const step1Valid =
    data.brandName.trim() !== "" &&
    data.product.trim() !== "" &&
    data.tone !== "" &&
    data.audience.trim() !== "" &&
    data.campaignGoal.trim() !== "";

  const step2Valid = data.sceneMood !== "" && data.selectedFormat !== "";
  const step3Valid = scenes !== null;
  const step4Valid = script !== null;

  const canGoNext =
    step === 1
      ? step1Valid
      : step === 2
        ? step2Valid
        : step === 3
          ? step3Valid
          : step === 4
            ? step4Valid
            : false;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 py-10">
      <StepIndicator currentStep={step} />

      {step === 1 && <BrandInputForm data={data} onChange={update} />}
      {step === 2 && <VisualSetupForm data={data} onChange={update} />}
      {step === 3 && (
        <StoryboardGrid
          brandData={data}
          scenes={scenes}
          onScenesReady={setScenes}
        />
      )}
      {step === 4 && scenes && (
        <ScriptViewer
          brandData={data}
          scenes={scenes}
          script={script}
          onScriptReady={setScript}
        />
      )}
      {step === 5 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="max-w-xs text-sm text-text-secondary">
            Video preview + Brand Prototype variants arrive Week 3.
          </p>
        </div>
      )}

      <div className="mt-auto flex justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Back
        </Button>
        <Button
          onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
          disabled={!canGoNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
