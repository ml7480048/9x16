# 9×16 — AI-Powered Content Testing Platform
## Developer Spec · v1.0

---

## 1. Project Overview

**Company (updated 2026-07-02, per Marian):** 9×16 is first and foremost a **video production studio** — its core business is producing branded advertising series (vertical serials) for social media. That has always been the founding goal.

**This product:** the AI content testing platform is 9×16's companion product / "фішка" — a super add-on to the studio, not the main business. Strategically it is a sales funnel: a brand tests an AI-generated prototype cheaply → compares brand-integration variants → orders the real production from the studio. The `/player` (Verticals) showcase of actually-produced series and the company-level site positioning carry equal weight with the wizard.

**Domain:** 9x16.at
**Market:** DACH (Germany, Austria, Switzerland)
**Stack Target:** React frontend + Node/Express backend (or Next.js fullstack)
**Design Language:** Dark premium, accent color `#FF3C00` (orange)

The platform lets brands test AI-generated narrative video prototypes before committing to full production. Core loop: brand inputs → AI generates episode prototype → client compares brand integration variants → selects preferred version for production (by the studio).

---

## 2. Design System

**A24-minimalist (2026-07 redesign)** — replaced the earlier "dark premium" card-heavy look, which had drifted into generic-SaaS territory (bordered card grids, numbered circle badges, filled/outline button pairs, gradient glows). New rules, applied sitewide:

| Token | Value |
|---|---|
| Primary accent | `#FF3C00` — used sparingly, max one accent moment per screen (a CTA, an active state, one highlighted word) |
| Background | `#0A0A0A` (pure, no radial gradients behind headlines) |
| Surface | `#111111` |
| Surface elevated | `#1A1A1A` |
| Border | `#2A2A2A` |
| Text primary | `#FFFFFF` |
| Text secondary | `#888888` |
| Font display | Bebas Neue (`--font-bebas-neue`) — headlines only, tight leading (`leading-[0.95]`), no letter-spacing, no bold (single weight) |
| Font body | DM Sans (`--font-dm-sans`) |
| Corner radius | `0px` everywhere — cards, buttons, inputs, video frames, nav. No exceptions. |
| Shadows / glows / gradients | None, anywhere |
| Motion | Subtle fade only (`.animate-fade-in`); no bouncy/playful animations |

**Buttons:** no more filled/outline pairs — every button/link-styled-as-button is a plain text link with a trailing arrow (`→`), see `Button.tsx` / `buttonVariants()`. `variant="accent"` (text-accent) is reserved for the single primary action per screen; everything else is `variant="default"` (text-primary, hover:text-accent). Directional exception: the wizard's Back button uses a manual `←` instead of the component's built-in `→`.

**Nav:** thin, transparent, floating — no background fill, no border (`Header.tsx`). The `/platform` sidebar (`Sidebar.tsx`) is plain text links, no pill background; active state is accent-colored text only.

**Step indicators:** no numbered circles — plain `01 / 02 / 03` typographic labels (`StepIndicator.tsx`, `/platform` how-it-works, `ProblemSection.tsx`). Active step/current item is the one accent moment in that list.

**Empty space:** target 70–80% empty space per screen. Card grids that don't carry real content (icon rows, badge pills, decorative boxes) were cut — e.g. the homepage's A/B/C frame graphic and the `/player` series-concepts pill grid were both replaced with plain typographic/text-list treatments.

**Logo:** wordmark only now ("9×16" in Bebas Neue) — no icon mark in the header. Original two-hands-camera-frame SVG concept never got built; not currently planned.

UI reference: A24 film studio site — stark, text-forward, huge negative space. Not Vercel-SaaS, not startup-purple.

