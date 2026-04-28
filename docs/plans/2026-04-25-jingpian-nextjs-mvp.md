# Jingpian Next.js AI MVP Implementation Plan

> **For Hermes:** execute this plan directly. Use Context7-backed docs for Next.js, AI SDK, OpenRouter, Motion, and shadcn/ui decisions.

**Goal:** Rebuild Jingpian from a static landing page into a production-style Next.js app with demo/examples, a richer product workflow UI, and integrated AI generation paths for storyboard text, images, and videos.

**Architecture:** Use Next.js App Router with Tailwind CSS, shadcn/ui, and Motion for the frontend. Use AI SDK for storyboard/text generation via an OpenAI-compatible provider (prefer OpenRouter), and use server-side route handlers for image generation and async video generation via OpenRouter-compatible APIs. Keep model IDs configurable via env vars because Context7 docs confirm general OpenRouter image/video APIs but do not confirm the exact slugs for `gpt-image-2` or `Seedance 2.0`.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Motion, AI SDK, Zod, OpenRouter/OpenAI-compatible fetch, optional AI Gateway compatibility.

---

## Context7 findings to honor

- Next.js official scaffold: `npx create-next-app@latest` with App Router, Tailwind, TypeScript, and `src/` directory.
- Motion current import path: `motion/react` (and optionally `motion/react-client` for App Router optimization).
- shadcn/ui current CLI: `npx shadcn@latest init` and then add components.
- AI SDK supports `generateText`, `generateObject`, and documentation references `generateImage` for some providers.
- AI SDK supports OpenAI-compatible providers via `createOpenAICompatible` from `@ai-sdk/openai-compatible`.
- OpenRouter base URL: `https://openrouter.ai/api/v1`.
- OpenRouter image generation is documented via `openrouter:image_generation` tool on `chat/completions` or `responses`.
- OpenRouter video generation is documented via `POST /api/v1/videos` and polling `GET /api/v1/videos/{jobId}`.
- Context7 docs did **not** confirm exact model slugs for `gpt-image-2` or `Seedance 2.0`; implement env-driven model IDs and document that exact slugs may need account-specific verification via provider model discovery.

---

## Task 1: Scaffold a fresh Next.js app inside the existing repo

**Objective:** Replace the static site with a real Next.js app while preserving git history.

**Files:**
- Create: `package.json`, `next.config.*`, `src/app/*`, `public/*`, `.gitignore`, config files
- Preserve/archive conceptually: old static implementation can be discarded once copied into the new design

**Steps:**
1. Generate a fresh Next.js app in a temporary directory using the official App Router + Tailwind + TypeScript setup.
2. Copy scaffolded files into the current repo root.
3. Install required runtime dependencies for AI SDK, Motion, shadcn/ui ecosystem, Zod, icons, and utilities.
4. Verify scaffold integrity with `npm run lint` and `npm run build` if possible before custom work.

**Verification:**
- `npm install` succeeds
- `npm run lint` runs
- `npm run build` produces a baseline successful build

---

## Task 2: Initialize shadcn/ui and baseline design system

**Objective:** Set up reusable UI primitives and styling tokens for a polished product-grade interface.

**Files:**
- Create/modify: `components.json`, `src/components/ui/*`, `src/lib/utils.ts`, `src/app/globals.css`

**Steps:**
1. Initialize shadcn/ui with the current CLI.
2. Add core components likely needed: button, card, badge, input, textarea, select, tabs, accordion, skeleton, separator, dialog or sheet if useful.
3. Adapt globals and tokens to a calm premium Jingpian visual system.
4. Ensure no obvious AI-template styling patterns remain.

**Verification:**
- shadcn component files exist
- App still builds after component generation

---

## Task 3: Build the productized marketing + demo experience

**Objective:** Create a home page that combines premium marketing, deliverable proof, and concrete demos/examples.

**Files:**
- Create/modify: `src/app/page.tsx`, `src/components/sections/*`, `src/components/demo/*`

**Steps:**
1. Rebuild the landing page in Next.js with stronger demo sections.
2. Add multiple examples/demos:
   - deliverable artifact preview
   - industry scenario cards
   - before/after brief-to-storyboard example
3. Add a product workflow section and a more explicit “what you get” area.
4. Use Motion for tasteful, restrained animation.

