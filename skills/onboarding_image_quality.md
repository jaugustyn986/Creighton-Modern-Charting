# Skill: Crisp Onboarding UI — Well Within

## Purpose

Ensure all onboarding screens are:
- visually sharp
- professionally composed
- consistent with app UI
- production-ready (not mock-like or stitched)

This skill governs:
- image handling
- layout composition
- scaling
- cropping
- visual hierarchy

---

## Core Rule

Onboarding visuals must look like:

> **real product surfaces, not screenshots pasted into a slide**

---

## Image Quality Rules (non-negotiable)

### 1. Never upscale screenshots
- Do NOT stretch images
- Do NOT enlarge beyond original resolution
- If image is too small → request higher resolution

### 2. Use 1x or 2x native resolution only
- Prefer @2x assets (retina quality)
- Maintain pixel clarity

### 3. No compression artifacts
- Avoid re-encoding images multiple times
- Do not export through lossy pipelines

---

## Cropping Rules

### 1. Crop with intent
Each image must show:
- one concept
- one focal area

Bad:
- full screen with tiny UI elements

Good:
- tight crop around:
  - calendar grid
  - today card
  - entry modal
  - history rows

---

### 2. Avoid edge clipping
- Do not cut off UI elements awkwardly
- Keep natural padding around UI

---

### 3. Maintain aspect ratio
- Do not distort UI
- No stretching or squishing

---

## Composition Rules

### 1. One dominant visual per screen
- No multiple screenshots
- No collage layouts
- No stacked UI

---

### 2. Use real UI as hero
- UI should be the visual anchor
- Not background decoration

---

### 3. Scale UI correctly
- UI should feel:
  - readable
  - intentional
  - not zoomed out too far

Rule:
> If text in UI is unreadable, zoom in

---

## Layout Structure

Each onboarding screen:

1. Headline (top)
2. Supporting text (short)
3. One dominant UI visual

No:
- side-by-side layouts
- multiple panels
- cluttered compositions

---

## Spacing Rules

- Generous whitespace
- UI should "float" with intention
- Avoid cramped layouts

---

## Background Rules

- Use simple, neutral backgrounds
- No gradients behind UI unless already part of app
- No textures
- No visual noise

---

## What to Do If Assets Are Poor

If screenshots provided are:
- blurry
- low resolution
- poorly cropped

STOP and request:

- higher resolution screenshot
- specific screen export
- or permission to reconstruct UI using components

---

## Preferred Approach (Best Practice)

Instead of screenshots:

> Reconstruct UI using components/styles where possible

This ensures:
- perfect sharpness
- consistency with design system
- scalability

---

## When to Rebuild vs Use Screenshot

### Rebuild UI if:
- screenshot is blurry
- layout is simple (calendar, cards, list)
- components exist in codebase

### Use screenshot if:
- complex visualization
- chart rendering
- hard-to-replicate UI

---

## Anti-Patterns (Reject Immediately)

- blurry UI
- stretched screenshots
- collage of multiple screens
- tiny unreadable UI
- UI used as background texture
- mismatched spacing
- inconsistent scaling across screens

---

## Quality Check (must pass all)

Before finalizing onboarding:

- Is UI sharp at 100% zoom?
- Is there one clear focal point?
- Is the UI readable without zooming?
- Does it feel like a real app, not a slide?
- Would this pass App Store screenshot quality?

If any answer is no → fix before continuing

---

## Output Expectation

All onboarding screens must feel:

> deliberate, minimal, premium, and product-real

Not:
- generated
- stitched
- approximate
- placeholder

---

## Bottom Line

Clarity > decoration
Real UI > screenshots
Sharpness > speed
