// Anthropic (Claude API) wrapper — 9×16
// Used for: scene description generation, script generation, narrative format matching.
//
// MOCK MODE: if ANTHROPIC_API_KEY is missing or still the placeholder value, every
// function below returns realistic canned data instead of calling the real API.
// This lets the whole wizard flow be built and tested with zero cost. Once a real
// key is added to .env.local (and Vercel), these functions automatically switch to
// live Claude calls — no other code changes needed.

import type { NarrativeFormat, WizardFormData } from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
// claude-sonnet-4-20250514 was retired from the first-party API (2026-07-01 check —
// only still served via Bedrock/Google Cloud per platform.claude.com/docs). Using the
// current model, which also gets cheaper introductory pricing ($2/$10 per MTok in/out,
// vs $3/$15 standard) through 2026-08-31.
const MODEL = "claude-sonnet-5";

function isMockMode(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return !key || key === "your_key_here" || key === "test";
}

type BrandInput = Pick<
  WizardFormData,
  "brandName" | "product" | "tone" | "audience" | "campaignGoal"
>;

// Step 2 (Visual Setup) choices. Kept separate from BrandInput because
// matchFormat (Agent 2) runs BEFORE the client picks a format — it only
// gets BrandInput, while scene/script generation gets both.
type VisualInput = Pick<WizardFormData, "sceneMood" | "selectedFormat">;

// Same definitions the client sees in VisualSetupForm — spelled out for the
// prompt so the model acts on the chosen format, not its own guess at what
// the label means.
const FORMAT_GUIDANCE: Record<string, string> = {
  "slice-of-life":
    "Slice of Life — everyday moments, organic brand integration, calm observational pacing.",
  "micro-thriller":
    "Micro-Thriller — rising tension across scenes, a cliffhanger or twist in the final scene.",
  "character-comedy":
    "Character Comedy — one distinct recurring character, comedic beats in recognizable situations.",
};

export interface SceneDraft {
  id: string;
  order: number;
  description: string;
  visualMood: string;
}

export interface ScriptScene {
  sceneNumber: number;
  action: string;
  brandIntegration: string;
}

export interface EpisodeScript {
  title: string;
  scenes: ScriptScene[];
}

export interface FormatMatch {
  recommended: NarrativeFormat;
  confidence: number; // 0–1
  reasoning: string;
}

