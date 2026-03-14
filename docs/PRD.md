# Well Within – Product Requirements Document (MVP)

Version: 1.0  
Status: Draft  
Scope: MVP (Trying-to-Conceive Charting Only)

---

## 1. Product Vision

Well Within is a modern mobile application designed to help couples chart fertility observations and understand their fertile window while trying to conceive.

The application digitizes standardized fertility observation practices while maintaining strict deterministic interpretation rules.

The MVP focuses on:

- Accurate daily observation charting
- Deterministic interpretation of fertility signals
- Clear visualization of the fertile window
- Privacy-first architecture

The system intentionally avoids predictive fertility algorithms and relies exclusively on observed data.

Well Within is designed to be compatible with the Creighton Model observation method. The charting system, recording fields, and rules engine follow the core Creighton observation and interpretation rules. See [docs/CREIGHTON.md](CREIGHTON.md) for the full method reference, official recording codes, code-to-app field mappings, and compliance notes.

## 2. Target User

**Primary user**

Women actively trying to conceive who are charting fertility observations daily.

**Secondary user**

Partner/spouse who may also view cycle progress.

## 3. Core MVP Features

The MVP includes the following core features:

- Calendar View
- Daily Observation Entry
- Cycle Chart Visualization
- Cycle History and Multi-Cycle Insights
- Deterministic Fertility Rules Engine
- Cycle Phase Labeling
- First-launch onboarding
- Settings (privacy, data export, clear data)
- Export Cycle PDF
- Shared Color Theme
- Local Data Persistence
- Basic Account System (optional for MVP)

## 4. Feature Specifications

### Feature: Calendar View

**User Story**  
As a user charting my cycle, I want to view my cycle using a calendar interface so that I can easily navigate between days and enter observations for the correct date.

**Requirement**

The application shall provide a calendar screen that allows users to:

- View the current month by default
- Navigate to previous months
- Navigate to future months
- Select any day within the calendar
- See a visual indicator for days that already contain chart data
- See a visual indicator for fertile window days (once computed)

**Calendar behavior**

When a user taps a day:

- The app navigates to the Daily Entry screen for that date.

**Multi-cycle rendering**

The calendar renders days from ALL cycles correctly, not just the current cycle. `CalendarScreen` uses `useCycleHistory` to look up each day's `phaseLabel` and `mucusRank` from that day's own cycle result. This ensures past-cycle days retain their correct colors (peak-type, mucus dots, post-peak yellow, etc.) instead of being flattened to `'previous_cycle'`.

**Calendar indicators**

Days may display the following visual states (colors from shared theme):

- **No entry** — white background
- **Dry day** — light green background
- **Bleeding day** — light red background
- **Non-peak mucus day** — light green background with green indicator dot
- **Peak-type mucus day** — white background with blue indicator dot
- **Peak day** — blue border around the cell, blue indicator dot
- **Post-peak day (P+1 – P+3)** — yellow background
- **Today** — black border around the cell
- **Intercourse** — rose emoji (🌹) in the bottom-right corner of the cell

### Feature: Calendar View — Enter Daily Charting Data

**User Story**  
As a user charting my cycle, I want to easily enter daily observations so that I can build an accurate record of my fertility signs.

**Requirement**

Users must be able to enter chart data through a form.

The form may be accessed through:

- Selecting a day from the calendar
- Selecting a floating "Add Entry" button

The data entry interface must contain the following fields.

**Required fields**

- **Observation date**  
  - Automatically populated from calendar selection

- **Bleeding type**  
  - Allowed values: none, spotting, light, moderate, heavy, brown

- **Sensation**  
  - Allowed values: dry, damp, wet, slippery

- **Appearance**  
  - Allowed values: none, cloudy, clear, stretchy

- **Quantity**  
  - Allowed values: none, low, medium, high

**Optional fields**

- **Intercourse** — Values: yes, no
- **Notes** — Free text

**Behavior**

When the user saves the entry:

- Entry is stored locally
- Rules engine is executed
- Cycle interpretation is recalculated
- Calendar and chart views update automatically

### Feature: Cycle Chart Visualization

