# Rules Engine Specification (Source of Truth)

> This module must be deterministic, pure, and non-predictive. AI, forecasting, or probabilistic scoring are explicitly forbidden.

## Mucus Rank Mapping

The app and exported PDF show **qualitative chart labels** (Dry, Damp, Wet, Peak-type) derived from the numeric ranks below; users do not see 0–3 in the product UI.

Given a daily entry or observation with `sensation` and `appearances` (array):

The rank is the **maximum** across all applicable signals:

**Sensation rank:**

| Sensation | Rank |
|-----------|------|
| `stretchy` | 3 |
| `tacky` | 2 |
| `wet` | 2 |
| `sticky` | 1 |
| `shiny` | 1 |
| `damp` | 1 |
| `dry` | 0 |

**Lubricative promotion:** If `lubricative` is in the appearances array AND sensation is `damp`, `shiny`, or `wet`, effective rank becomes 3 (corresponding to base codes 10DL, 10SL, 10WL).

**Appearance rank boost** (max across all selected):

| Appearance | Boost |
|------------|-------|
| `clear` (K) | 3 |
| `cloudy_clear` (C/K) | 3 |
| `lubricative` (L) | 3 |
| `cloudy` (C) | 1 |
| `gummy` (G) | 1 |
| `pasty` (P) | 1 |
| `yellow` (Y) | 1 |
| `brown` (B) | 0 |
| `red` (R) | 0 |
| `none` | 0 |

**Final rank = max(sensationRank, lubricativePromotionRank, appearanceBoostRank)**

If multiple observations exist in one day, daily rank is the `max(observationRanks)`.

## Observation Fields

The system captures three observation dimensions per day:

- **Sensation** (single-select): `dry`, `damp`, `wet`, `shiny`, `sticky`, `tacky`, `stretchy`
- **Appearances** (multi-select array): `none`, `brown`, `cloudy`, `cloudy_clear`, `gummy`, `clear`, `lubricative`, `pasty`, `red`, `yellow`
- **Frequency**: `1`, `2`, `3`, `all_day`

## Creighton Code Generation

Each daily observation produces a deterministic Creighton-compatible code:

**Base code** (sensation + Lubricative interaction):

| Condition | Base Code |
|-----------|-----------|
| Lubricative + damp | 10DL |
| Lubricative + shiny | 10SL |
| Lubricative + wet | 10WL |
| stretchy sensation | 10 |
| tacky sensation | 8 |
| sticky sensation | 6 |
| wet sensation | 2W |
| shiny sensation | 4 |
| damp sensation | 2 |
| dry (default) | 0 |

**Appearance suffix:** Concatenated in Creighton order (B, C, C/K, G, K, L, P, R, Y). When Lubricative promoted the base code (damp/shiny/wet + L), L is excluded from the suffix (it is embedded in the base code).

**Frequency suffix**: X1 (once), X2 (twice), X3 (three times), AD (all day), or empty.

**Full code** = `baseCode` + `appearanceSuffix` + `frequencySuffix`. Example: `10WLKAD`.

## Fertility Classification

Derived from the base code:

| Base Code | Classification |
|-----------|---------------|
| 0 | dry |
| 2, 2W, 4 | early_fertile |
| 6, 8 | fertile |
| 10, 10DL, 10SL, 10WL | peak_type |

## Scope: standard cycle only (MVP)

This specification describes the **standard Creighton-style cycle** (dry → mucus → peak → post-peak). **Basic infertile pattern (BIP)** and other alternate interpretations are **out of scope** until explicitly added.

## Fertile start (standard cycle)

**Intent:** Fertile opening is tied to **observed mucus** after the menstrual flow phase, not to a raw rank threshold alone.

**Blocking bleeding:** Days with `bleeding` in `heavy`, `moderate`, `light`, or `spotting` are treated as **flow** days for this rule. Fertile start is **not** assigned on a flow day even if mucus rank would otherwise be ≥ 1 (see verification case 7B).

**Rule:** `fertileStartIndex` is the first index `i` at or after `cycleStartIndex` such that:

