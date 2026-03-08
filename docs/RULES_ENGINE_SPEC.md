# Rules Engine Specification (Source of Truth)

> This module must be deterministic, pure, and non-predictive. AI, forecasting, or probabilistic scoring are explicitly forbidden.

## Mucus Rank Mapping
Given a daily entry or observation:
1. If `sensation == dry` and `appearance == none` => rank `0`.
2. If `sensation == slippery` OR `appearance == clear` OR `appearance == stretchy` => rank `3`.
3. If `sensation == wet` => rank `2`.
4. If `sensation == damp` => rank `1`.
5. If `appearance` is not `none` (any visible mucus) => rank `1`.
6. Else => rank `0`.

If multiple observations exist in one day, daily rank is the `max(observationRanks)`.

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

- `mucusRankOverride` on `DailyEntry` is a test/fixture-only field that bypasses the sensation/appearance rank calculation. It must not be exposed in any user-facing interface.

## Multi-Cycle Layer

The rules engine includes a multi-cycle utility module (`core/rulesEngine/src/multiCycle.ts`) that builds on top of the single-cycle `recalculateCycle()` function. It does **not** modify the core rules engine.

### Functions

- **`splitIntoCycles(entries)`** — Takes a flat, date-sorted array of `DailyEntry` objects and splits them into individual `CycleSlice` objects. A new cycle starts on the first day of heavy or moderate bleeding that is not a continuation of an existing heavy/moderate bleeding sequence (same bleeding reset rule as the core engine).
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