**User Story**  
As a user tracking fertility observations, I want to view a visual chart of my cycle so that I can understand trends and patterns over time.

**Requirement**

The application must provide a chart view displaying daily observations across the cycle.

The chart must show:

- Each day in the cycle
- Mucus ranking for each day
- Fertile window
- Peak day
- Post-peak days

**Chart elements**

- **X-axis:** Cycle day
- **Y-axis:** Mucus rank

**Rank scale**

- 0 — Dry
- 1 — Damp
- 2 — Wet
- 3 — Peak quality

**Visual indicators**

- Peak day should be visually highlighted (blue bar, matching `PEAK_ACCENT` from shared theme).
- Non-peak mucus bars use green (`FERTILE_ACCENT`). Dry bars use light green. Post-peak bars use yellow.
- Rose emoji (🌹) appears above bars for days where intercourse was recorded.

### Feature: Deterministic Fertility Rules Engine

**User Story**  
As a user charting fertility observations, I want the system to interpret my chart using consistent rules so that I can clearly understand when my fertile window occurs.

**Requirement**

The system must include a deterministic rules engine.

The rules engine must:

- Accept a list of daily observations
- Compute a fertility interpretation
- Return phase labels for each day

The rules engine must not:

- Predict ovulation
- Use probabilistic models
- Use machine learning

All outputs must derive strictly from observed data.

#### Rules Engine Input Data Structure

Each cycle is represented as a list of daily entries.

**DailyEntry fields**

- date
- bleedingType
- sensation
- appearance
- quantity
- intercourse
- missing

Missing days must be supported.

#### Rules Engine Step 1 — Mucus Ranking

Each day must be converted to a numeric mucus rank.

**Ranking logic**

- **Rank 0** — Condition: sensation = dry AND appearance = none
- **Rank 1** — Condition: sensation = damp
- **Rank 2** — Condition: sensation = wet
- **Rank 3** — Condition: any of sensation = slippery, appearance = clear, appearance = stretchy

**Rank precedence**

- If multiple signals exist, the highest rank applies.  
  - Example: wet sensation + clear appearance → Rank 3

#### Rules Engine Step 2 — Fertile Window Start

The fertile window begins at the first day where mucusRank ≥ 1.

**Algorithm**

- Iterate through entries.
- If rank ≥ 1: fertileStartIndex = current index.
- If no such day exists: fertile window does not open.

#### Rules Engine Step 3 — Peak Identification

Peak day is defined as the last day of highest quality mucus before a sustained decline.

**Candidate rule**

- Any day where mucusRank = 3.

**Confirmation rule**

- Peak is confirmed only if the following three days exist and each satisfy: rank < candidateRank.

Example:

- Day 4 → rank 3, Day 5 → rank 1, Day 6 → rank 0, Day 7 → rank 0 → Peak = Day 4

**Peak Reset Rule**

- If a candidate peak is followed by a day with equal or higher rank before confirmation is complete, the candidate peak is replaced.  
  - Example: Day 4 → rank 3, Day 5 → rank 1, Day 6 → rank 3 → New candidate peak = Day 6

**Missing Day Rule**

- If any of the confirmation days (P+1, P+2, P+3) are missing: peak cannot be confirmed; peak remains unconfirmed.

#### Rules Engine Step 4 — Fertile Window End

- Fertile window ends on: Peak + 3.  
  - Example: Peak = Day 10 → Fertile window end = Day 13

#### Phase Labels

Each day receives a phase label.

Possible labels:

- dry
- fertile_open
- peak_confirmed
- p_plus_1
- p_plus_2
- p_plus_3
- post_peak
- fertile_unconfirmed_peak

#### Rules Engine Recalculation Requirement

The entire cycle must be recalculated whenever:

- a day is added
- a day is edited
- a day is deleted

No incremental state may be stored.

