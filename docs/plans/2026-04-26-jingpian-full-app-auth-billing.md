# Jingpian Full App Auth + Billing Implementation Plan

> **For Hermes:** Use OpenCode to execute this plan task-by-task. Verify every item with lint/build/browser/API checks before marking done.

**Goal:** Finish the Jingpian Next.js rebuild as a usable product skeleton with AI SDK-based image/storyboard flows, Seedance-compatible video submission, Better Auth authentication, and a paid subscription path.

**Current context:** The repo has already been rewritten from static landing page to a Next.js 16 App Router app with a polished landing page, `/workspace`, AI storyboard generation, image generation, and async video job polling. `npm run lint` and `npm run build` currently pass. Missing pieces are primarily auth, paid system, and stronger provider architecture alignment for image generation.

**Architecture:** Keep the current App Router + Tailwind + shadcn/ui interface. Add Better Auth with a lightweight SQLite setup for local/dev verification, expose `/api/auth/[...all]`, create auth client/server helpers, gate the workspace behind login-aware UI, and add a Stripe-backed subscription/premium model. For image generation, support a unified AI SDK-first path using Vercel AI Gateway when `AI_GATEWAY_API_KEY` is present, while preserving OpenRouter fallback for cases where the user prefers direct OpenRouter access.

**Tech stack:** Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Motion, AI SDK, `@ai-sdk/gateway`, Better Auth, `better-sqlite3`, Stripe, Zod, OpenRouter.

---

## Verified baseline before this plan

- `npm run lint` ✅
- `npm run build` ✅
- Existing landing page and workspace source files are present under `src/app` and `src/components/workspace`
- Existing AI routes are present:
  - `src/app/api/storyboard/route.ts`
  - `src/app/api/images/route.ts`
  - `src/app/api/videos/route.ts`
  - `src/app/api/videos/[jobId]/route.ts`
- Missing from the repo today:
  - Better Auth
  - billing / paid system
  - test suite
  - auth-aware workspace/project gating

---

## Task 1: Add auth + billing dependencies and local persistence

**Objective:** Install the missing product infrastructure.

**Files:**
- Modify: `package.json`
- Create: `src/lib/db.ts`
- Create: `data/` (runtime sqlite location, gitignored)
- Modify: `.gitignore`

**Steps:**
1. Add `better-auth`, `better-sqlite3`, `stripe`, `@better-auth/stripe`, and `@ai-sdk/gateway`.
2. Add a tiny SQLite helper for Better Auth local/dev persistence.
3. Ignore sqlite/runtime artifacts.
4. Reinstall lockfile cleanly.

**Verification:**
- `npm install` succeeds
- `npm run lint` still passes
- `npm run build` still passes

---

## Task 2: Implement Better Auth server and client

**Objective:** Add working email/password authentication with session access in App Router.

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/auth-client.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Create: `src/lib/session.ts` or equivalent server helper

**Steps:**
1. Configure Better Auth with sqlite, app name, secret, base URL, and email/password auth.
2. Export Next.js route handlers with `toNextJsHandler(auth)`.
3. Export a React auth client with `createAuthClient`.
4. Add server-side session lookup helper for pages/routes.

**Verification:**
- Auth route compiles
- `npm run build` passes
- manual API smoke check returns auth endpoints without runtime crash

---

## Task 3: Add auth UI and login-aware navigation

