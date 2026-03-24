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

## Fertile Start
- Fertile start is the first day after cycle start where `mucus_rank >= 1`.
- If no such day exists, fertile start is `null`.

## Peak Candidate & Confirmation (P+3 Rule)
- Any day with rank `3` can be a peak candidate.
- A candidate is confirmed only when `candidate+1`, `candidate+2`, `candidate+3` all exist and have ranks strictly lower than candidate rank.
- If any confirmation day is missing (`null`, undefined, or `missing: true`), confirmation is blocked.
- If during waiting period a day has rank `>= candidate rank`, candidate resets to that later day.
- When confirmed: `peak_day = candidate`, `fertile_end = peak_day + 3` inclusive.
- If never confirmed: `peak_day = null`, `fertile_end = null`.

## Recalculation
- Recompute ranks and cycle labels for all entries whenever any entry changes.
- Same inputs must always return identical outputs.
- No network calls and no randomness allowed.

## Missing-Day Behavior
- Missing days do not get inferred values.
- Missing days block peak confirmation where relevant.

## Bleeding Reset Rule
- A new cycle begins on the first day of heavy or moderate bleeding that is not a continuation of an existing heavy/moderate bleeding sequence.
- Days before the most recent cycle start are labeled `previous_cycle`.

## Output Requirements
`CycleResult` must include:
- `peakIndex`
- `fertileStartIndex`
- `fertileEndIndex`
- `phaseLabels[]`
- `mucusRanks[]`

## Current cycle summary (calendar banner)

The mobile calendar header shows a deterministic **`CurrentCycleSummary`** from `buildCurrentCycleSummary` in `core/rulesEngine/src/currentCycleSummary.ts` (exported as `core-rules-engine`). Copy and interpretation live in the engine; the UI only lays out fields and maps **`summaryTone`** to background tokens.

**Inputs (last `CycleSlice` only)**

- `entries` — that slice’s `DailyEntry[]` (same slice as `splitIntoCycles` + `recalculateCycle` for that slice).
- `result` — `CycleResult` for that slice.
- `status` — slice `status`: `complete` | `in_progress` | `no_peak`.
- `todayIndex` — index within the slice for calendar “today”, or `null` if today has no row in that slice.
- `calendarAsOfDate` (optional, YYYY-MM-DD) — device “today” when building the summary in the app. Used for completeness trailing gaps (see below). Omitted in tests or non-UI callers that only need interior-gap / explicit-missing behavior without trailing.

**Focus row**

- `focusIndex = todayIndex` when `todayIndex !== null`, otherwise `entries.length - 1` (last logged day in the slice).
- When `todayIndex === null` and the slice is non-empty, **`focusQualification`** is: **`No entry today. Showing your last logged day.`**

**Headline priority (deterministic)**

1. Missing data at the focus row (`missing: true` or phase `missing`) → observation-needed headline.
2. Slice `status === 'no_peak'` → **Peak not yet identified** (no “late cycle” threshold).
3. Phase `fertile_unconfirmed_peak` → **Pattern not yet clear**.
4. Otherwise phase-derived headline: present-state first — **`p_plus_3`** uses **Post-peak phase** (same as **`post_peak`**), not “Peak day identified”; **`peak_confirmed`**, **`p_plus_1`**, **`p_plus_2`** use **Peak day identified**; **`dry`** uses shortened **Dry pattern**; see `headlineFromPhase` in code.
5. Safe fallback string if needed.

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

**Completeness line (tightened copy)**

- **0** per completeness total above: **`No missing entries this cycle`**
- **1:** **`1 missing entry this cycle`**
- **N:** **`N missing entries this cycle`**
- Empty slice uses a separate short completeness string (see implementation).

**Guidance and `supportingContext`**

- Primary explanatory copy for each branch lives in **`guidance`** (one short, Creighton-aware line; deterministic table in `buildCurrentCycleSummary`).
- **`supportingContext`** is normally **`''`** so the card stays scannable; reserved for an optional future extra line without duplicating `guidance`.
- No separate banner “chart signal” line; calendar/PDF still use **Dry/Damp/Wet/Peak-type** via `mucusChartStrengthLabel` where applicable.

**Banner field order (mobile)**

1. `focusQualification` (if any) — subordinate styling (smaller / muted)  
2. `headline`  
3. `confidence`  
4. `cycleDay` (if any) — label **Cycle Day** {n}  
5. `completeness`  
6. `supportingContext` (omitted when empty)  
7. `guidance` — optional subtle top border above this row

**Tone**

- Engine emits `summaryTone`: `neutral` | `caution` | `positive` (no hex). UI maps to `BANNER_TONE_*` / `BG_CARD_GRADIENT_START` in `apps/mobile/src/theme/colors.ts`.

**Manual QA matrix**

| Scenario | Expect |
|----------|--------|
| No entries | Empty-state summary; no `focusQualification`. |
| Today in last slice, charted | `focusQualification` null; headline follows phase/status rules. |
| Today not in last slice (non-empty slice) | Non-null `focusQualification`; focus = last row. |
| `entry.missing` on focus day | Observation-needed headline; caution tone; **Low confidence — missing observations**. |
| Missing in recent window, focus complete | **Low confidence — recent observations missing**. |
| Slice `no_peak`, focus charted | **Peak not yet identified**; caution tone; Moderate confidence. |
| Confirmed peak, P+1–P+2 | **Peak day identified**; Creighton-aware **guidance** only; Moderate confidence. |
| P+3 | **Post-peak phase** headline; **guidance** `Three days past Peak confirm the post-Peak phase.`; High — Peak confirmed. |
| Post-peak | **Post-peak phase** headline; short post-Peak **guidance**; High — Peak confirmed when recent window intact. |
| Several `missing: true` in slice | Completeness line includes them in the total. |
| Interior date gap (no row between first and last logged dates in slice) | Completeness line count includes those days. |
| Last log before `calendarAsOfDate`, slice not `complete` | Completeness includes unlogged days from day after last log through `calendarAsOfDate`. |
| Slice `complete` | No trailing gap count after last logged date (only explicit missing + interior gaps within first→last span). |

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