1. `mucusRanks[i] >= 1` (observed mucus present for ranking), and  
2. `entries[i].bleeding` is **not** one of `heavy` | `moderate` | `light` | `spotting` (treat `undefined` / `none` / `brown` as non-flow for opening).

If no such day exists, `fertileStartIndex` is `null`.

**`fertileStartReason`** (enum on `CycleResult`):

- `first_mucus_after_dry` — default when the above rule applied without a blocking ambiguity from missing data.  
- `uncertain_due_to_missing` — there is a **missing** row or **calendar gap** between `cycleStartIndex` and the first mucus day in the slice, so the “first mucus after flow” boundary is not fully observed.

## Peak candidate and confirmation (calendar P+3, standard cycle)

**Peak-type day:** `mucusRanks[i] === 3` (peak-type mucus per rank mapping above) and the row is not missing.

**Calendar confirmation:** Peak is **not** confirmed by slice index adjacency alone. Let `D` be the calendar date (`YYYY-MM-DD`) of a peak-type day. Peak is **confirmed** at that day only if the **next three consecutive calendar days** `D+1`, `D+2`, `D+3` each:

1. **Exist** as a stored row in the same recalculation array (no calendar gap).  
2. Are **not** `missing: true` and have non-null rank.  
3. Have ranks **strictly lower** than the candidate rank (for rank `3` followers, ranks must be `< 3`).  
4. Contain **no** peak-type observation on those days (already enforced by rank &lt; 3 when candidate rank is 3).

**Later peak-type overrides:** Process days in **chronological order** by date. The active **peak candidate** is the latest peak-type day encountered. If confirmation is not yet satisfied and a **new** peak-type day appears on a later calendar day, the candidate **resets** to that day (verification 1B).

**Insufficient future days:** If `D+1`, `D+2`, or `D+3` are not all present in the chart, peak is **not** confirmed (verification 1D).

**Missing in P+1–P+3:** Any missing row or gap in the confirmation window **blocks** confirmation (1C, 2A).

**Synthetic dates:** If an entry has no `date`, the engine uses a deterministic synthetic anchor (`index` days after `2000-01-01`) so unit tests without dates remain deterministic; production entries should always include `date`.

**Outputs:**

- `peakCandidateIndex` — index of the **current** peak-type candidate (latest peak-type day in chronological order when unconfirmed); `null` if no peak-type day exists in the cycle.  
- `peakIndex` — index of **confirmed** Peak Day, or `null`.  
- `peakConfirmed` — `true` iff `peakIndex !== null`.  
- `fertileEndIndex` — `peakIndex + 3` when confirmed, else `null`.

## Missing data and interpretation warnings

- Missing rows **block** peak confirmation when they fall in the P+1–P+3 **calendar** window for the active candidate.  
- Calendar gaps (no row for a date) are treated like missing for confirmation.  
- Missing **after** Peak is confirmed does **not** invalidate the confirmed peak; it may reduce certainty in the banner (see Current cycle summary).  
- **`dataComplete`** — `true` iff **`interpretationWarnings`** is empty. (Calendar completeness for the banner—explicit missing rows, interior gaps, trailing gaps—is a separate **`buildCurrentCycleSummary`** calculation; it does not flip `dataComplete` on `CycleResult`.)  
- **`interpretationWarnings`** — deterministic `InterpretationWarningId[]` (closed set):

  | ID | Meaning |
  |----|--------|
  | `uncertain_fertile_start` | Fertile start boundary is uncertain because of a missing row or calendar gap between cycle start and first mucus day (`fertileStartReason` may be `uncertain_due_to_missing`). |
  | `calendar_gap_blocks_peak_confirmation` | A calendar gap in the P+1–P+3 window after the active peak-type candidate blocks Peak confirmation. |
  | `missing_blocks_peak_confirmation` | A day in that window is `missing: true` or has null rank, blocking confirmation. |
  | `peak_confirmation_incomplete` | A peak-type candidate exists and Peak is not yet confirmed, but P+1–P+3 are all present as rows with non-null ranks (no gap/missing in that window)—the chart has not yet satisfied strict-lower confirmation. |

  The UI maps these IDs to short, deterministic copy (see **`buildCurrentCycleSummary`** → **`interpretationNotes`**). The engine does not emit freeform prose on `CycleResult`.

