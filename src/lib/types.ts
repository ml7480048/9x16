// Shared data models — 9×16 (per dev spec section 6 / 13.8)

export type ToneOption = "lifestyle" | "thriller" | "comedy";
export type NarrativeFormat =
  "slice-of-life" | "micro-thriller" | "character-comedy";
export type SceneMood = "urban" | "domestic" | "outdoor" | "abstract";
export type EpisodeLength = "15" | "30" | "60";

// Episode duration = scene count × Kling clip length, and Kling only
// generates 5s or 10s clips — so "how long is the episode" is really a
// (sceneCount, clipDuration) pair. Kept to three curated tiers instead of
// free numbers: storyboard stays manageable on mobile and generation cost
// stays predictable (10s clips cost ~2× the video credits of 5s ones).
export const EPISODE_LENGTH_CONFIG: Record<
  EpisodeLength,
  {
    sceneCount: number;
    clipDuration: "5" | "10";
    label: string;
    description: string;
  }
> = {
  "15": {
    sceneCount: 3,
    clipDuration: "5",
    label: "~15s",
    description: "3 scenes × 5s",
  },
  "30": {
    sceneCount: 6,
    clipDuration: "5",
    label: "~30s",
    description: "6 scenes × 5s",
  },
  "60": {
    sceneCount: 6,
    clipDuration: "10",
    label: "~60s",
    description: "6 scenes × 10s",
  },
};

export type BrandStatus = "draft" | "generating" | "complete";
export type VariantLabel = "A" | "B" | "C";
export type IntegrationStyle = "ambient" | "narrative-native" | "direct";

export interface Scene {
  id: string;
  order: number;
  description: string; // AI-generated
  imageUrl?: string;
  videoUrl?: string;
}

export interface BrandVariant {
  id: string;
  label: VariantLabel;
  integrationStyle: IntegrationStyle;
  videoUrl: string;
  description: string;
}

export interface BrandSession {
  id: string;
  createdAt: string;
  brandName: string;
  product: string;
  tone: ToneOption;
  audience: string;
  campaignGoal: string;
  sceneMood?: SceneMood;
  selectedFormat: NarrativeFormat | null;
  scenes: Scene[];
  variants: BrandVariant[];
  status: BrandStatus;
}

/** Data collected across wizard Steps 1–2 (Brand Input + Visual Setup). */
export interface WizardFormData {
  brandName: string;
  product: string;
  tone: ToneOption | "";
  audience: string;
  campaignGoal: string;
  sceneMood: SceneMood | "";
  selectedFormat: NarrativeFormat | "";
  episodeLength: EpisodeLength | "";
}

/** Per-scene generated-image status, keyed by scene id. Lifted to Wizard so it
 * survives navigating back/forward between steps without re-generating. */
export interface SceneImageState {
  url?: string;
  error?: string;
}
export type SceneImages = Record<string, SceneImageState>;

export const emptyWizardFormData: WizardFormData = {
  brandName: "",
  product: "",
  tone: "",
  audience: "",
  campaignGoal: "",
  sceneMood: "",
  selectedFormat: "",
  episodeLength: "",
};
