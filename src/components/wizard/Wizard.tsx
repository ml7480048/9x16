"use client";

import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { StepIndicator } from "./StepIndicator";
import { BrandInputForm } from "./BrandInputForm";
import { VisualSetupForm } from "./VisualSetupForm";
import { StoryboardGrid } from "./StoryboardGrid";
import { ScriptViewer } from "./ScriptViewer";
import { PrototypeViewer } from "./PrototypeViewer";
import {
  emptyWizardFormData,
  EPISODE_LENGTH_CONFIG,
  type SceneImages,
  type WizardFormData,
} from "@/lib/types";
import type { EpisodeScript, FormatMatch, SceneDraft } from "@/lib/anthropic";
import type { VariantLabel, VariantResult } from "@/lib/kling";
import {
  getCurrentSessionId,
  getSession,
  migrateLegacySession,
  newSessionId,
  saveSession,
  setCurrentSessionId,
} from "@/lib/sessions";

const TOTAL_STEPS = 5;

export function Wizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardFormData>(emptyWizardFormData);
  const [formatMatch, setFormatMatch] = useState<FormatMatch | null>(null);
  const [scenes, setScenes] = useState<SceneDraft[] | null>(null);
  const [script, setScript] = useState<EpisodeScript | null>(null);
  const [images, setImages] = useState<SceneImages>({});
  const [variants, setVariants] = useState<VariantResult[] | null>(null);
  const [variantsSceneId, setVariantsSceneId] = useState<string | null>(null);
  const [activeVariantLabel, setActiveVariantLabel] =
    useState<VariantLabel>("A");
  const [heroSceneId, setHeroSceneId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Resolve which session this wizard mount belongs to, then restore it —
  // once, after mount (localStorage isn't available during server render;
  // reading it earlier would cause a hydration mismatch). Resolution order:
  //   1. ?session=<id> — explicit resume from /platform/session/[id];
  //   2. the "current session" pointer — plain revisit/reload of
  //      /platform/new picks up in-flight progress (the original iOS Safari
  //      tab-discard fix), unless Sidebar's "New Session" cleared it;
  //   3. otherwise a fresh id (not saved until something meaningful exists).
  // State updates are deferred to a microtask to satisfy the "no setState
  // directly in effect" rule.
  useEffect(() => {
    queueMicrotask(() => {
      migrateLegacySession();
      const paramId = new URLSearchParams(window.location.search).get(
        "session",
      );
      const persisted =
        (paramId ? getSession(paramId) : null) ??
        (() => {
          const currentId = getCurrentSessionId();
          return currentId ? getSession(currentId) : null;
        })();
      if (persisted) {
        setSessionId(persisted.id);
        setCurrentSessionId(persisted.id);
        setStep(persisted.step);
        // Spread over the empty template so sessions saved before a field
        // existed (e.g. episodeLength) restore as "" rather than undefined —
        // undefined would slip past the `!== ""` step validation.
        setData({ ...emptyWizardFormData, ...persisted.data });
        setFormatMatch(persisted.formatMatch ?? null);
        setScenes(persisted.scenes);
        setScript(persisted.script);
        setImages(persisted.images ?? {});
        setVariants(persisted.variants ?? null);
        setVariantsSceneId(persisted.variantsSceneId ?? null);
        setActiveVariantLabel(persisted.activeVariantLabel ?? "A");
        setHeroSceneId(persisted.heroSceneId ?? null);
      } else {
        setSessionId(newSessionId());
      }
      setHydrated(true);
    });
  }, []);

  // Persist progress into the session store (localStorage, not
  // sessionStorage, so it survives a backgrounded/closed mobile tab — iOS
  // Safari can silently discard sessionStorage when the tab is suspended).
  // Gated on `hydrated` so we don't overwrite a just-restored session with
  // pre-restore defaults on the very first render, and on "something was
  // actually entered" so merely opening the wizard doesn't litter the
  // Sessions list with blank entries.
  useEffect(() => {
    if (!hydrated || !sessionId) return;
    const touched =
      step > 1 ||
      scenes !== null ||
      Object.values(data).some((value) => value !== "");
    if (!touched) return;
    saveSession({
      id: sessionId,
      step,
      data,
      formatMatch,
      scenes,
      script,
      images,
      variants,
      variantsSceneId,
      activeVariantLabel,
      heroSceneId,
    });
    setCurrentSessionId(sessionId);
  }, [
    hydrated,
    sessionId,
    step,
    data,
    formatMatch,
    scenes,
    script,
    images,
    variants,
    variantsSceneId,
    activeVariantLabel,
    heroSceneId,
  ]);

  function update(partial: Partial<WizardFormData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  const step1Valid =
    data.brandName.trim() !== "" &&
    data.product.trim() !== "" &&
    data.tone !== "" &&
    data.audience.trim() !== "" &&
    data.campaignGoal.trim() !== "";

  const step2Valid =
    data.sceneMood !== "" &&
    data.selectedFormat !== "" &&
    data.episodeLength !== "";
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
      <StepIndicator currentStep={step} onStepSelect={setStep} />

      {/* Keyed on step so each step change remounts the wrapper and re-runs
          the fade — the design system's only sanctioned motion (subtle fade,
          nothing bouncy). Step components already remounted on change via
          the conditional renders, so the key adds no new unmount behavior. */}
      <div key={step} className="animate-fade-in flex flex-1 flex-col">
      {step === 1 && <BrandInputForm data={data} onChange={update} />}
      {step === 2 && (
        <VisualSetupForm
          data={data}
          onChange={update}
          formatMatch={formatMatch}
          onFormatMatch={setFormatMatch}
        />
      )}
      {step === 3 && (
        <StoryboardGrid
          brandData={data}
          scenes={scenes}
          onScenesReady={setScenes}
          images={images}
          onImagesChange={setImages}
          heroSceneId={heroSceneId}
          onHeroSceneChange={setHeroSceneId}
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
      {step === 5 && scenes && (
        <PrototypeViewer
          scenes={scenes}
          images={images}
          heroSceneId={heroSceneId}
          variants={variants}
          variantsSceneId={variantsSceneId}
          onVariantsReady={(v, sourceSceneId) => {
            setVariants(v);
            setVariantsSceneId(sourceSceneId);
          }}
          activeLabel={activeVariantLabel}
          onActiveLabelChange={setActiveVariantLabel}
          clipDuration={
            data.episodeLength
              ? EPISODE_LENGTH_CONFIG[data.episodeLength].clipDuration
              : "5"
          }
        />
      )}
      </div>

      <div className="mt-auto flex justify-between gap-3">
        {/* Back points the other way, so it gets a manual ← instead of the
            Button component's built-in → (which always trails forward). */}
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className={buttonVariants()}
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
        <Button
          variant="accent"
          onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
          disabled={!canGoNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
