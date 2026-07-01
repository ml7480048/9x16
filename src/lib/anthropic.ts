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
      "ANTHROPIC_API_KEY is not set — add it to .env.local (and Vercel env vars for production)."
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
      `Anthropic API error (${response.status}): ${errorBody.slice(0, 500)}`
    );
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
    stop_reason?: string;
  };

  if (data.stop_reason === "max_tokens") {
    throw new Error(
      "Claude response was cut off (hit max_tokens) before finishing — the JSON came back incomplete. Retry, or raise maxTokens for this call."
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
    throw new Error(`Failed to parse JSON from Claude response: ${cleaned.slice(0, 300)}`);
  }
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
    visualMood: ["warm morning light", "handheld, intimate", "soft window light", "golden hour", "cool blue tones"][i],
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

/** Step 3 — generates 4-6 scene descriptions for the episode prototype. */
export async function generateSceneDescriptions(
  brand: BrandInput
): Promise<SceneDraft[]> {
  if (isMockMode()) {
    return mockSceneDescriptions(brand);
  }

  const prompt = `You are the Prototype Agent for 9×16, a platform that creates AI-generated vertical (9:16) branded micro-drama episode prototypes.

Brand input:
${describeBrand(brand)}

Generate 4 to 6 scenes for a 30-60 second vertical video episode that organically features this brand. Each scene should be a single cinematic beat.

Respond with ONLY a raw JSON array (no markdown fences, no commentary), where each element has this shape:
{ "id": string, "order": number, "description": string, "visualMood": string }

"description" should be a concise visual/action description (1-2 sentences) suitable as an image generation prompt. "visualMood" should be a short phrase (e.g. "warm morning light, handheld").`;

  const raw = await callClaude(prompt, 1600);
  return parseJson<SceneDraft[]>(raw);
}

/** Step 4 — generates the episode script with brand integration, scene by scene. */
export async function generateScript(
  brand: BrandInput,
  scenes: SceneDraft[]
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

Scenes:
${sceneList}

For each scene, write "action" as a concise 1-3 sentence description of what happens and any dialogue — plain prose, NOT screenplay format (no scene headings, no ALL-CAPS character intros, no camera directions). Also write "brandIntegration": a short note on how the brand appears in that specific scene. Keep the whole response compact — this is a summary, not a full screenplay.

Respond with ONLY raw JSON (no markdown fences, no commentary) in this shape:
{ "title": string, "scenes": [{ "sceneNumber": number, "action": string, "brandIntegration": string }] }`;

  const raw = await callClaude(prompt, 2500);
  return parseJson<EpisodeScript>(raw);
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

Respond with ONLY raw JSON (no markdown fences, no commentary) in this shape:
{ "recommended": "slice-of-life" | "micro-thriller" | "character-comedy", "confidence": number (0-1), "reasoning": string }`;

  const raw = await callClaude(prompt, 500);
  return parseJson<FormatMatch>(raw);
}