## Bleeding classification (per day)

Each day in the slice has derived:

- **`bleedingClass`:** `cycle_start_flow` | `continuing_menses` | `spotting` | `post_peak_spotting` | `brown_discharge` | `intermenstrual` | `none`  
- **`brownBleedingContext`:** `pre_flow` | `post_peak` | `mid_cycle` | `null` if not brown-only context

**Rules (summary):**

- Only **heavy** or **moderate** starts a new cycle (see Bleeding reset).  
- **Spotting** before a later heavy/moderate flow is preamble, not cycle start.  
- **Brown** does **not** start a cycle; context is derived from position relative to flow and peak.  
- **Post-peak spotting** is flagged when bleeding is spotting after confirmed fertile end.

## Bleeding reset rule

- A new cycle begins on the first day of heavy or moderate bleeding that is not a continuation of an existing heavy/moderate bleeding sequence.  
- Days before the most recent cycle start are labeled `previous_cycle`.

## Recalculation

- Recompute ranks, peak, fertile start, bleeding classes, primary day class, warnings, and cycle labels for all entries whenever any entry changes.  
- Same inputs must always return identical outputs.  
- No network calls and no randomness allowed.

## Output requirements (`CycleResult`)

`CycleResult` includes at least:

- `peakCandidateIndex`, `peakIndex`, `peakConfirmed`  
- `fertileStartIndex`, `fertileStartReason` (`null` if no fertile start)  
- `fertileEndIndex`  
- `phaseLabels[]`, `mucusRanks[]`  
- `mucusDerivedByDay[]` — per day: `rank`, `isPeakType`, `isLubricative`, `isStretchy`, `classification` (`dry` \| `low_mucus` \| `fertile_mucus` \| `peak_type`); derived from ranks and observations for UI/PDF labeling (see `mucusClassification.ts`).  
- `bleedingClassByDay[]`, `brownBleedingContextByDay[]` (same length as entries)  
- `dataComplete`, `interpretationWarnings[]`  
- `primaryDayClassByDay[]` — **`PrimaryDayClass`** per day (`missing` \| `menstrual_flow` \| `spotting` \| `dry` \| `mucus_observed` \| `peak_type`). Single source for **calendar color**, **Today’s Observation** copy, and **banner** when mucus rank alone would disagree with bleeding context. Derived in `primaryDayClass.ts` using `bleedingClassByDay` so **post-peak spotting** with mucus resolves to mucus/post-peak **display**, not **`menstrual_flow`**.

### Bleeding override consistency

- **Menstrual flow days** (`bleedingClassByDay` = `cycle_start_flow` or `continuing_menses`) map to **`menstrual_flow`**. Heavy/moderate/light during menses are not interpreted as Peak-type for candidacy or user-facing “peak fertility” copy on that day.  
- **Peak-type candidacy** (`detectPeak`): indices with **flow bleeding** (`heavy` \| `moderate` \| `light` \| `spotting` per `blocksFertileOpening` in `flowBleeding.ts`) **cannot** be peak-type candidates, even if `mucusRanks[i] === 3`.  
- **Phase labels**: if a flow day would otherwise carry a fertile/peak sticker phase (`fertile_open`, `fertile_unconfirmed_peak`, `peak_confirmed`, `p_plus_1`–`p_plus_3`), it is coerced to **`dry`** for sticker semantics (not applied to `post_peak`).  
- **Post-peak spotting** (`post_peak_spotting`): if mucus rank ≥ 1, **`primaryDayClass`** follows mucus tier (`mucus_observed` or `peak_type`); calendar uses green/white/yellow per phase, **not** menstrual red.  
- **Draft entry preview** (`derivePrimaryDayClassFromEntry`): uses bleeding + rank only; heavy/moderate/light → **`menstrual_flow`** for preview; spotting uses mucus tier when rank ≥ 1.

## Current cycle summary (calendar banner)

The mobile calendar header shows a deterministic **`CurrentCycleSummary`** from `buildCurrentCycleSummary` in `core/rulesEngine/src/currentCycleSummary.ts` (exported as `core-rules-engine`). Copy and interpretation live in the engine; the UI only lays out fields and maps **`summaryTone`** to background tokens.