/** Low-level call to the Claude Messages API. Returns the raw text of the first content block. */
async function callClaude(prompt: string, maxTokens = 1024): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — add it to .env.local (and Vercel env vars for production).",
    );
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Anthropic API error (${response.status}): ${errorBody.slice(0, 500)}`,
    );
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
    stop_reason?: string;
  };

  if (data.stop_reason === "max_tokens") {
    throw new Error(
      "Claude response was cut off (hit max_tokens) before finishing — the JSON came back incomplete. Retry, or raise maxTokens for this call.",
    );
  }

  const text = data.content?.find((block) => block.type === "text")?.text;

  if (typeof text !== "string") {
    throw new Error("Unexpected Anthropic API response shape.");
  }

  return text;
}

/** Parses a JSON object/array out of a Claude response, tolerating stray markdown fences. */
function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `Failed to parse JSON from Claude response: ${cleaned.slice(0, 300)}`,
    );
  }
}

// parseJson only guarantees valid JSON, not the right shape — Claude
// occasionally returns structurally-off output, which used to surface as a
// cryptic crash further down the wizard. Missing ids/order/moods are
// repairable; a missing description/action is a real failure worth a clear
// error (surfaced in the step's ErrorState with a Retry).
function normalizeSceneDrafts(raw: unknown): SceneDraft[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Claude returned no scenes (unexpected response shape).");
  }
  return raw.map((item, i) => {
    const o = (item ?? {}) as Record<string, unknown>;
    if (typeof o.description !== "string" || !o.description.trim()) {
      throw new Error(
        `Scene ${i + 1} from Claude is missing its description (unexpected response shape).`,
      );
    }
    return {
      id: typeof o.id === "string" && o.id ? o.id : `scene-${i + 1}`,
      order: typeof o.order === "number" ? o.order : i + 1,
      description: o.description,
      visualMood: typeof o.visualMood === "string" ? o.visualMood : "",
    };
  });
}

function normalizeScript(raw: unknown): EpisodeScript {
  const o = (raw ?? {}) as Record<string, unknown>;
  if (!Array.isArray(o.scenes) || o.scenes.length === 0) {
    throw new Error(
      "Claude returned a script with no scenes (unexpected response shape).",
    );
  }
  return {
    title:
      typeof o.title === "string" && o.title.trim()
        ? o.title
        : "Untitled Prototype",
    scenes: o.scenes.map((item, i) => {
      const sc = (item ?? {}) as Record<string, unknown>;
      if (typeof sc.action !== "string" || !sc.action.trim()) {
        throw new Error(
          `Script scene ${i + 1} from Claude is missing its action text (unexpected response shape).`,
        );
      }
      return {
        sceneNumber:
          typeof sc.sceneNumber === "number" ? sc.sceneNumber : i + 1,
        action: sc.action,
        brandIntegration:
          typeof sc.brandIntegration === "string" ? sc.brandIntegration : "",
      };
    }),
  };
}

function describeBrand(brand: BrandInput): string {
  return [
    `Brand name: ${brand.brandName}`,
    `Product/service: ${brand.product}`,
    `Tone: ${brand.tone}`,
    `Target audience: ${brand.audience}`,
    `Campaign goal: ${brand.campaignGoal}`,
  ].join("\n");
}

function describeVisual(visual: VisualInput): string {
  const lines: string[] = [];
  if (visual.sceneMood) {
    lines.push(
      `Scene setting: ${visual.sceneMood} — every scene must take place in this kind of environment.`,
    );
  }
  if (visual.selectedFormat) {
    lines.push(
      `Narrative format: ${FORMAT_GUIDANCE[visual.selectedFormat] ?? visual.selectedFormat}`,
    );
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Mock data — used whenever isMockMode() is true. Personalized just enough
// (brand name / product) to feel real in the UI without an API call.
// ---------------------------------------------------------------------------

function mockSceneDescriptions(brand: BrandInput): SceneDraft[] {
  const templates = [
    `Wide establishing shot of a busy morning scene, ${brand.product} visible in the background as someone reaches for it naturally.`,
    `Close-up on hands using ${brand.product} — tactile, unhurried, product details in soft focus.`,
    `Mid-shot: a small moment of connection between two people, ${brand.product} sitting on the table between them.`,
    `POV shot as the protagonist pauses mid-routine, ${brand.product} catching the light.`,
    `Wide shot pulling back to reveal the full scene, ${brand.brandName} branding subtly visible in frame.`,
  ];

  return templates.map((description, i) => ({
    id: `mock-scene-${i + 1}`,
    order: i + 1,
    description,
    visualMood: [
      "warm morning light",
      "handheld, intimate",
      "soft window light",
      "golden hour",
      "cool blue tones",
    ][i],
  }));
}

function mockScript(brand: BrandInput, scenes: SceneDraft[]): EpisodeScript {
  return {
    title: `${brand.brandName} — Untitled Prototype`,
    scenes: scenes.map((scene, i) => ({
      sceneNumber: scene.order,
      action: `[Mock] Scene ${scene.order}: ${scene.description}`,
      brandIntegration:
        i === scenes.length - 1
          ? `${brand.brandName} branding is clearly visible as the scene resolves.`
          : `${brand.product} appears naturally within the action, no forced dialogue.`,
    })),
  };
}

function mockFormatMatch(brand: BrandInput): FormatMatch {
  let recommended: NarrativeFormat = "slice-of-life";
  if (brand.tone === "thriller") recommended = "micro-thriller";
  if (brand.tone === "comedy") recommended = "character-comedy";

  return {
    recommended,
    confidence: 0.82,
    reasoning: `[Mock] Based on the "${brand.tone}" tone and audience "${brand.audience}", ${recommended.replace(/-/g, " ")} is the strongest fit for ${brand.brandName}.`,
  };
}

/**
 * Step 3 — generates scene descriptions for the episode prototype.
 * `sceneCount` comes from the Step 2 episode-length choice; omitted (older
 * sessions) falls back to the original 4-6 range.
 */
export async function generateSceneDescriptions(
  brand: BrandInput,
  visual: VisualInput,
  sceneCount?: number,
): Promise<SceneDraft[]> {
  if (isMockMode()) {
    const scenes = mockSceneDescriptions(brand);
    return sceneCount ? scenes.slice(0, sceneCount) : scenes;
  }

  const countInstruction = sceneCount
    ? `exactly ${sceneCount} scenes`
    : "4 to 6 scenes";

  const prompt = `You are the Prototype Agent for 9×16, a platform that creates AI-generated vertical (9:16) branded micro-drama episode prototypes.

