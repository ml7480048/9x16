"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "./StepIndicator";
import { BrandInputForm } from "./BrandInputForm";
import { VisualSetupForm } from "./VisualSetupForm";
import { emptyWizardFormData, type WizardFormData } from "@/lib/types";

const TOTAL_STEPS = 5;

export function Wizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardFormData>(emptyWizardFormData);

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

  const canGoNext =
    step === 1 ? step1Valid : step === 2 ? step2Valid : false;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 py-10">
      <StepIndicator currentStep={step} />

      {step === 1 && <BrandInputForm data={data} onChange={update} />}
      {step === 2 && <VisualSetupForm data={data} onChange={update} />}
      {step > 2 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="max-w-xs text-sm text-text-secondary">
            {step === 3 &&
              "Storyboard generation (Claude + Kling AI) arrives Week 2."}
            {step === 4 && "Script generation arrives Week 2."}
            {step === 5 && "Video preview + Brand Prototype arrives Week 3."}
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
