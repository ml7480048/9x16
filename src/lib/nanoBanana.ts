// Nano Banana (Gemini image generation API) wrapper — 9×16
// Used for: scene image generation (Storyboard, Step 3).
//
// Chosen over Kling AI for images because Gemini's free tier requires no card and no
// minimum prepay (Kling's image API needs a ~$9.80 minimum top-up). See project notes
// for the full provider comparison (images: Nano Banana, video: Runway — Kling dropped).
//
// MOCK MODE: if GEMINI_API_KEY is missing or still the placeholder value, generateSceneImage
// returns a branded placeholder image (inline SVG data URI) instead of calling the real API.

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

function isMockMode(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !key || key === "your_key_here" || key === "test";
}

/** Branded 720x1280 placeholder — dark surface, camera-frame icon, no external dependency. */
function mockImageUrl(seed: string): string {
  const label = seed.replace(/[<>&]/g, "").slice(0, 44);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    <rect width="720" height="1280" fill="#1A1A1A"/>
    <rect x="1" y="1" width="718" height="1278" fill="none" stroke="#2A2A2A" stroke-width="2"/>
    <g transform="translate(360 600)" stroke="#FF3C00" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-70" y="-45" width="140" height="90" rx="6"/>
      <circle cx="0" cy="0" r="28"/>
      <rect x="35" y="-70" width="35" height="25" rx="4"/>
    </g>
    <text x="360" y="700" font-family="sans-serif" font-size="24" fill="#888888" text-anchor="middle">AI image placeholder</text>
    <text x="360" y="734" font-family="sans-serif" font-size="16" fill="#555555" text-anchor="middle">${label}</text>
  </svg>`;

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

/** Step 3 — generates a single cinematic still for a scene description. */
export async function generateSceneImage(description: string): Promise<string> {
  if (isMockMode()) {
    return mockImageUrl(description);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `Cinematic, dark, premium film-still aesthetic, vertical 9:16 composition. ${description}`;

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey!,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody.slice(0, 500)}`);
  }

  const data = (await response.json()) as {
    candidates?: {
      content?: {
        parts?: { inlineData?: { mimeType?: string; data?: string } }[];
      };
    }[];
  };

  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData?.data
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("Unexpected Gemini API response shape — no image data found.");
  }

  const mimeType = imagePart.inlineData.mimeType ?? "image/png";
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}