Brand input:
${describeBrand(brand)}
${describeVisual(visual)}

Generate ${countInstruction} for a short vertical video episode that organically features this brand. Each scene should be a single cinematic beat. Follow the scene setting and narrative format above — they are the client's explicit choices, not suggestions.

Respond with ONLY a raw JSON array (no markdown fences, no commentary), where each element has this shape:
{ "id": string, "order": number, "description": string, "visualMood": string }

"description" should be a concise visual/action description (1-2 sentences) suitable as an image generation prompt. "visualMood" should be a short phrase (e.g. "warm morning light, handheld").`;

  const raw = await callClaude(prompt, 1600);
  return normalizeSceneDrafts(parseJson<unknown>(raw));
}

/** Step 4 — generates the episode script with brand integration, scene by scene. */
export async function generateScript(
  brand: BrandInput,
  scenes: SceneDraft[],
  visual: VisualInput,
): Promise<EpisodeScript> {
  if (isMockMode()) {
    return mockScript(brand, scenes);
  }

  const sceneList = scenes
    .map((s) => `${s.order}. ${s.description}`)
    .join("\n");

  const prompt = `You are the Prototype Agent for 9×16. Write the episode script for this branded vertical micro-drama.

Brand input:
${describeBrand(brand)}
${describeVisual(visual)}

Scenes:
${sceneList}

For each scene, write "action" as a concise 1-3 sentence description of what happens and any dialogue — plain prose, NOT screenplay format (no scene headings, no ALL-CAPS character intros, no camera directions). Also write "brandIntegration": a short note on how the brand appears in that specific scene. Keep the whole response compact — this is a summary, not a full screenplay.

Respond with ONLY raw JSON (no markdown fences, no commentary) in this shape:
{ "title": string, "scenes": [{ "sceneNumber": number, "action": string, "brandIntegration": string }] }`;

  const raw = await callClaude(prompt, 2500);
  return normalizeScript(parseJson<unknown>(raw));
}

/** Agent 2 — recommends the best narrative format for a brand profile. */
export async function matchFormat(brand: BrandInput): Promise<FormatMatch> {
  if (isMockMode()) {
    return mockFormatMatch(brand);
  }

  const prompt = `You are the Matching Agent for 9×16. Recommend the best narrative format for this brand.

Brand input:
${describeBrand(brand)}

Formats to choose from:
- "slice-of-life": everyday moments, organic brand integration (Lifestyle, FMCG, Fashion)
- "micro-thriller": cliffhanger endings, peak emotional tension (Automotive, Tech, Finance)
- "character-comedy": fixed character, recurring situations (Food, Beverage, Retail)

Keep "reasoning" to 1-2 concise sentences — it renders inside a small card in the UI.

Respond with ONLY raw JSON (no markdown fences, no commentary) in this shape:
{ "recommended": "slice-of-life" | "micro-thriller" | "character-comedy", "confidence": number (0-1), "reasoning": string }`;

  const raw = await callClaude(prompt, 500);
  return parseJson<FormatMatch>(raw);
}