**Follow-up A24 pass, page by page (2026-07-01, same day, 5 separate briefs):**
- **Homepage** (`Hero.tsx`, `ProblemSection.tsx`, new `ProcessSection.tsx`): video-first centered hero (empty 9:16 placeholder frame — no real brand clip exists yet, swap in when one does), single-line headline, no subheadline. Problem section is a plain one-line-per-point stack, no borders. Brought back a "From prototype to production" process section (previously cut as a duplicate of `/platform`'s own steps) with scroll-triggered per-item fade-in via `IntersectionObserver`, plain opacity transition only. `PlatformTeaser.tsx` / `PlayerTeaser.tsx` are no longer used on the homepage (dead code, not deleted — see cleanup note below).
- **`/platform`**: nav restructured — `Header.tsx` gained an optional `subNav` prop (small text row under the logo), so `Sidebar.tsx` (New Session/Sessions/Settings) no longer renders as its own full-width bar; `platform/layout.tsx` passes `<Header subNav={<Sidebar />} />` instead of a side-by-side layout. Headline broken to two lines, no competing paragraph underneath. Reserved space for a muted (~15% opacity) video loop behind the headline — no asset yet, same as the homepage hero.
- **`/demo`**: built out for real (was a placeholder line) — live `VerticalPlayer` + `VariantSwitcher` using public sample clips (`DEMO_CLIPS` in `demo/page.tsx`) since there's no persisted real Kling output to show on a public no-auth page. Variant explanation text is pulled directly from `VARIANT_DEFINITIONS` in `kling.ts` so it can't drift from what the real A/B/C prompts actually do. `VariantSwitcher.tsx` restyled globally (affects the real wizard Step 5 too): plain text tabs, thin accent underline on the active one, no pill background.
- **Wizard (`/platform/new`)**: `StepIndicator.tsx` rebuilt as a single thin progress line + current step name below (no more per-step circles OR the interim 01/02/03 row) — dropped the "click a done step to jump back" behavior since there's no per-step target anymore; Back/Next are the only navigation now. `Input.tsx`/`Textarea.tsx` are underline-only globally (transparent background, bottom border only) — affects every form in the app (`BrandInputForm`, `LeadGateForm`, inline edits in `StoryboardGrid`/`ScriptViewer`), not just the wizard. Tone changed from a `<Select>` dropdown to 3 plain text options (`BrandInputForm.tsx`) — `Select.tsx` is now unused (dead code, not deleted). Field labels are small-caps `#888888` above each input; spacing between fields is `gap-12` (48px).
- **`/platform/sessions`, `/platform/settings`**: no real session-listing or settings backend exists yet (Day 13 roadmap work), so both stay honest empty/coming-soon states — restyled to match (plain text, accent CTA link, small-caps section label) rather than fabricating fake functional UI. The intended list-row pattern for real sessions (brand name left, format+date right in `#888888`, 1px divider, plain accent-text status badge — no cards, no pills) is documented as a comment in `sessions/page.tsx` for whoever builds Day 13.
- **Cleanup owed:** `CompanyIntro.tsx`/`SolutionSection.tsx` (already `git rm`'d earlier), and now also `PlatformTeaser.tsx`, `PlayerTeaser.tsx`, `Select.tsx` are dead code — this sandbox can't delete files, include them in the next `git rm` batch.
- **Real hero video (2026-07-01):** Marian provided a real brand master clip (`1618_EB_Jobs-der-Zukunft_15A_9x16_251001_de_Master.mov`, 358MB ProRes, dropped in the workspace folder outside the git repo). Converted via `ffmpeg` to `916/public/hero-preview.mp4` — 720×1280 H.264, no audio track, ~5.1MB, `faststart` for web streaming. Wired into `Hero.tsx` (homepage, full opacity, muted/autoplay/loop) and `platform/page.tsx` (headline background, `opacity-[0.15]`, `aria-hidden`). Re-run the same ffmpeg command for any future replacement clip: `ffmpeg -i <source>.mov -vf "scale=720:1280" -an -c:v libx264 -profile:v main -pix_fmt yuv420p -preset medium -crf 23 -movflags +faststart public/hero-preview.mp4`.
- **`/platform/sessions`, `/platform/settings` follow-up:** restyled to honest empty/coming-soon states (no fake functional UI) — same session covers `/player`, `/contacts`, `/team`. `/player` now shows the 3 real narrative formats (Slice of Life / Micro-Thriller / Character Comedy, from `VisualSetupForm.tsx`'s format list) as empty placeholder tiles in a 3-column grid, title revealed on hover/focus only — swap in real stills/clips per format once produced content exists. `/contacts` stripped to just headline + accent email link + city, nothing else. `/team` stays "coming soon" — no real roster exists yet, deliberately not inventing names; the intended list-row pattern (name left, role in `#888888` right, no photo cards without real photos) is commented in `team/page.tsx` for later.

---

## 3. Core Architecture — Three AI Agents

### Agent 1: Prototype Agent
- Takes brand input data and generates an AI episode prototype
- Output: 30–60 second stylized episode (AI-generated visuals + script)
- Pipeline: brand form → script generation (Claude API) → image generation (Kling AI) → image-to-video (Kling AI)

### Agent 2: Matching Agent
- Recommends the best narrative format for the brand
- Input: brand profile (product category, tone, audience, campaign goal)
- Output: ranked recommendation — Slice of Life / Micro-Thriller / Character Comedy
- Implementation: Claude API call with structured JSON output

### Agent 3: Performance Agent
- Post-publication analytics layer (Phase 2 / future)
- Ingests platform metrics and recommends content adjustments
- Not in MVP scope

---

## 4. MVP Scope

### 4.1 Prototype Agent Flow (5 Steps)

```
Step 1 — Brand Input
  Fields: Brand name, product/service, tone (dropdown),
          target audience, campaign goal, visual references (optional upload)

Step 2 — Visual Setup
  Select: Color palette, scene mood (urban/domestic/outdoor/abstract)
  Select: Episode length (~15s / ~30s / ~60s) — added 2026-07-02; maps to a
          (sceneCount × clipDuration) pair since Kling only does 5s/10s clips:
          15s = 3×5s, 30s = 6×5s, 60s = 6×10s (10s clips ≈ 2× video credits).
          Config: EPISODE_LENGTH_CONFIG in types.ts. sceneCount feeds the
          Claude scene prompt, clipDuration feeds Kling image2video.
  Select: Narrative format (Slice of Life / Thriller / Comedy)

Step 3 — Image Generation
  Claude API → scene descriptions (JSON array, 4–6 scenes)
  Each scene → image generation API call
  Display: storyboard grid with loading states

Step 4 — Script Generation
  Claude API → episode script with brand integration
  Display: formatted script with scene breakdowns

Step 5 — Video Preview
  Kling AI (image-to-video): POST → poll → retrieve URL
  Display: vertical 9:16 video player (720×1280)
  Show: 3 brand integration variants (Brand Prototype feature)
```

### 4.2 Brand Prototype Feature (Key Differentiator)
- Same story / same scenes — 3 variants of brand integration
- Variant A: Subtle / ambient (product visible in background)
- Variant B: Narrative-native (product drives a story moment)
- Variant C: Direct / explicit (product featured in dialogue/action)
- UI: Tab or swipe switcher between variants, video reloads on switch
- This is the core sales tool — must feel premium and instant
- **v3 generation flow (2026-07-02, third iteration):** each variant gets
  its OWN start image — integration style is baked into the IMAGE prompt
  (`imageModifier` in `VARIANT_DEFINITIONS`), then image2video animates it
  with a matching motion prompt. v1 (abstract wording) and v2 (concrete
  camera instructions) both produced near-identical clips because all three
  animated the same start frame. Client-orchestrated in `PrototypeViewer`
  (phase 1: 3 images in parallel; phase 2: 3 videos in parallel) — a serial
  image+video chain server-side would exceed Vercel's 300s cap. The old
  `/api/generate-variants` route and `generateBrandVariants()` are removed;
  `/api/generate-video` returns `taskId` on poll timeout for "Check again".

### 4.3 Pages / Routes

**Homepage redesign (2026-07-01):** `CompanyIntro.tsx` and `Hero.tsx` used to duplicate the same "test before you shoot" pitch under two separate `<h1>`s — merged into one `Hero.tsx` (`CompanyIntro.tsx` is now dead code, remove via `git rm` next session). `SolutionSection.tsx`'s 5-step breakdown duplicated the how-it-works content that now lives on `/platform` — replaced with a condensed `PlatformTeaser.tsx` (same pattern as the existing `PlayerTeaser.tsx`, both link out to the full explanation rather than repeating it). Hero now has a visual: three tilted 9:16 frames labeled A/B/C, a literal reference to the real Brand Prototype variant feature rather than generic decoration. Stale nav wording fixed on the homepage (`Platform`→`AI Prototype`, `Player`→`Verticals` in copy) — note `/player/page.tsx` itself still says "Player" as a badge, not yet touched (out of scope, that page's content is still a placeholder pending its own pass).

**Site restructure (2026-07-01):** `/` is now the company-level homepage for 9×16 as a whole studio (not just the Platform pitch). Top nav is 4 tabs: Platform / Player / Contacts / Team — same brand, same codebase. `/` = CompanyIntro + the existing Platform pitch (Hero/Problem/Solution, unchanged) + a Player teaser. Scaffolded so far: `/player` and `/team` are "coming soon" stubs (Player also lists the 9 series concepts as a teaser), `/contacts` is a real static page (email + Vienna, Austria). Content for Player/Team to be filled in later — no finished series or team bios exist yet.

| Route | Description |
|---|---|
| `/` | Company homepage — CompanyIntro + Platform pitch (Hero/Problem/Solution) + Player teaser |
| `/demo` | Public-facing interactive demo (no auth) — still exists, not in main nav for now |
| `/platform` | Public explainer page (what AI Prototype is, 3-step how-it-works) + CTA into `/platform/new` |
| `/platform/new` | Lead-gated (see below) 5-step wizard |
| `/platform/sessions` | Session history |
| `/platform/session/:id` | Session detail + Brand Prototype viewer |
| `/platform/leads` | Admin-only (Basic Auth) — table of captured leads |
| `/player` | Vertical player for produced series — "coming soon" stub + series-concept teaser list |
| `/contacts` | Static contacts page — hello@9x16.at, Vienna, Austria |

**Lead capture gate (2026-07-01):** `/platform/new` used to be wide open — anyone could land on it and burn real Kling/Anthropic credits anonymously, and there was no way to build a client list. Added a soft gate, not full auth: `LeadGateForm.tsx` collects name/email/brand (no password), POSTs to `/api/leads`, which validates, saves to a `leads` table via `src/lib/db.ts` (`@vercel/postgres`, connection string from `POSTGRES_URL` — provisioned via a Vercel Marketplace Postgres integration, e.g. Neon), and sets an httpOnly cookie (`9x16_lead`) good for a year. `/platform/new/page.tsx` is now a Server Component that checks that cookie via `cookies()` and renders either `LeadGateForm` or `Wizard`. `/platform/leads` shows the captured list, protected by `src/middleware.ts` via HTTP Basic Auth (`ADMIN_USER`/`ADMIN_PASSWORD` env vars) — a stopgap, not a real admin login system. Explicitly deferred: real accounts with passwords/login (mentioned as a possible later upgrade, not started).
| `/team` | Team page — "coming soon" stub |

---

## 5. API Integrations

### Anthropic (Claude API)
- **Live as of 2026-07-01** — real `ANTHROPIC_API_KEY` added, mock mode no longer active. Scene descriptions and script text are now real Claude output, no more "[Mock]" prefix.
- Model: `claude-sonnet-5` (updated 2026-07-01 — `claude-sonnet-4-20250514` was retired from the first-party API; current model also gets introductory pricing $2/$10 per MTok in/out through 2026-08-31, then $3/$15 standard)
- Used for: script generation, scene descriptions, format matching
- Output format: structured JSON (prompt must specify — no markdown fences)
- Auth: API key via env var `ANTHROPIC_API_KEY`
- **Fixed during Day 10 flow test:** script generation was hitting `max_tokens` (1500) and returning truncated/unparseable JSON when Claude wrote full screenplay-style prose. Tightened the prompt to require concise 1-3 sentence prose per scene (no scene headings/slugines) and raised the budget to 2500. Also added a clear error when a response is cut off (`stop_reason === "max_tokens"`) instead of a cryptic JSON parse failure.

```javascript
// Example call structure
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-5",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }]
  })
});
```

### Kling AI (Image + Video Generation) — back to a single provider
- **History (2026-07-01):** briefly split into Nano Banana (images, blocked on free tier) + Runway (video, unused). Switched back to **Kling for both** once the real pricing turned out much cheaper than initial research suggested: Image API Trial Package **$2.45** for 1000 units, Video API Trial Package **$9.80** for 100 units (both 30-day validity) — see kling.ai/dev/pricing. Total ~$12.25 to unlock real generation for both, vs. the ~$4,200 figure found earlier (that was for a much larger production package, not the trial tier). Marian purchased both trial packages.
- Base URL: `https://api-singapore.klingai.com` (recommended endpoint for non-China accounts; older `api.klingai.com` still referenced in some docs)
- **Auth (corrected):** the kling.ai/dev platform issues a single static API key (`api-key-kling-...`), used directly as `Authorization: Bearer <key>` — simpler than the Access+Secret JWT scheme an older third-party SDK suggested (that SDK likely targets a different/older Kling developer platform). Env var: `KLING_API_KEY`.
- Image generation: `POST /v1/images/generations` — body `{ model_name: "kling-v1", prompt, n: 1, aspect_ratio: "9:16" }`, async — poll `GET /v1/images/generations/{task_id}` until `task_status: "succeed"`, image URL at `data.task_result.images[0].url`
- Image-to-video: `POST /v1/videos/image2video` — body `{ model_name: "kling-v1-6", image: <url>, prompt, mode: "std", duration: "5", aspect_ratio: "9:16" }`, async — poll `GET /v1/videos/image2video/{task_id}`, video URL at `data.task_result.videos[0].url`
- Wrapper: `src/lib/kling.ts` (single file, both functions), routes: `src/app/api/generate-image/route.ts`, `src/app/api/generate-video/route.ts`
- **Brand Prototype variants (Day 11 evening, 2026-07-01):** `generateBrandVariants(imageUrl, description)` in `kling.ts` runs all 3 variants (A-Ambient, B-Narrative-Native, C-Direct) in parallel via `Promise.allSettled` — one variant's timeout/failure doesn't wipe out the other two. New route: `src/app/api/generate-variants/route.ts`. **Scoped to a single hero scene, not every scene** — explicit decision to bound Kling video-credit spend per test (3 video generations per test instead of 12-18 if every scene got 3 variants). `VARIANT_DEFINITIONS` (label/integrationStyle/prompt modifier) is exported from `kling.ts` and shared with the existing single-variant `/api/generate-video` route so retrying one variant uses identical prompt wording.
- **Confidence note:** cross-checked against a well-tested third-party SDK (github.com/aself101/kling-api, 534 tests) since Kling's own reference docs are JS-rendered and couldn't be fetched directly — not verified against official docs the way Anthropic/Runway were. If real calls fail with an "unexpected shape" error, check field names first.
- **Poll timeout raised to 270s + "Check again" recovery (2026-07-01):** a real test showed 6 video tasks marked as "timed out" (old 120s limit) had actually all `succeed`-ed on Kling's side within 145-218s — confirmed via `GET /v1/videos/image2video?pageNum=1&pageSize=30` (lists recent tasks without needing a task_id, useful for manual recovery too). Raised `POLL_TIMEOUT_MS` to 270s (Vercel Hobby/Pro both cap Fluid Compute functions at 300s by default, so `generate-video`/`generate-variants` routes set `export const maxDuration = 290`). Added `KlingTimeoutError` (carries `taskId`) and `checkVideoTaskStatus(taskId)` (one-shot status check, no new task/credit spent) + route `src/app/api/check-video-status/route.ts`, wired into a "Check again" button in `PrototypeViewer.tsx` for any variant whose failure was our own timeout rather than a real Kling failure.
- `src/lib/nanoBanana.ts` and `src/lib/runway.ts` are now deprecated empty stubs (kept for history, nothing imports them).
- **Prompt rewrite for variant differentiation (2026-07-01):** a real test showed all 3 variants looking nearly identical — original modifiers ("keep subtle", "drives the action") were too abstract for a 5s clip and were appended AFTER the scene description, likely diluted. Rewritten as concrete camera/action instructions (background blur / hand reaches for product / close-up push-in) and moved to the FRONT of the prompt in both `generateBrandVariants` and `/api/generate-video`.
- **Explicit "Money Shot" scene selection (2026-07-01):** Step 5 variants previously defaulted to "whichever storyboard scene's image finished generating first" — arbitrary, unrelated to which scene actually sells the product. Added `heroSceneId` state to `Wizard.tsx` (persisted like `scenes`/`images`): defaults to the first successfully-generated scene, but `StoryboardGrid.tsx` now shows a "Set as Money Shot" button on every scene card so the client can explicitly override it (highlighted with `!border-accent` + a "★ Money Shot" badge). `PrototypeViewer.tsx` uses the explicit choice if set and valid, falls back to the old default otherwise (with a visible note when falling back). Step 5 relabeled "Money Shot" in `StepIndicator.tsx` (was "Preview").
- **Future feature (not started, flagged 2026-07-01):** Marian wants a "final video" step after Money Shot variant selection — once the client picks A/B/C, generate video for the REMAINING scenes in that same chosen style and stitch everything into one continuous 30-60s episode. Cost-bounded because the style is already decided (N scene generations, not N×3). Requires video concatenation (ffmpeg or a cloud stitching service) which doesn't exist in the project yet, plus likely a background job (Vercel's ~300s function cap won't cover generating+stitching many scenes serially). Candidate for Week 4 or later, not MVP.

---

## 6. Data Models

### BrandSession
```typescript
{
  id: string
  createdAt: Date
  brandName: string
  product: string
  tone: "lifestyle" | "thriller" | "comedy"
  audience: string
  campaignGoal: string
  selectedFormat: "slice-of-life" | "micro-thriller" | "character-comedy"
  scenes: Scene[]
  script: Script
  variants: BrandVariant[]
  status: "draft" | "generating" | "complete"
}
```

### Scene
```typescript
{
  id: string
  order: number
  description: string  // AI-generated
  imageUrl: string     // Generated image
  videoUrl?: string    // Generated video clip
}
```

### BrandVariant
```typescript
{
  id: string
  label: "A" | "B" | "C"
  integrationStyle: "ambient" | "narrative-native" | "direct"
  videoUrl: string
  description: string
}
```

---

## 7. Component Structure (React)

```
/src
  /components
    /ui
      Button.tsx       — sharp corners, #FF3C00 primary variant
      Card.tsx         — dark surface, subtle border
      Input.tsx        — dark theme inputs
      Loader.tsx       — custom branded loading state
    /player
      VerticalPlayer.tsx    — 9:16 video player component
      VariantSwitcher.tsx   — A/B/C brand prototype tabs
    /wizard
      StepIndicator.tsx
      BrandInputForm.tsx    — Step 1
      VisualSetupForm.tsx   — Step 2
      StoryboardGrid.tsx    — Step 3 (image generation)
      ScriptViewer.tsx      — Step 4
      PrototypeViewer.tsx   — Step 5 (video + variants)
    /layout
      Header.tsx
      Sidebar.tsx
  /pages (or /app for Next.js)
  /lib
    anthropic.ts       — Claude API wrapper
    kling.ts           — Kling AI wrapper (image generation + image-to-video)
  /hooks
    usePrototypeSession.ts
    useVariantSwitcher.ts
```

---

## 8. Content Formats Reference

| Format | Description | Target Brands |
|---|---|---|
| Slice of Life | Everyday moments, organic brand integration | Lifestyle, FMCG, Fashion |
| Micro-Thriller | Cliffhanger endings, peak emotional tension | Automotive, Tech, Finance |
| Character Comedy | Fixed character, recurring situations | Food, Beverage, Retail |

Episode structure: 30–60 seconds, 4–6 scenes, single narrative arc.

---

## 9. Non-MVP / Phase 2

- Performance Agent (analytics ingestion + recommendations)
- Subscription tier (€200–1,000/month)
- Multi-user accounts / team collaboration
- Export to TikTok / Reels / YouTube Shorts format packages
- API access for media agencies

---

## 10. Environment Variables

```env
ANTHROPIC_API_KEY=      # live
KLING_API_KEY=          # live — single key from kling.ai/dev, both image + video trial packages purchased
NEXT_PUBLIC_APP_URL=https://9x16.at
POSTGRES_URL=           # from Vercel Marketplace Postgres integration (e.g. Neon) — powers lead capture
ADMIN_USER=             # Basic Auth for /platform/leads
ADMIN_PASSWORD=         # Basic Auth for /platform/leads — change from the .env.local placeholder before real use
BLOB_READ_WRITE_TOKEN=  # injected by Vercel when a Blob store is connected (Storage → Blob) — permanent media storage; without it Kling's expiring URLs are used as-is
```

(`GEMINI_API_KEY`, `RUNWAY_API_KEY` — deprecated, no longer read by any code. See section 5.)

---

## 11. Key Constraints & Notes

- **Mobile-first** — primary demo use case is handing a phone to a client
- **9:16 everywhere** — all video previews must be vertical, never cropped horizontal
- **No user-generated content** — this is a B2B tool, not a consumer platform
- **Premium feel over feature density** — fewer features done exceptionally > many features done generically
- **Loading states matter** — AI generation takes time; use staged progress (script → images → video) with branded loading UX, not a spinner
- **Variant switching must be instant** — pre-load all 3 variant videos before showing the switcher

---

*9x16.at · Vienna, Austria · hello@9x16.at*
