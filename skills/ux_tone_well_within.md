# UX Tone Skill — Well Within

This skill defines the user experience tone and interface philosophy for Well Within.

The application must feel:

- soft
- warm
- calm
- grounded
- supportive
- intuitive
- modern but not clinical

The product is centered on:

- charting
- body awareness
- calm observation
- pattern recognition
- trust

The interface must support a reflective experience rather than a technical or analytical one.

---

# Core UX Tone Principles

## 1. Calm and Gentle

Every screen should feel grounded and reassuring.

Design should communicate:

- safety
- softness
- clarity
- steadiness

Avoid:

- harsh visual contrast
- aggressive color palettes
- dense layouts
- sharp UI tension

Preferred qualities:

- soft spacing
- rounded elements
- warm neutrals
- gentle accent colors
- breathable layouts

Users should feel relaxed while using the app.

---

## 2. Observational, Not Mechanical

This app helps users observe their body.

It should feel like:

- reflective tracking
- pattern awareness
- personal insight

It should NOT feel like:

- a data entry system
- medical records software
- productivity tracking
- analytical dashboards

UI language should emphasize:

- observations
- cycles
- patterns

Preferred wording:

- "Today's observation"
- "Cycle history"
- "Your pattern"
- "Most fertile sign today"

Avoid wording like:

- "Input data"
- "Submit record"
- "Process entry"

---

## 3. Warm, Human Language

Language must be:

- calm
- conversational
- supportive
- simple

Avoid language that feels:

- robotic
- overly clinical
- transactional
- technical

Preferred tone examples:

Good:
- "Record the most fertile sign you noticed today."
- "You can update this later if your observations change."
- "Your cycles aligned around peak day."

Avoid:

- "Submission successful"
- "Input accepted"
- "Processing data"
- "User record saved"

---

# Visual Design Direction

The app should feel mature and elegant.

Visual characteristics:

- soft neutral backgrounds
- rounded cards
- gentle hierarchy
- clear whitespace
- minimal iconography
- subtle shadows

Avoid:

- neon colors
- overly saturated palettes
- sharp black/white contrast
- heavy gradients
- overly glossy UI

The design should feel timeless rather than trendy.

---

# Layout Guidance

Layouts should feel:

- spacious
- clear
- predictable
- calming

Preferred patterns:

- card-based sections
- clear vertical hierarchy
- grouped information
- minimal visual clutter

Avoid:

- dense dashboards
- overcrowded screens
- excessive badges
- information overload

Every screen should feel easy to scan.

---

# Mobile UX Best Practices

## Prioritize Thumb Reach

Primary actions must be reachable with one hand.

Avoid placing key actions in the extreme top corners.

Preferred locations:

- bottom sheets
- bottom buttons
- center screen interactions

---

## Reduce Cognitive Load

Each screen should have **one clear purpose**.

Avoid screens that require users to interpret multiple charts, numbers, and actions simultaneously.

Use progressive disclosure:

- simple summary first
- details available on tap

---

## Maintain Navigation Simplicity

Use consistent navigation.

Primary navigation should be limited to a small number of sections.

Example structure:

Tracking  
Cycle History  
Settings

Avoid deep navigation stacks.

---

## Minimize Data Entry Friction

Charting should be fast.

Users should be able to record a day's observation in under 15 seconds.

Preferred input patterns:

- tap selections
- segmented buttons
- quick toggles

Avoid:

- long forms
- typing requirements
- multi-step flows

---

## Provide Clear System Feedback

The app should clearly show:

- how entries affect the chart
- how observations translate into cycle patterns

When users make a change, the UI should visibly update.

This reinforces trust in the system.

---

## Support Error Prevention

Prefer designs that prevent mistakes rather than requiring correction later.

Examples:

- show interpreted observation summary
- confirm key actions
- allow easy edits

Avoid:

- irreversible actions without confirmation
- unclear system states

---

# Charting Experience Philosophy

Charting must feel:

- simple
- supportive
- guided
- reassuring

Users should feel like they are:

- learning their cycle
- noticing patterns
- gaining clarity

They should never feel like they are filling out paperwork.

The system should guide understanding through the interface rather than overwhelming users with explanations.

---

# Microcopy Rules

Microcopy should be:

- brief
- calm
- human
- confidence-building

Examples:

