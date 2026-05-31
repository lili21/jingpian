---
version: "alpha"
name: Jingpian Cinematic Console
description: Visual identity and UI token system for Jingpian's storyboard-to-video product surfaces.
colors:
  primary: "#FACC15"
  on-primary: "#18181B"
  secondary: "#18181B"
  on-secondary: "#F4F4F5"
  tertiary: "#22D3EE"
  background: "#09090B"
  surface: "#18181BCC"
  surface-strong: "#09090BB3"
  border: "#FFFFFF1F"
  text-primary: "#F4F4F5"
  text-secondary: "#D4D4D8"
  text-muted: "#A1A1AA"
typography:
  display-xl:
    fontFamily: "Noto Serif SC"
    fontSize: "4.6rem"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.045em"
  heading-lg:
    fontFamily: "Noto Serif SC"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  body-md:
    fontFamily: "Noto Sans SC"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  body-sm:
    fontFamily: "Noto Sans SC"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.7
  label-caps:
    fontFamily: "Noto Sans SC"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.18em"
rounded:
  sm: 12px
  md: 16px
  lg: 24px
  xl: 28px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  page-shell:
    backgroundColor: "{colors.background}"
  panel-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "24px"
  panel-inset:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    padding: "20px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  input-default:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 12px"
  badge-meta:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

## Overview

Jingpian uses a cinematic control-room language: dark surfaces, precise contrast, and deliberate hierarchy. The interface should feel like a production console for commercial teams, not a generic startup dashboard.

Design goals:

- Keep attention on workflow decisions (brief -> storyboard -> keyframes -> video task).
- Make primary actions unmistakable with amber emphasis.
- Preserve a premium, focused atmosphere across all pages.

## Colors

The palette is dark-first with one dominant action color and one technical accent:

- **Primary** is amber for decisive actions.
- **Background/surface** colors are deep zinc tones for cinematic depth.
- **Tertiary** cyan is reserved for secondary technical emphasis.
- **Text** colors step down from strong readable copy to muted metadata.

Do not introduce additional bright accents unless product requirements demand it.

## Typography

Typography is split into editorial display and practical UI copy:

- **Noto Serif SC** for high-impact headlines.
- **Noto Sans SC** for body copy, controls, and labels.

Headlines should remain concise. Avoid long slogans. Preferred hero style is short and declarative (for example: "Storyboard. Then Shoot.").

## Layout

Use a layered page structure on all major routes:

1. Base dark canvas
2. Subtle grid overlay
3. Two ambient glow layers (amber top-left, cyan bottom-right)
4. Foreground content in bounded shell containers

Spacing should preserve breathing room around major panels while keeping workflow sections visually connected.

## Elevation & Depth

Depth is created through translucent dark surfaces, soft borders, and large diffuse shadows.

- Default panel treatment: `panel-default`
- Inset content treatment: `panel-inset`
- Avoid flat single-layer sections with no depth cues

Animation should be restrained: short fade/slide transitions are preferred over playful motion.

## Shapes

Jingpian uses soft geometric rounding:

- Large feature panels: `rounded.xl`
- Inputs and controls: `rounded.md`
- Utility chips and CTAs: `rounded.pill`

Avoid sharp cornered controls unless there is a specific functional reason.

## Components

Component expectations:

- **Buttons**: Primary button uses amber fill and dark text. Secondary button remains dark with clear border contrast.
- **Inputs**: Dark inset style with readable text and visible focus states.
- **Badges**: Compact metadata styling with uppercase caps treatment.
- **Panels**: Consistent border, depth, and spacing across homepage, auth, pricing, and workspace.

CTA casing standard: **Title Case**.

## Do's and Don'ts

Do:

- Reuse tokens from this file before introducing new values.
- Keep copy concise and product-operational in tone.
- Maintain visual consistency across all App Router pages.

Don't:

- Reintroduce white default dashboard cards as page-level shells.
- Use purple-heavy gradients or pastel startup styling.
- Mix CTA casing styles within a page.
- Add long hero slogans.