**Verification:**
- Home page renders all sections
- Demo sections are visible and coherent in browser

---

## Task 4: Add an interactive generator workspace

**Objective:** Let users actually try the product flow, not just read about it.

**Files:**
- Create: `src/app/workspace/page.tsx`
- Create: `src/components/workspace/*`

**Steps:**
1. Add a workspace page linked from the landing page.
2. Support input fields for brief, audience, style, duration, and scenario.
3. Show generated storyboard output, image results, and video job state in one unified UI.
4. Add clear demo/fallback states when API keys are missing.

**Verification:**
- `/workspace` loads
- Inputs and result containers render correctly

---

## Task 5: Implement storyboard generation with AI SDK

**Objective:** Use AI SDK for structured storyboard generation.

**Files:**
- Create: `src/lib/ai/provider.ts`
- Create: `src/lib/ai/storyboard.ts`
- Create: `src/app/api/storyboard/route.ts`
- Create: `src/lib/ai/schemas.ts`

**Steps:**
1. Create an OpenAI-compatible provider wrapper for OpenRouter using `createOpenAICompatible`.
2. Define a Zod storyboard schema.
3. Use `generateObject` or equivalent AI SDK structured generation for storyboard output.
4. Add graceful fallback demo data when credentials are absent or calls fail.

**Verification:**
- API route returns structured storyboard JSON
- Missing-key case still returns a usable fallback or clear error state by design

---

## Task 6: Implement image generation route

**Objective:** Support storyboard frame image generation using OpenRouter’s documented image generation flow.

**Files:**
- Create: `src/lib/ai/image.ts`
- Create: `src/app/api/images/route.ts`

**Steps:**
1. Implement a server route that calls OpenRouter’s `responses` or `chat/completions` endpoint with the `openrouter:image_generation` tool.
2. Make the model ID configurable via env (`OPENROUTER_IMAGE_MODEL`).
3. Default to a documented model example if the exact requested model slug is not confirmed.
4. Normalize responses into UI-friendly image URLs/base64 payloads.

**Verification:**
- Route compiles
- Response shape is consistent
- UI can render generated or fallback images

---

## Task 7: Implement async video generation route

**Objective:** Support video generation jobs and polling state in the UI.

**Files:**
- Create: `src/lib/ai/video.ts`
- Create: `src/app/api/videos/route.ts`
- Create: `src/app/api/videos/[jobId]/route.ts`

**Steps:**
1. Implement `POST /api/videos` to submit a video generation request to OpenRouter’s documented `/api/v1/videos` flow.
2. Implement polling route(s) that proxy `GET /api/v1/videos/{jobId}`.
3. Make video model configurable via env (`OPENROUTER_VIDEO_MODEL`) so the user can target Seedance-compatible slugs if available in their account.
4. Surface pending/completed/failed states in the workspace.

**Verification:**
- Submit route returns job status and polling URL or normalized job id
- Poll route returns normalized status
- UI updates correctly across job states

---

## Task 8: Add env examples, docs, and deployment notes

**Objective:** Make the app operable and understandable.

**Files:**
- Create: `.env.example`
- Modify: `README.md`

**Steps:**
1. Document required env vars for OpenRouter and optional AI Gateway usage.
2. Explain that exact model slugs for GPT-Image-2 / Seedance 2.0 may require verification in the user’s provider account.
3. Document local dev, build, and deployment steps.

**Verification:**
- README matches the new architecture
- `.env.example` is complete enough to onboard the next step

---

## Task 9: Run local QA and browser acceptance

**Objective:** Verify that the rebuilt app works and looks professional.

**Files:**
- No new files required; use browser + terminal QA

**Steps:**
1. Start the Next.js app locally.
2. Inspect both landing page and workspace in the browser.
3. Check console for errors.
4. If UI or UX quality is weak, iterate before finalizing.

**Verification:**
- Local app runs successfully
- Browser QA passes with no blocking JS errors
- Core flows render correctly

---

## Task 10: Commit and push

**Objective:** Preserve the work and sync to GitHub.

**Steps:**
1. Make an atomic commit for the migration.
2. Push to `origin/main`.

**Verification:**
- `git status` clean after commit
- `git push origin main` succeeds