Good:

- "Record the most fertile sign you noticed today."
- "Cycle patterns will appear after multiple cycles are recorded."
- "You can update this entry if your observations change."

Avoid:

- "No data available"
- "User action required"
- "Invalid input"

---

# UX Quality Filter

Before finalizing a design, ask:

- Does this feel calm?
- Does this feel warm?
- Does this reduce cognitive load?
- Does this help the user understand their cycle?
- Is the interaction simple and intuitive?

If the answer is no, revise the design.

---

# UX Philosophy Summary

Well Within should feel like:

- a calm personal journal
- a thoughtful body awareness tool
- a gentle guide to understanding fertility patterns

It should never feel like:

- clinical software
- productivity tracking
- health analytics dashboards

---

# Concrete Design Tokens (Implemented)

All non-calendar UI colors live in `apps/mobile/src/theme/colors.ts`. Calendar/rules-engine colors (BG_DRY, BG_BLEEDING, BG_POST_PEAK, PEAK_ACCENT, FERTILE_ACCENT, etc.) are constants and must not change.

## Color Palette

- Page background: `BG_PAGE` #F6F3EF (warm off-white)
- Card background: `BG_CARD` #FDFCFB (warm white)
- Tag/stat pill fill: `BG_MISSING` #F5F3F1
- Card border: `BORDER_CARD` #E7E2DE (soft warm divider)
- Primary text: `TEXT_PRIMARY` #3F3A36 (warm charcoal)
- Secondary text: `TEXT_SECONDARY` #5A5550
- Subtle text / icons: `TEXT_SUBTLE` #6F6A65
- Muted text: `TEXT_MUTED` #A09A94
- Brand name: `BRAND_NAME` #3F3A36 (same as primary -- anchors title)
- Warm accent (toggles, save buttons): `ACCENT_WARM` #B89A8B (muted clay)
- Warm tint (selected pills, icon circles): `ACCENT_WARM_TINT` #F5F3F1
- Destructive accent (delete, clear): `ACCENT_RED` #f43f5e (only for destructive actions)
- StatusBanner default bg: `BG_CARD_GRADIENT_START` #F1EFEA

## Typography Hierarchy

| Element | Size | Weight | Extra |
|---------|------|--------|-------|
| App title | 28 | 600 | letterSpacing: -0.2 |
| Section headers | 21 | 600 | |
| Month labels | 18 | 500 | |
| Calendar day numbers | 16 | 500 | |
| Body text | 15 | 400 | lineHeight: 22 |
| Supporting text | 14 | 400 | |
| CTA text | 15 | 500 | |
| Badge / tag text | 11 | 600 | |

## Spacing Rhythm (8-point system)

- 8px: small intra-card gap
- 16px: card padding, standard element spacing
- 24px: section spacing
- 32px: large separation

## Iconography

**No emojis in the UI.** The only exception is the rose (🌹) used as the intercourse marker, which stays because it is a deliberate design choice embedded in the data layer (`INTERCOURSE_ICON`).

All icons must use the `LineIcon` component (`apps/mobile/src/components/LineIcon.tsx`). This component renders warm, minimal line-art shapes using pure React Native Views -- no external SVG library required.

Design rules for icons:
- Stroke color: `ACCENT_WARM` (#B89A8B)
- Background: `ACCENT_WARM_TINT` (#F5F3F1)
- Frame: soft rounded-square with `BORDER_CARD` border
- Large icons (onboarding): `size={72}` in a ~90px frame
- Small icons (accordions, lists, settings): `size={20}` in a ~32px frame
- Gear icon (navigation): `size={20}`

When adding new icons, add a new variant to the `IconName` type and a corresponding render function in `LineIcon.tsx`. Keep shapes geometric and minimal -- circles, rounded rectangles, lines, and simple transforms only.

**App logo.** The official Well Within logo is a single bitmap asset at `apps/mobile/assets/icon-1024.png`. It is the stylized rose on a cream background (#F6F3EF) matching the app’s `BG_PAGE`. The same asset is used for: the app icon (home screen / App Store), splash screen, onboarding slide 1, and the CalendarScreen header next to "Well Within". When updating, replace `icon-1024.png` with a 1024×1024 PNG (rose on cream); do not use transparency for the icon (store requirements). See `docs/APP_ASSETS.md`.