**Reference matrix (headlines, confidence, baseline, compact support line, mobile layout):** [docs/CURRENT_CYCLE_SUMMARY_MATRIX.md](CURRENT_CYCLE_SUMMARY_MATRIX.md) — keep this file updated when changing banner behavior so agents and humans have a single checklist.

**Inputs (last `CycleSlice` only)**

- `entries` — that slice’s `DailyEntry[]` (same slice as `splitIntoCycles` + `recalculateCycle` for that slice).
- `result` — `CycleResult` for that slice.
- `status` — slice `status`: `complete` | `in_progress` | `no_peak`.
- `todayIndex` — index within the slice for calendar “today”, or `null` if today has no row in that slice.
- `calendarAsOfDate` (optional, YYYY-MM-DD) — device “today” when building the summary in the app. Used for completeness trailing gaps (see below). Omitted in tests or non-UI callers that only need interior-gap / explicit-missing behavior without trailing.
- `baselineComparison` (optional) — output of `buildCycleComparisonStructured` for the current slice vs prior completed cycles; enables **`baselineContext`** lines when guards pass.

**Focus row**

- `focusIndex = todayIndex` when `todayIndex !== null`, otherwise `entries.length - 1` (last logged day in the slice).
- When `todayIndex === null` and the slice is non-empty, **`focusQualification`** is: **`No entry today. Showing your last logged day.`**

**Headline priority (deterministic)**

1. Missing data at the focus row (`missing: true` or phase `missing`) → **Observation needed for this day**.
2. **`primaryClass`** from `primaryDayClassByDay[focusIndex]` — **`menstrual_flow`** → **Menstrual flow**; **`spotting`** → **Spotting** (see `primaryDayClass.ts`: spotting with mucus rank ≥ 1 resolves to mucus tiers, not this headline).
3. **`phase === 'fertile_unconfirmed_peak'`** → **Fertile pattern — Peak not confirmed yet** (guidance branches on `peakCandidateIndex`).
4. Otherwise **`headlineFromPhase(phase)`** — e.g. **Tracking** (`dry` / `previous_cycle`), **Fertile pattern** (`fertile_open`), **Peak day identified** / **Post-peak phase** as appropriate. Slice **`status === 'no_peak'` does not override** phase headlines (user still sees Tracking vs fertile titles, not a single “Peak not yet identified” for every day).

Full table: [docs/CURRENT_CYCLE_SUMMARY_MATRIX.md](CURRENT_CYCLE_SUMMARY_MATRIX.md).

**Completeness (calendar-aligned)**

The completeness total is the sum of three parts (no double-counting: a calendar day is either represented by a stored row or it is not).

1. **Explicit missing rows** — count entries in the slice with `entry.missing === true`.
2. **Interior calendar gaps** — for each calendar day from the slice’s first logged date through its last logged date (inclusive), count days that have **no** stored row in the slice (empty calendar cells between logged days).
3. **Trailing gaps (in-progress slices only)** — when `status !== 'complete'` and `calendarAsOfDate` is provided and the last logged date in the slice is **before** `calendarAsOfDate`, count each calendar day from the day after the last logged date through `calendarAsOfDate` (inclusive) that has no stored row. This matches “no entry” cells after the user’s last log through today. For `status === 'complete'`, trailing gaps are not applied (historical slice end is not extended to the device date).

Date arithmetic uses ISO `YYYY-MM-DD` strings as local calendar dates (same convention as stored entry dates).

**Confidence (Requirement 2 — Summary Confidence Indicator)**