**Objective:** Make the app visibly usable as a signed-in product instead of a public-only demo.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/sign-in/page.tsx`
- Create: `src/app/sign-up/page.tsx`
- Create: `src/components/auth/*`
- Create or modify: shared site header/nav component

**Steps:**
1. Add sign-in and sign-up pages with Better Auth client calls.
2. Show login / register CTA when signed out.
3. Show account / sign-out / pricing CTA when signed in.
4. Keep homepage aesthetic premium and consistent with current design system.

**Verification:**
- `/sign-in` and `/sign-up` render
- browser flow can submit forms without JS errors
- signed-out and signed-in states render correctly

---

## Task 4: Add subscription model and Stripe integration

**Objective:** Introduce a real paid-system skeleton instead of placeholder pricing copy.

**Files:**
- Modify: `src/lib/auth.ts`
- Create: `src/lib/billing.ts`
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/api/billing/portal/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`
- Create/modify: pricing UI component/page, e.g. `src/app/pricing/page.tsx`

**Steps:**
1. Configure Better Auth Stripe plugin with a `pro` or `premium` plan.
2. Add environment-driven Stripe config (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_*`).
3. Create server route(s) to start checkout and open the billing portal.
4. Add pricing UI that makes the premium path explicit.
5. Make workspace premium actions clearly gated when no active plan exists.

**Verification:**
- checkout route validates env and returns clear response
- portal route validates signed-in user and returns clear response
- webhook route compiles and verifies signature path
- pricing page renders and wiring does not break build

---

## Task 5: Unify image generation provider path around AI SDK + Gateway/OpenRouter

**Objective:** Bring image generation closer to the requested AI SDK architecture.

**Files:**
- Modify: `src/lib/ai/provider.ts`
- Modify: `src/lib/ai/image.ts`
- Modify: `README.md`
- Modify: `.env.example`

**Steps:**
1. Add Gateway helper support using `@ai-sdk/gateway` when `AI_GATEWAY_API_KEY` is present.
2. Prefer AI SDK image generation for the image route in Gateway mode.
3. Preserve direct OpenRouter fallback for accounts that want OpenRouter-only usage.
4. Normalize return shape so the workspace UI does not need provider-specific branches.

**Verification:**
- image route builds in both no-key and configured-key modes
- provider labels are accurate (`gateway`, `openrouter`, or `demo-fallback`)
- UI still renders generated/demo images

---

## Task 6: Gate workspace actions by auth/subscription state

**Objective:** Turn the workspace from open demo shell into a product-ready flow.

**Files:**
- Modify: `src/app/workspace/page.tsx`
- Modify: `src/components/workspace/workspace-shell.tsx`
- Create optional: `src/components/workspace/premium-gate.tsx`

**Steps:**
1. Read session on the server for the workspace page.
2. If signed out, show login-required state or redirect path.
3. Keep storyboard/demo accessible if desired, but gate premium actions such as image/video generation or export/paid actions based on plan.
4. Ensure messaging clearly explains what is free/demo vs premium/live.

**Verification:**
- signed-out visit to `/workspace` shows the intended auth gate behavior
- signed-in state renders workspace normally
- premium gate messaging renders without breaking the flow

---

## Task 7: Add a lightweight verification suite

**Objective:** Ensure each major item can be validated repeatedly.

**Files:**
- Create: `vitest.config.ts` or equivalent
- Create: tests under `src/lib/ai/*.test.ts`, `src/app/api/**/*.test.ts`, or similar
- Modify: `package.json`

**Steps:**
1. Add a small test runner (Vitest preferred for speed in Next.js TS repos).
2. Add tests for provider helpers, auth config/env guards, checkout route env validation, and demo fallback behavior.
3. Keep tests pragmatic; avoid overbuilding.

**Verification:**
- `npm test` or equivalent passes
- tests cover at least auth config, billing route validation, and AI fallback/provider selection

---

## Task 8: Update docs and env examples

**Objective:** Make the project operable for the next implementation/deployment step.

**Files:**
- Modify: `README.md`
- Create/modify: `.env.example`

**Steps:**
1. Document Better Auth setup and required secrets.
2. Document Stripe setup and webhook requirements.
3. Document AI Gateway vs OpenRouter choices for image generation.
4. Document which workspace capabilities are gated by auth and billing.

**Verification:**
- README matches actual architecture
- `.env.example` includes all required keys and placeholders

---

## Task 9: Browser QA + route smoke tests

**Objective:** Verify the product works in practice.

**Steps:**
1. Start `npm run dev`.
2. Browser-check `/`, `/sign-in`, `/sign-up`, `/pricing`, `/workspace`.
3. Check browser console for JS/runtime errors.
4. Smoke test API routes for storyboard/images/videos/checkout.
5. If a page is visually weak or broken, fix before commit.

**Verification:**
- no blocking browser console errors
- all routes load
- auth pages submit/render correctly
- protected/premium states are coherent

---

## Task 10: Pre-commit verification, commit, and push

**Objective:** Ship a validated milestone.

**Steps:**
1. Run lint, tests, and build.
2. Review diff for secrets and logic mistakes.
3. Commit atomically.
4. Push to `origin/main`.

**Verification:**
- `npm run lint` ✅
- `npm test` ✅
- `npm run build` ✅
- `git push origin main` succeeds