**Verification and tests:** Canonical verification examples and test-automation requirements (e.g. 100% coverage) are defined in [RULES_ENGINE_SPEC.md](RULES_ENGINE_SPEC.md#rules-engine-verification-examples). Each example must correspond to a unit test.

### Feature: Cycle Recalculation

**User Story**

As a user editing past observations, I want the system to automatically recompute my cycle interpretation so that my chart remains accurate.

**Requirement**

Any modification to entries must trigger a full recalculation of:

- mucus ranking
- fertile window
- peak detection
- phase labels

### Feature: Data Storage

**User Story**

As a user charting my cycle, I want my data saved securely so that my history is preserved.

**Requirement**

**MVP storage strategy**

- Local device storage.

Possible implementation: SQLite, AsyncStorage.

**Future phase**

- Cloud sync.

### Feature: Privacy and Security

**User Story**

As a user entering sensitive reproductive data, I want assurance that my data remains private.

**Requirement**

The application must:

- Avoid third-party analytics
- Avoid advertising SDKs
- Avoid external fertility APIs

All cycle data must remain user-owned.

### Feature: Cycle History and Multi-Cycle Insights

**User Story**
As a user who has tracked multiple cycles, I want to view my cycle history, see patterns across cycles, and drill into individual cycle details so that I can understand my fertility trends over time.

**Requirement**

The app must provide a Cycle History screen accessible from the Calendar screen. This screen replaces the original Timeline view and includes:

- **Cycle Summary Panel** — 2x2 grid showing: Cycles Tracked, Average Cycle Length (days), Average Peak Day, Average Luteal Phase (days).
- **Pattern Insights** — Bullet-point list of computed insights (peak day range, fertile window start, luteal phase average, cycle consistency). Requires at least 2 completed cycles. Empty state shown otherwise.
- **Peak-Aligned Overlay** — Last 3–6 completed cycles shown as rows of colored cells, aligned on peak day (column 0). Cell colors match the calendar grid exactly (shared theme). Tapping a row navigates to Cycle Detail.
- **Cycle Comparison Cards** — Vertical list of all cycles (newest first). Each card shows cycle number, start date, length, peak day, luteal phase, and a status badge (Complete / In Progress / No Peak). Tapping a card navigates to Cycle Detail.

The app must provide a Cycle Detail screen that shows:

- **Stats Header** — Three stat cards: Length (days), Peak Day (cycle day), Fertile End (day number or "--").
- **Daily Mucus Pattern Chart** — Adapted MucusChart with bar colors matching the calendar grid. Rose emoji (🌹) above bars for intercourse days.
- **Fertile Window Timeline** — Vertical timeline with milestones: Fertile Start, Peak Day, Fertile End (P+3). Total fertile days count.
- **Daily Log List** — Scrollable list of every day in the cycle. Each row shows: cycle day circle (colored by phase), date, observation summary, phase badge, rose emoji if intercourse. Peak day row gets a blue border.

**Multi-Cycle Engine**

Cycle splitting is handled by pure functions in `core/rulesEngine/src/multiCycle.ts`:

- `splitIntoCycles(entries)` — splits sorted entries into individual cycles by detecting bleeding boundaries (first heavy/moderate bleeding day not preceded by heavy/moderate).
- `computeCycleSummary(cycles)` — computes aggregate statistics.
- `generateInsights(cycles)` — produces human-readable insight strings.

These functions wrap `recalculateCycle()` — they do not modify it.

**Intercourse Indicator**

The rose emoji (🌹) is the universal intercourse marker across the entire app: calendar grid cells, MucusChart bars, DailyLogList rows, and TodayEntryCard. Defined in the shared color theme as `INTERCOURSE_ICON`.

### Feature: Shared Color Theme

**Requirement**

All UI colors are defined in a single file: `apps/mobile/src/theme/colors.ts`. Every component imports from this file — no hardcoded hex values in new code. This ensures visual consistency across the calendar, cycle history, and all future screens.

Semantic color constants:

- `BG_DRY` (#dcfce7) — light green for dry days
- `BG_BLEEDING` (#fca5a5) — light red for bleeding
- `BG_POST_PEAK` (#fef08a) — yellow for P+1 through P+3
- `BG_NO_ENTRY` (#ffffff) — white for unlogged days
- `BG_PEAK_TYPE` (#ffffff) — white for peak-type mucus (distinguished by indicator dot)
- `BG_MISSING` (#f1f5f9) — light gray for no data
- `PEAK_ACCENT` (#0369a1) — blue for peak dots, borders, and bars
- `FERTILE_ACCENT` (#16a34a) — green for non-peak mucus dots and fertile bars
- `BORDER_TODAY` (#000000) — black border for today
- `INTERCOURSE_ICON` (🌹) — rose emoji for intercourse

### Feature: Calendar / Cycle History Tab Toggle

**User Story**
As a user, I want to quickly switch between my calendar view and cycle history without navigating to a separate screen.

**Requirement**

The Calendar screen includes a segmented pill toggle at the top with two tabs: "Calendar" and "Cycle History". Tapping a tab switches the content below between the calendar view and the inline cycle history view. The standalone "Cycle History" card link is removed.

The toggle uses `FERTILE_ACCENT` green for the active tab, `BG_CARD` white for inactive, and `BORDER_CARD` for the outer pill border. Component: `SegmentedToggle.tsx`.

### Feature: Export Cycle PDF

**User Story**
As a user, I want to export a cycle report as a PDF so I can share it with my practitioner, spouse, or keep it for personal records.

**Requirement**

The Cycle Detail screen includes an "Export" button in the top-right header. The export flow:

1. User taps Export
2. A modal asks "Include intercourse markers?" (Yes / No / Cancel)
3. A PDF is generated via `expo-print` from an HTML template (`exportCyclePdf.ts`)
4. The iOS share sheet opens via `expo-sharing`, allowing save to Files, AirDrop, email, print, etc.

PDF content includes: cycle number, date range, summary stats (length, peak day, fertile window, luteal phase), a colored mucus bar chart, and a day-by-day observation table with optional intercourse markers.

### Feature: Settings

**User Story**
As a user, I want a settings screen where I can understand how my data is handled, export my data, and clear all data if needed.

**Requirement**

The Settings screen is accessible via a gear icon in the top-right of the Calendar screen (visible on both Calendar and Cycle History tabs).

Layout:

- **Privacy card**: "How your data works" heading + 4 trust-building bullet items (local storage, observation-based calculations, no ad tracking, exportable/clearable data)
- **Data Management card**:
  - "Export Data" — exports all entries as JSON via `expo-file-system` + `expo-sharing`
  - "Clear All Data" — opens a confirmation modal ("Are you sure? This cannot be undone.") with Cancel and Confirm buttons. On confirm, removes all entry data from AsyncStorage.
- **App Version** footer — reads version from `expo-constants` / `app.json`

### Feature: First-launch onboarding

**User Story**  
As a new user, I want a short introduction to the app and how to chart so that I know what to observe and how to get started.

**Requirement**

- On first launch, the app shall show a short onboarding flow (e.g. 4 slides) covering: welcome, what to observe, when to observe, and how to start charting.
- After the user completes or skips onboarding, the app shall not show onboarding again unless the user explicitly requests it.
- For testing and support, the app shall provide a way to re-show the onboarding flow without clearing app data (e.g. a “Show onboarding again” control in Help). See [mockups.md](mockups.md#onboarding-first-launch) for slide content and screenshot placeholders.

## MVP Success Metrics

Success will be measured through:

- Daily active charting users
- Entry completion rate
- Retention after 30 days

## Out of Scope (MVP)

The following are not included in the MVP:

- Pregnancy tracking
- Practitioner communication
- AI fertility guidance
- Couple accounts
- Hormone integration
- Apple Health integration
- SEO / App Store Optimization (deferred to post-MVP)

## Implementation / feature log

Log of implemented features and doc updates for traceability.

| Date       | Item | Notes |
|------------|------|--------|
| 2025-03-05 | First-launch onboarding | 4-slide flow; completion/skip stored in local storage. |
| 2025-03-05 | Re-show onboarding | “Show onboarding again” in Help screen; clears onboarding flag and shows flow without clearing app data. |
| 2025-03-05 | Onboarding in mockups | [mockups.md](mockups.md#onboarding-first-launch): table of slide copy + image placeholders `onboarding-slide-1.png` … `onboarding-slide-4.png` in `docs/images/`. |
| 2025-03-05 | Creighton method reference | Created [CREIGHTON.md](CREIGHTON.md) with recording codes, sticker colors, code-to-app field mapping. PRD Vision section cross-references it. |
| 2025-03-05 | Calendar UX improvements | Calendar auto-refreshes on focus (`useFocusEffect`). Keyboard-avoiding behavior in notes field. Brown bleeding option added. |
| 2025-03-05 | Creighton-aligned color scheme | Calendar grid, MucusChart, and cycle history use Creighton-based colors: red=bleeding, green=dry, green+dot=non-peak mucus, white+blue dot=peak-type, yellow=post-peak. Peak border/dots are blue (#0369a1). Today border is black. |
| 2025-03-05 | Shared color theme | Centralized all color constants and `INTERCOURSE_ICON` in `apps/mobile/src/theme/colors.ts`. All UI components import from this single source. |
| 2025-03-05 | Intercourse marker — rose emoji | Universal intercourse indicator changed to 🌹 across calendar, chart, cycle detail, and daily log. |
| 2025-03-05 | Multi-cycle engine | Added `core/rulesEngine/src/multiCycle.ts` with `splitIntoCycles()`, `computeCycleSummary()`, `generateInsights()`. Exported from rules engine index. |
| 2025-03-05 | Cycle History screen | New screen with CycleSummaryPanel, PatternInsights, PeakAlignedOverlay, and CycleCard components. Accessible from CalendarScreen. |
| 2025-03-05 | Cycle Detail screen | New screen with stats header, adapted MucusChart (with intercourse markers), FertileTimeline, and DailyLogList. |
| 2025-03-05 | useCycleHistory hook | New hook provides multi-cycle slices, summary, and insights to UI. |
| 2025-03-05 | Navigation updates | Added CycleHistory and CycleDetail to RootStackParamList. CalendarScreen links to Cycle History. |
| 2025-03-05 | Bug fix — multi-cycle calendar rendering | CalendarScreen now uses `useCycleHistory` to build `dayInfos` from per-cycle results instead of the single-cycle `recalculateCycle()`. Fixes days in past cycles showing as green/dry (they were labeled `'previous_cycle'` by the flat recalc). Blue peak border now shows correctly for all cycles. |
| 2025-03-05 | Bug fix — indicator dots across all phases | `getIndicatorColor` in CalendarGrid now shows dots based on actual `mucusRank` regardless of phase label. Previously only fertile-phase days got dots; now any day with mucus (rank ≥ 1) shows the appropriate green or blue dot. |
| 2025-03-05 | Calendar/Cycle History tab toggle | Replaced standalone Cycle History card link with in-screen SegmentedToggle (pill-shaped). Calendar and Cycle History content now toggle within CalendarScreen. |
| 2025-03-05 | Export Cycle PDF | CycleDetailScreen has Export button. Uses `expo-print` + `expo-sharing`. Generates HTML-based PDF with cycle stats, mucus chart, day-by-day observations, optional intercourse markers. |
| 2025-03-05 | Color guide visual swatches | HelpScreen calendar color guide now shows actual colored square swatches (matching calendar cells) instead of emoji text. Added rose emoji intercourse row and today border row. |
| 2025-03-05 | Settings screen | New SettingsScreen: privacy info, JSON export, clear all data with confirmation modal, app version. Gear icon in CalendarScreen top bar. |
| 2025-03-05 | Theme: accent colors | Added `ACCENT_RED` and `ACCENT_RED_DARK` to shared color theme for consistent button/destructive action styling. |
| 2025-03-05 | App rebrand — Well Within | Renamed app from "Modern Creighton" / "Holistic Cycle" to "Well Within" in `app.json`, CalendarScreen, and PDF footer. Added `BRAND_NAME` (#8b7e74) and `ACCENT_WARM` (#c4927a) theme colors. |
| 2025-03-05 | UX tone refresh | Applied warm, calm aesthetic across SegmentedToggle, EntryForm, SettingsScreen, CalendarScreen, and TodayEntryCard. Removed `+Entry` button; replaced with explicit tap-to-record CTA. Softened gear icon and help link. |
| 2025-03-05 | "# of Times" observation field | Added optional `timesObserved` (1/2/3) to `DailyEntry` type. EntryForm shows pill selector with info bubble. DailyLogList displays multiplier (e.g., "Dry x2"). |
| 2025-03-05 | PDF export enhancements | Renamed "Quantity" column to "Mucus Quantity". Added "# Times" column. Aligned PDF chart bar colors and heights to match in-app MucusChart (post-peak yellow, proportional height). |
| 2025-03-05 | UI Polish Pass — warm palette | Shifted entire non-calendar palette to warm tones: `BG_PAGE` #F6F3EF, `BG_CARD` #FDFCFB, `BORDER_CARD` #E7E2DE, `TEXT_PRIMARY` #3F3A36, `TEXT_SECONDARY` #5A5550, `TEXT_SUBTLE` #6F6A65, `TEXT_MUTED` #A09A94. Added `BG_CARD_GRADIENT_START`/`END` tokens for StatusBanner. |
| 2025-03-05 | UI Polish Pass — typography system | Applied consistent hierarchy: title 28/600, section headers 21/600, month labels 18/500, body 15/400 with lineHeight 22, CTA 15/500, badge 11/600. Title uses letterSpacing -0.2. |
| 2025-03-05 | UI Polish Pass — 8pt spacing | Normalized margins and padding to 8/16/24/32 multiples across CalendarScreen, SegmentedToggle, TodayEntryCard, and section gaps for calmer vertical rhythm. |
| 2025-03-05 | UI Polish Pass — component cleanup | Replaced 40+ hardcoded hex values with theme tokens in EntryForm, StatusBanner, OnboardingScreen, SettingsScreen, CycleDetailScreen, and SegmentedToggle. Softened toggle to muted clay (#B89A8B), warmed StatusBanner default/post-peak backgrounds, unified modal overlay opacity. |
| 2025-03-05 | UI Polish Pass — PDF warm palette | Updated exportCyclePdf.ts non-chart colors (body text, borders, stat cards, footer) to match the warm app palette. |
| 2025-03-05 | Observation model refactor | Replaced `Appearance: 'stretchy'` with separate `Stretch` type (none/sticky/tacky/stretchy). Removed `Quantity` field. Replaced `timesObserved` with `Frequency` (1/2/3/all_day). Updated rank engine to consider stretch as independent dimension. |
| 2025-03-05 | Creighton code generation | New `creightonCode.ts` module: `generateCreightonCode()` produces deterministic Creighton-compatible observation codes (e.g., 10WLKAD). `classifyFertility()` returns dry/early_fertile/fertile/peak_type classification. |
| 2025-03-05 | EntryForm — observation model | Removed Mucus Quantity section. Added separate Mucus Stretch section (none/sticky/tacky/stretchy). Renamed "# of Times" to "Observed During the Day" with All Day option. Summary now shows fertility classification instead of raw rank. |
| 2025-03-05 | PDF export — observation model | Replaced Mucus Quantity column with Stretch column. Added Creighton Code column. Updated frequency display (x1/x2/x3/AD). |
| 2025-03-05 | Data migration v2 | Automatic migration on app load: `appearance:'stretchy'` → `stretch:'stretchy'`, `timesObserved` → `frequency`, `quantity` removed. Runs once then flags completion. |
| 2025-03-05 | Calendar coloring update | Peak-type boxes now use light grey (#D6D3CF) background instead of white+teal dot. Confirmed peak day has dark charcoal border (#4A4541). |
| 2025-03-05 | Entry modal refinements | Removed "Vulva" from "Sensation at Vulva" → now just "Sensation". Added info bubble next to "Notes (Optional)" with PMS/symptom guidance text. |
| 2026-03-05 | Entry Modal Creighton Refactor | Full Creighton alignment: Sensation expanded to 7 options (dry/damp/wet/shiny/sticky/tacky/stretchy), removed slippery. Appearance changed to multi-select array with 10 Creighton-aligned options. Stretch section removed entirely. Lubricative promotion rule: damp/shiny/wet + lubricative → base codes 10DL/10SL/10WL (peak_type). New base code `4` for shiny sensation. No Creighton codes shown in UI — human-readable labels only; codes stored in backend for future consultant/grid views. |
| 2026-03-05 | Rules engine v3 | Rewrote rank.ts with new sensation ranks, multi-select appearance boost, and lubricative promotion logic. Rewrote creightonCode.ts with full base code table and multi-select appearance suffix concatenation in Creighton order. |
| 2026-03-05 | Data migration v3 | Migrates: `slippery` → `wet` + `lubricative`; `stretch` values merged into `sensation`; single `appearance` → `appearances` array. |
| 2026-03-05 | PDF export update | Replaced Stretch column with Appearance column showing all selected appearances. Updated to use `appearances` array field. |
| 2026-03-05 | Help screen update | Removed "slippery" from mucus type descriptions. Updated peak day explanation to reference stretchy/lubricative. |
| 2026-03-05 | Peak chart color consistency | Changed MucusChart and PDF export peak bar color from blue/teal (#0369a1) to warm grey (#D6D3CF), matching calendar coloring. Removed unused `PEAK_ACCENT` color constant. |
| 2026-03-05 | Codebase cleanup | Removed unused color constants (PEAK_ACCENT, ACCENT_RED_DARK, BG_CARD_GRADIENT_END). Fixed `catch (e: any)` to `catch (e: unknown)` with proper type guards. Updated always-dry.json fixture to new `appearances` schema. Expanded index.test.ts to cover all 9 exported functions. |
| 2026-03-05 | Onboarding refresh | Updated all 4 onboarding slides with warmer copy matching the app's UX tone. Added line-art icons above each slide title using new `LineIcon` component. |
| 2026-03-05 | Line-art icon system | Created `LineIcon.tsx` component with 15 icon variants (cycle, observe, clock, calendar, eye, droplet, sparkle, heart, chart, grid, device, analytics, shield, lock, gear). Pure React Native Views, zero external dependencies. |
| 2026-03-05 | Emoji removal | Replaced all emojis with `LineIcon` components: HelpScreen accordion icons (6), SettingsScreen privacy icons (4), CalendarScreen gear icon (1). Only the rose intercourse marker remains as an intentional exception. |
| 2026-03-05 | UX skill: iconography rules | Added "Iconography" section to `skills/ux_tone_well_within.md` codifying no-emoji rule and `LineIcon` usage guidelines. |
| 2026-03-05 | App logo and icon fixes | Official logo asset added at `apps/mobile/assets/logo.png`; used on onboarding slide 1 (160x160) and in CalendarScreen top bar (32x32) next to "Well Within". Observe icon rewritten as tissue-with-droplet; clock icon hands fixed for proper alignment. |
| 2026-03-05 | Transparent logo background | Removed opaque beige background from logo PNG so the logo overlays the app's background color seamlessly on onboarding and in the main header. Asset remains at `apps/mobile/assets/logo.png`. |
| 2026-03-05 | Clock icon refinement | Clock icon (onboarding slide 3, Cycle History toggle) finalized: hands at 10:30 and 4:30 with center dot, same stroke as circle, centered in frame. Implemented in `LineIcon` clock variant. |

---

## Engineering Trim (Existing)

### MVP Goals

- Cloud-first, iOS-first Expo app.
- Deterministic Creighton rules engine (TTC-only).
- Partner read-only sharing.
- Subscription via RevenueCat.
- Privacy-first (no ad SDKs).

### MVP Must-Haves

- Daily entry structure: bleeding, ESQ (sensation/appearance/quantity), intercourse boolean, notes.
- Deterministic mucus rank (0-3) function.
- Peak detection algorithm: candidate + confirmation after 3 lower-quality days.
- Fertile window starts first mucus day after bleeding, ends at P+3 inclusive.
- Recompute entire cycle on any edit.
- Unit tests covering edge cases.
- Minimal Expo app demonstrating daily entry UI + timeline + partner view stub.
- CLI runner for validating engine behavior with JSON fixtures.

### Non-goals

- No AI assistant.
- No predictive scoring.
- No Android for MVP.