- Field **`confidence`** is **only** a deterministic tier line: `High confidence`, `Moderate confidence`, or `Low confidence`, plus an **em dash variant**. The High variant is **`High confidence — Peak confirmed`** (capital **P** on Peak). The UI must not infer or rewrite confidence.
- **Recent window:** indices `max(0, focusIndex - 2)` through `focusIndex` (inclusive). If the **focus row** is incomplete (`missing` / phase `missing`), confidence is **Low — missing observations**. Else if **any** day in the recent window has `entry.missing === true` or phase `missing`, confidence is **Low — recent observations missing** (High tier is never used in that case).
- **Rule order (first match wins after Low checks):** `no_peak` status → Moderate — pattern still forming; `fertile_unconfirmed_peak` → Moderate — pattern still forming; `p_plus_1` / `p_plus_2` → Moderate — pattern still forming; `peak_confirmed` / `p_plus_3` / `post_peak` → High — Peak confirmed; `fertile_open` / `dry` / `previous_cycle` → Moderate — pattern still forming; default → Moderate — pattern still forming.

**Completeness line**

- **0** per completeness total above: **`No gaps in your chart this cycle`**
- **1:** **`1 day still open in this cycle`**
- **N:** **`N days still open in this cycle`**
- Empty slice uses a separate short completeness string (see implementation).

**`interpretationNotes`**

- **`interpretationNotes: string[]`** — Human-readable lines derived **only** from `result.interpretationWarnings` via a fixed template map (`WARNING_COPY` order). Empty when there are no warnings.
- **Mobile (compact banner):** At most **one** note may appear, when **`compactSupportField === 'interpretationNote'`** (see matrix doc). The full array remains on **`CurrentCycleSummary`** for tests and future surfaces.

**Guidance, `supportingContext`, `baselineContext`, `compactSupportField`**

- Primary explanatory copy for each branch lives in **`guidance`** (deterministic table in `buildCurrentCycleSummary`).
- **`supportingContext`** is still computed for traceability; compact UI may omit it.
- **`baselineContext`** — optional retrospective line from prior completed cycles (`buildCycleComparisonStructured`); guards in `buildBaselineContext`. See [docs/CURRENT_CYCLE_SUMMARY_MATRIX.md](CURRENT_CYCLE_SUMMARY_MATRIX.md).
- **`compactSupportField`** — selects which single line the compact banner shows: `guidance` | `completeness` | `interpretationNote` | `baselineContext`.
- Calendar/PDF still use **Dry/Damp/Wet/Peak-type** via `mucusChartStrengthLabel` where applicable.

**Banner layout (mobile `StatusBanner`)**

1. `focusQualification` (if any) — muted  
2. `headline`  
3. `confidence`  
4. `cycleDay` (if any) — **Cycle Day** {n}  
5. `completeness` — shown under cycle day when it is **not** duplicated as the selected support line  
6. **One support line** resolved from `compactSupportField` (`guidance`, `baselineContext`, `completeness`, or first `interpretationNote`)

See [docs/CURRENT_CYCLE_SUMMARY_MATRIX.md](CURRENT_CYCLE_SUMMARY_MATRIX.md).

**Tone**

- Engine emits `summaryTone`: `neutral` | `caution` | `positive` (no hex). UI maps to `BANNER_TONE_*` / `BG_CARD_GRADIENT_START` in `apps/mobile/src/theme/colors.ts`.

**Messaging principles (human, not mechanical)**

- Headlines and guidance should **name the user’s situation** (e.g. missing day blocking Peak confirmation) rather than abstract system nouns (“interpretation,” “validation”).  
- Prefer **plain language** alongside any reliability line; avoid repeating identical sentence templates for every branch.  
- **`interpretationWarnings`** on `CycleResult` drive **`interpretationNotes`** in the summary; copy is **deterministic** from a closed set of templates (see `InterpretationWarningId` in types and `WARNING_COPY` in `currentCycleSummary.ts`).  
- Iteration: expand the banner copy matrix as new `CycleResult` fields stabilize; UI remains layout-only for tone/typography, not inference.

## In-app help copy (Understanding Your Chart)

Long-form user education for Help and related UI is **not** inlined in the mobile app; it lives in **`core/rulesEngine/src/observationEducationCopy.ts`** and is re-exported from the `core-rules-engine` package so copy stays aligned with engine behavior and this spec.

