# Holistic Cycle – Product Requirements Document (MVP)

Version: 1.0  
Status: Draft  
Scope: MVP (Trying-to-Conceive Charting Only)

---

## 1. Product Vision

Holistic Cycle is a modern mobile application designed to help couples chart fertility observations and understand their fertile window while trying to conceive.

The application digitizes standardized fertility observation practices while maintaining strict deterministic interpretation rules.

The MVP focuses on:

- Accurate daily observation charting
- Deterministic interpretation of fertility signals
- Clear visualization of the fertile window
- Privacy-first architecture

The system intentionally avoids predictive fertility algorithms and relies exclusively on observed data.

Holistic Cycle is designed to be compatible with the Creighton Model observation method. The charting system, recording fields, and rules engine follow the core Creighton observation and interpretation rules. See [docs/CREIGHTON.md](CREIGHTON.md) for the full method reference, official recording codes, code-to-app field mappings, and compliance notes.

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
