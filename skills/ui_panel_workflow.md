# Skill: Reference-to-Code UI Workflow — Well Within

## Purpose

The end-to-end process for turning any reference (screenshot, mockup, or
description) into a crisp, verified, production-quality UI change anywhere
in the app.

Use this skill whenever:
- A user provides a screenshot or mockup as a reference
- Any screen, card, panel, or component needs to match a visual target
- A UI element needs to be created, refined, or brought in line with a reference

Complements `skills/onboarding_image_quality.md` (quality standards) and
`skills/ux_tone_well_within.md` (copy and tone).

---

## Core Principle

> Reconstruct in native React Native code. Never use image assets as UI proxies.

Code-rendered components are: pixel-perfect at every DPI, live with the
design system, and trivially editable. Images are none of those things.

---

## The Workflow (5 phases)

### Phase 1 — Receive and Interpret the Reference

When the user provides a screenshot, mockup, or description:

1. **Identify what's being shown**: card, banner, calendar, list row, modal, form
2. **Extract layout structure**: top-level containers → sections → rows → elements
3. **Extract data**: exact text, numbers, dates — only what the user provided, nothing fabricated
4. **Map colors to tokens**: use the color-token table below, never raw hex
5. **Note special states**: today border, selected pill, confirmed peak, mucus dot, toggle on/off

If anything is ambiguous, ask one focused question before writing code.

---

### Phase 2 — Find the Right File

Before touching anything, state the files you will change and why.

**Start here to locate the right file:**

| What you're editing | Where to look |
|---------------------|---------------|
| Onboarding slide panels | `apps/mobile/src/components/OnboardingPanels.tsx` |
| Main calendar screen | `apps/mobile/src/screens/CalendarScreen.tsx` (and subcomponents) |
| Daily entry form | `apps/mobile/src/screens/EntryScreen.tsx` or `components/EntryForm.tsx` |
| Cycle summary / history | `apps/mobile/src/screens/CycleSummaryScreen.tsx` |
| Status banner | `apps/mobile/src/components/StatusBanner.tsx` |
| Navigation / tab bar | `apps/mobile/src/navigation/AppNavigator.tsx` |
| Shared UI components | `apps/mobile/src/components/` |
| Color tokens | `apps/mobile/src/theme/colors.ts` |

If unsure, search for a string visible in the reference:
```
rg "text from screenshot" apps/mobile/src
```

---

### Phase 3 — Build

#### Color tokens (always import from `theme/colors.ts`, never use raw hex)

| Concept | Token |
|---------|-------|
| Bleeding | `BG_BLEEDING` |
| Dry | `BG_DRY` |
| Peak-type (grey) | `BG_PEAK_TYPE` |
| Confirmed peak border | `PEAK_BORDER` |
| Post-peak (yellow) | `BG_POST_PEAK` |
| Mucus dot | `FERTILE_ACCENT` |
| No-entry | `BG_NO_ENTRY` |
| Today border | `BORDER_TODAY` |
| Positive banner background | `BANNER_TONE_POSITIVE_BG` |
| Tracking banner background | `BG_CARD_GRADIENT_START` |
| Page background | `BG_PAGE` |
| Card background | `BG_CARD` |
| Primary text | `TEXT_PRIMARY` |
| Secondary text | `TEXT_SECONDARY` |
| Muted text | `TEXT_MUTED` |
| Subtle text | `TEXT_SUBTLE` |
| Card border | `BORDER_CARD` |
| Accent (buttons, pills) | `ACCENT_WARM` |
| Accent tint (selected bg) | `ACCENT_WARM_TINT` |

#### Build rules

- Match the reference's layout hierarchy exactly — don't simplify unless the
  reference is clearly aspirational
- Use `StyleSheet.create()` for all styles; no inline style objects
- Use `PhoneCard` (from `OnboardingPanels.tsx`) for card wrappers in static panels;
  use the app's existing card styles in live screens
- Preserve existing component props and behavior — only change what the reference
  requires
- For calendar cells, use the `CellData` type and `MiniCalendar` component in
  `OnboardingPanels.tsx` (for static previews); for the live calendar, update
  `CalendarGrid` or equivalent

---

### Phase 4 — Verify

Start the Expo web dev server if not running:
```
npx expo start --web --port 8082
```
(run from `apps/mobile/`)

Navigate to `http://localhost:8082` and find the screen being edited.

Verification checklist:
- [ ] Colors match the reference
- [ ] Text and data match the reference (or neutral defaults if no reference)
- [ ] Layout structure matches — nothing missing, nothing extra
- [ ] Special states (today, selected, confirmed) render correctly
- [ ] No content clipped at the bottom
- [ ] `ReadLints` passes on all edited files

**Web sizing caveat**: the browser renders at full viewport width, making
elements appear larger than on iPhone. Sizing is authoritative on-device.
Use `maxWidth` constraints to keep elements phone-sized in the web preview.

---

### Phase 5 — Iterate

For each round of feedback:

1. Identify the specific element, color, or copy to change
2. Make the minimal change — one targeted edit
3. Reload and screenshot
4. Describe the change in plain language before showing the result

Avoid changing unrelated parts of the file during an iteration round.

---

## Mock Data Policy

| Situation | What to do |
|-----------|-----------|
| User provided a reference with values | Use those exact values |
| No reference provided | Use neutral defaults: `"—"`, `"Apr 7"`, `"Cycle Day 1"` |
| Values are ambiguous | Ask before filling in |

Never invent: cycle lengths, peak days, luteal phases, observation patterns,
or user-identifying information.

Label mock data in code comments: `// illustrative — from user reference`

---

## Anti-Patterns

| Avoid | Instead |
|-------|---------|
| `require('./assets/screenshot.png')` in a UI panel | Code-rendered component |
| Raw hex like `'#D6D3CF'` | `BG_PEAK_TYPE` from `theme/colors.ts` |
| Guessing data values | Ask or use neutral defaults |
| Editing the wrong file | Search first with `rg` |
| Checking only web preview for sizing | Test on device for truth |
| Changing multiple unrelated things in one iteration | One change, one screenshot |
| Fabricating realistic user data | Use `"--"` or what the user gave you |

---

## Concrete Example (Onboarding Panels)

The onboarding slides in `OnboardingPanels.tsx` are the reference implementation
of this workflow applied to static preview panels. Each panel was built by:

1. Reading a reference screenshot from the user
2. Extracting calendar day colors, banner text, and status copy
3. Building a `buildSlide*Cells()` function with exact `CellData` entries
4. Wrapping in `PhoneCard` inside the exported panel component
5. Wiring into `OnboardingScreen.tsx` via `renderPanel`
6. Verifying in browser and iterating based on feedback

Follow the same pattern for any new static UI preview.

---

## Files Quick Reference

```
apps/mobile/src/
  components/
    OnboardingPanels.tsx    ← static onboarding panel library
    StatusBanner.tsx        ← live status banner component
    CalendarGrid.tsx        ← live calendar grid
    EntryForm.tsx           ← daily entry form component
  screens/
    OnboardingScreen.tsx    ← wires panels into onboarding slides
    CalendarScreen.tsx      ← main charting view
    EntryScreen.tsx         ← daily observation entry
    CycleSummaryScreen.tsx  ← history and pattern view
  theme/
    colors.ts               ← single source of truth for all colors
  navigation/
    AppNavigator.tsx        ← stack + tab navigation
```