- **`HELP_STATUS_MESSAGE_SECTIONS`** — Readonly list of `{ title, body }` entries that explain common **status headline themes** (e.g. menstrual flow, tracking, fertile pattern, Peak not confirmed, post-peak, missing observation). Live banner **`headline`** strings from **`buildCurrentCycleSummary`** are **aligned to these themes** (see [docs/CURRENT_CYCLE_SUMMARY_MATRIX.md](CURRENT_CYCLE_SUMMARY_MATRIX.md)).
- **`HELP_SENSATION_APPEARANCE_BODY`**, **`HELP_WHAT_IS_PEAK_DAY_BODY`**, color-guide strings, and related exports — same module; update here when education copy changes.

**Manual QA matrix**

| Scenario | Expect |
|----------|--------|
| No entries | Empty-state summary; no `focusQualification`. |
| Today in last slice, charted | `focusQualification` null; headline follows phase / primary-class rules (not overridden by `no_peak`). |
| Today not in last slice (non-empty slice) | Non-null `focusQualification`; focus = last row. |
| `entry.missing` on focus day | Observation-needed headline; caution tone; **Low confidence — missing observations**. |
| Missing in recent window, focus complete | **Low confidence — recent observations missing**. |
| Slice `no_peak`, dry focus day charted | **Tracking** headline (not a generic “peak not yet identified” for all days); Moderate confidence when window clean. |
| Slice `no_peak`, fertile focus day | **Fertile pattern — Peak not confirmed yet** (when phase is `fertile_unconfirmed_peak`); guidance per `buildCurrentCycleSummary`. |
| Confirmed peak, P+1–P+2 | **Peak day identified**; **guidance** for day count; Moderate confidence. |
| P+3 | **Post-peak phase** headline; **guidance** for post-peak confirmation; High — Peak confirmed. |
| Post-peak | **Post-peak phase** headline; High — Peak confirmed when recent window intact. |
| Several `missing: true` in slice | Completeness line includes them in the total. |
| Interior date gap (no row between first and last logged dates in slice) | Completeness line count includes those days. |
| Last log before `calendarAsOfDate`, slice not `complete` | Completeness includes unlogged days from day after last log through `calendarAsOfDate`. |
| Slice `complete` | No trailing gap count after last logged date (only explicit missing + interior gaps within first→last span). |
| `interpretationWarnings` non-empty (e.g. `uncertain_fertile_start`) | `interpretationNotes` populated; compact banner may show one note when priority selects `interpretationNote`. |
| Prior cycles + baselineComparison | Optional **`baselineContext`** when guards pass; see [docs/CURRENT_CYCLE_SUMMARY_MATRIX.md](CURRENT_CYCLE_SUMMARY_MATRIX.md). |

## Rules Engine Verification Examples

This section provides reference cycles used to verify the correctness of the rules engine.

Each scenario describes:
- daily observations
- computed mucus rank
- expected interpretation

These examples serve as canonical test cases. The engineering implementation must include automated tests that replicate each scenario; each example must correspond to a unit test. Rules engine must maintain 100% test coverage.

### Example 1 — Always Dry Cycle

**Purpose:** Verify that the system does not open a fertile window when no fertility signs exist.

**Input**

| Day | Sensation | Appearance | Rank |
|-----|-----------|------------|------|
| 1   | dry       | none       | 0    |
| 2   | dry       | none       | 0    |
| 3   | dry       | none       | 0    |
| 4   | dry       | none       | 0    |
| 5   | dry       | none       | 0    |

**Expected Output**

- `fertileStartIndex` = null  
- `peakIndex` = null  
- `fertileEndIndex` = null  

**Phase Labels:** All days labeled `dry`.

---

### Example 2 — Simple Fertile Cycle With Clear Peak

**Purpose:** Verify normal peak identification.

**Input**

| Day | Sensation | Appearance | Rank |
|-----|-----------|------------|------|
| 1   | dry       | none       | 0    |
| 2   | damp      | cloudy     | 1    |
| 3   | wet       | cloudy     | 2    |
| 4   | slippery  | clear      | 3    |
| 5   | damp      | cloudy     | 1    |
| 6   | dry       | none       | 0    |
| 7   | dry       | none       | 0    |

**Expected Output**

- `fertileStartIndex` = 2  
- `peakIndex` = 4  
- `fertileEndIndex` = 7  

**Phase Labels**

