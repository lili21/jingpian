# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Project Context (Jingpian)

Use these repo-specific defaults when making decisions:

- Product scope: storyboard -> keyframes -> video workflow for commercial teams, not a generic text-to-video demo.
- Tech stack: Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui + Motion.
- Auth/Billing: Better Auth + SQLite, Stripe integration paths exist but may run in placeholder/free mode when env is missing.
- AI behavior: prefer configured live providers, but preserve existing fallback order (AI Gateway -> OpenRouter -> demo fallback).

## 6. Execution Defaults In This Repo

When implementing or fixing features:

- Follow existing route and module boundaries under `src/app/api`, `src/components`, and `src/lib`.
- Keep env-driven behavior intact; do not hardcode model names, keys, or provider-only assumptions.
- For bug fixes, reproduce via test when practical (`vitest`) and avoid broad refactors.
- Verify with the smallest relevant command first, then expand as needed:
  - `npm test`
  - `npm run lint`
  - `NODE_OPTIONS=--max-old-space-size=2048 npm run build`
- If a change affects user flows, prioritize spot-checking `/`, `/workspace`, `/sign-in`, `/sign-up`, and `/pricing`.

## 7. Non-Goals Unless Requested

- Do not redesign UI tone/branding outside the touched scope.
- Do not replace provider strategy, auth strategy, or billing architecture unless explicitly asked.
- Do not remove demo fallback paths just because live keys are available locally.
