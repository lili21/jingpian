# Jingpian Design Language

This document defines the visual and content rules for Jingpian so future features keep the same product feel.

## Design Intent

Jingpian should feel like a cinematic production console, not a generic SaaS dashboard:

- Premium, focused, technical, and deliberate
- Dark-first visual atmosphere
- Strong hierarchy for creative workflow steps
- Clear actions with minimal cognitive noise

## Core Visual System

### 1) Atmosphere

Use this page background structure for all major product pages:

- Base: `bg-zinc-950`
- Subtle grid overlay
- Ambient glows:
  - amber glow from top-left
  - cyan glow from lower-right

Recommended layering pattern:

1. Main container: `relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100`
2. Overlay grid: absolute, pointer-events-none
3. Glow layers: 2 blurred radial circles
4. Content wrapper: `relative z-10`

### 2) Surface Panels

Use glassy dark panels consistently:

- Panel background: `bg-zinc-900/72` (or `bg-zinc-900/70`)
- Border: `border border-white/12`
- Radius: `rounded-[24px]` to `rounded-[28px]`
- Shadow: `shadow-[0_18px_70px_rgba(0,0,0,0.42)]`

Never switch back to bright white cards unless a specific content block requires a neutral media surface.

### 3) Color Roles

- Primary action color: amber (`bg-amber-400`, hover `bg-amber-300`)
- Secondary action: dark button with border (`bg-zinc-900 border-white/16`)
- Text:
  - primary: `text-zinc-100`
  - secondary: `text-zinc-300`
  - tertiary/meta: `text-zinc-400`

Avoid purple gradients and pastel SaaS accents.

## Typography Rules

Current homepage pairing (preferred):

- Display: `Noto Serif SC`
- Body/UI: `Noto Sans SC`

Guidelines:

- Headline tracking: tighter (`tracking-[-0.03em]` to `[-0.045em]`)
- UI labels and metadata may use mono for technical flavor
- Keep heading lines short and high-impact

## Content Voice

### Tone

- Clear, confident, product-led
- Professional creative operations language
- Avoid fluffy AI buzzwords

### Language policy

- Primary UI and CTA language: English
- Keep microcopy concise
- Do not use long slogans

Approved short hero direction:

- `Storyboard. Then Shoot.`

## CTA Rules

Use **Title Case** for English CTAs across the app.

Examples:

- `Start Free`
- `Generate Storyboard`
- `Enter Workspace`
- `View Pricing`
- `Sign In`
- `Create Account`
- `Manage Subscription`

Avoid mixing sentence case and title case in the same page.

## Motion Rules

- Use short fade/slide entrance animations (`y` 8–18px)
- Keep animation timing subtle (`~0.22s` to `0.45s`)
- Prioritize structural transitions over decorative micro-animations
- Avoid excessive bouncing or playful motion styles

## Component Patterns

### Navigation

- Floating/sticky nav with glass treatment
- Minimal links, high contrast on hover

### Forms

- Inputs on dark surfaces (`bg-zinc-950/70`)
- Soft borders (`border-white/15`)
- Strong focus visibility

### Status and Progress

- Use chips/badges for workflow stage and mode
- Keep status blocks grouped in dark bordered rows

## Page Consistency Checklist

For any new page/feature, verify:

1. Uses cinematic dark background system
2. Uses panel tokens (border, radius, shadow) from this guide
3. Primary actions are amber and in Title Case
4. Copy is concise and English-first
5. Typography hierarchy matches existing pages
6. No bright/light legacy panel style leaks into new sections

## Anti-Patterns (Do Not Use)

- White default cards as main page shell
- Generic purple-on-white startup gradients
- Mixed CTA casing styles
- Verbose hero slogans
- Inconsistent language switching within primary UI actions

## Implementation Notes

- Reference implementations:
  - `src/app/page.tsx`
  - `src/app/pricing/page.tsx`
  - `src/app/sign-in/page.tsx`
  - `src/app/sign-up/page.tsx`
  - `src/components/workspace/workspace-shell.tsx`

If design decisions conflict, follow this document over ad-hoc styling.