| Day | Label            |
|-----|------------------|
| 1   | dry              |
| 2   | fertile_open     |
| 3   | fertile_open     |
| 4   | peak_confirmed   |
| 5   | p_plus_1         |
| 6   | p_plus_2         |
| 7   | p_plus_3         |

---

### Example 3 — Peak Reset Scenario

**Purpose:** Verify that a candidate peak is replaced if a higher-quality sign appears before confirmation completes.

**Input**

| Day | Rank |
|-----|------|
| 1   | 0    |
| 2   | 1    |
| 3   | 3    |
| 4   | 1    |
| 5   | 3    |
| 6   | 1    |
| 7   | 0    |
| 8   | 0    |

**Interpretation:** Day 3 initially appears to be peak. Day 5 contains equal peak-quality mucus, so candidate peak resets to Day 5.

**Expected Output**

- `fertileStartIndex` = 2  
- `peakIndex` = 5  
- `fertileEndIndex` = 8  

---

### Example 4 — Continuous High-Quality Mucus

**Purpose:** Verify that peak cannot be confirmed when mucus does not decline.

**Input**

| Day | Rank |
|-----|------|
| 1   | 0    |
| 2   | 1    |
| 3   | 3    |
| 4   | 3    |
| 5   | 3    |
| 6   | 3    |

**Expected Output**

- `fertileStartIndex` = 2  
- `peakIndex` = null  
- `fertileEndIndex` = null  

**Phase Labels:** Days 2–6 labeled `fertile_unconfirmed_peak`.

---

### Example 5 — Missing Day Prevents Peak Confirmation

**Purpose:** Verify that missing chart data prevents confirmation of peak.

**Input**

| Day | Rank   |
|-----|--------|
| 1   | 0      |
| 2   | 1      |
| 3   | 3      |
| 4   | missing|
| 5   | 1      |
| 6   | 0      |

**Expected Output**

- `fertileStartIndex` = 2  
- `peakIndex` = null  
- `fertileEndIndex` = null  

**Reason:** Peak confirmation requires three consecutive recorded days. Because Day 4 is missing, confirmation cannot occur.

---

### Example 6 — Gradual Decline After Peak

**Purpose:** Verify that peak is still valid when mucus declines gradually.

**Input**

| Day | Rank |
|-----|------|
| 1   | 0    |
| 2   | 1    |
| 3   | 3    |
| 4   | 2    |
| 5   | 2    |
| 6   | 1    |

**Expected Output**

- `fertileStartIndex` = 2  
- `peakIndex` = 3  
- `fertileEndIndex` = 6  

**Explanation:** Although mucus does not drop immediately to zero, the three days after peak remain below peak rank. Therefore peak is confirmed.

---

### Example 7 — Continuous Low-Quality Fertility Signs

**Purpose:** Verify behavior when only low-quality mucus exists.

**Input**

| Day | Rank |
|-----|------|
| 1   | 0    |
| 2   | 1    |
| 3   | 1    |
| 4   | 1    |
| 5   | 1    |
| 6   | 1    |

**Expected Output**

- `fertileStartIndex` = 2  
- `peakIndex` = null  
- `fertileEndIndex` = null  

**Explanation:** Peak-quality mucus (rank 3) never occurs, so peak cannot be identified.

---

### Example 7B — Flow bleeding blocks fertile opening

**Purpose:** Verify that **flow** bleeding (`heavy`, `moderate`, `light`, or `spotting`) prevents assigning **`fertileStartIndex`** on that day even when mucus rank ≥ 1; fertile opening is the first non-flow day with mucus after cycle start.

**Input (ISO dates; ranks via `mucusRankOverride` in tests)**

| Date       | Bleeding | Rank |
|------------|----------|------|
| 2026-01-01 | heavy    | 0    |
| 2026-01-02 | light    | 2    |
| 2026-01-03 | none     | 1    |

**Expected output**

- `fertileStartIndex` = index of 2026-01-03 (third row)  
- `fertileStartReason` = `first_mucus_after_dry`  

**Explanation:** Day 2 is still a flow day (`light`), so it cannot be fertile start despite rank 2. Day 3 is the first eligible day after flow with mucus.

---

### Example 8 — Editing Past Data Recalculates Peak

**Purpose:** Verify recalculation behavior.

**Initial Input**

| Day | Rank |
|-----|------|
| 1   | 0    |
| 2   | 1    |
| 3   | 3    |
| 4   | 1    |
| 5   | 0    |
| 6   | 0    |

**Initial Result:** `peakIndex` = 3

**User Edits:** Day 4 → rank becomes 3

**New Input**

| Day | Rank |
|-----|------|
| 1   | 0    |
| 2   | 1    |
| 3   | 3    |
| 4   | 3    |
| 5   | 0    |
| 6   | 0    |

**Expected Result:** `peakIndex` = 4

**Explanation:** Editing past entries must trigger full recalculation.

---

### Example 9 — Bleeding Reset (Cycle Boundary)

**Purpose:** Verify that heavy/moderate bleeding resets the cycle start and labels earlier days as `previous_cycle`.

**Input (mid-cycle reset)**

| Day | Bleeding | Rank |
|-----|----------|------|
| 1   | none     | 3    |
| 2   | none     | 1    |
| 3   | heavy    | 0    |
| 4   | moderate | 0    |
| 5   | none     | 1    |

**Expected Output**

- Days 1-2 labeled `previous_cycle`
- Cycle starts at day 3
- `fertileStartIndex` = 5

**Explanation:** Heavy bleeding on day 3 (not preceded by heavy/moderate) triggers a new cycle start. Days before the cycle start are labeled `previous_cycle`.

---

## Notes

- `mucusRankOverride` on `DailyEntry` is a test/fixture-only field that bypasses the sensation/appearances rank calculation. It must not be exposed in any user-facing interface.
- The `Stretch` type and `stretch` field have been removed. Sticky, tacky, and stretchy are now sensation values.
- `Appearance` is now a multi-select array (`appearances: Appearance[]`) with 10 options aligned to the Creighton letter codes.
- `Lubricative` appearance promotes damp/shiny/wet sensations to code 10DL/10SL/10WL (rank 3).
- Legacy data migration (v3): `slippery` → `wet` + `lubricative`; `stretch` values merged into `sensation`; `appearance` (single) → `appearances` (array).
- Legacy `timesObserved` values are migrated to the `frequency` field on load.

## Multi-Cycle Layer

The rules engine includes a multi-cycle utility module (`core/rulesEngine/src/multiCycle.ts`) that builds on top of the single-cycle `recalculateCycle()` function. It does **not** modify the core rules engine.

### Functions

- **`splitIntoCycles(entries)`** — Takes a flat, date-sorted array of `DailyEntry` objects and splits them into individual `CycleSlice` objects. A new cycle starts on the first day of heavy or moderate bleeding that is not a continuation of an existing heavy/moderate bleeding sequence (same bleeding reset rule as the core engine). Any leading days at the start of the chart that have **no** heavy or moderate bleeding are merged into the first cycle (the one that begins on that first heavy/moderate day), so history does not show a spurious one-day “cycle” from spotting/light-only days before flow.
- **`computeCycleSummary(cycles)`** — Accepts an array of `CycleSlice` and returns aggregate statistics: total cycles tracked, average cycle length, average peak day, and average luteal phase.
- **`generateInsights(cycles)`** — Accepts an array of `CycleSlice` (requires ≥ 2 completed cycles) and returns human-readable insight strings covering peak day range, typical fertile window start, luteal phase average, and cycle consistency.

### CycleSlice interface

Each `CycleSlice` contains:

- `cycleNumber` — 1-indexed, oldest first
- `startDate` / `endDate` — ISO date strings
- `entries` — subset of `DailyEntry[]` for this cycle
- `result` — `CycleResult` from `recalculateCycle()`
- `length` — number of days
- `peakDay` — cycle day number (1-indexed) or `null`
- `lutealPhase` — days from peak+1 to next cycle start, or `null`
- `status` — `'complete'` | `'in_progress'` | `'no_peak'`

### Invariants

- Multi-cycle functions are pure and deterministic.
- They never mutate the input array.
- They delegate all single-cycle logic to `recalculateCycle()`.

## Future TODO
- Manual override support by trained user (not implemented in MVP).
