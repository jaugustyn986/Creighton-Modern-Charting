# Current cycle summary matrix (calendar status banner)

**Single source of implementation:** `core/rulesEngine/src/currentCycleSummary.ts` (`buildCurrentCycleSummary`) and `core/rulesEngine/src/cycleComparisonSummary.ts` (`buildCycleComparisonStructured`). Exported as `core-rules-engine`.

**Help glossary alignment:** User-education titles for the same *themes* live in `core/rulesEngine/src/observationEducationCopy.ts` → **`HELP_STATUS_MESSAGE_SECTIONS`**. Banner **headline** strings are chosen to match those themes (wording aligned where possible). The glossary is explanatory; the engine strings are what the live banner shows.

**When changing copy or rules:** Update `currentCycleSummary.ts` first, then `HELP_STATUS_MESSAGE_SECTIONS` if themes drift, then this doc. Add or adjust tests in `core/rulesEngine/__tests__/currentCycleSummary.test.ts`.

---

## Headline (by evaluation order)

`buildCurrentCycleSummary` applies **primary-class and missing overrides before phase**. Slice **`status`** (e.g. `no_peak`) does **not** replace phase headlines — the user sees the phase-appropriate title even when Peak is not yet confirmed for the cycle.

| Order | Condition | Headline |
|-------|-----------|----------|
| 1 | Focus row missing (`missing` or phase `missing`) | **Observation needed for this day** |
| 2 | `primaryClass === 'menstrual_flow'` | **Menstrual flow** |
| 3 | `primaryClass === 'spotting'` | **Spotting** |
| 4 | `phase === 'fertile_unconfirmed_peak'` | **Fertile pattern — Peak not confirmed yet** (guidance varies by whether `peakCandidateIndex` is set) |
| 5 | Else | **`headlineFromPhase(phase)`** — see table below |

### `headlineFromPhase(phase)` (phase-only; no menstrual/spotting/missing here)

| `PhaseLabel` | Headline |
|--------------|----------|
| `dry`, `previous_cycle` | **Tracking** |
| `fertile_open` | **Fertile pattern** |
| `fertile_unconfirmed_peak` | **Fertile pattern — Peak not confirmed yet** (normally handled in branch 4 above) |
| `peak_confirmed`, `p_plus_1`, `p_plus_2` | **Peak day identified** |
| `p_plus_3`, `post_peak` | **Post-peak phase** |
| `missing` | **Missing observation** |
| default | **Tracking** |

---

## Confidence (`confidence` string)

Evaluated in `computeConfidenceLine` (recent window = last 3 slice indices ending at focus).

| Condition | Line |
|-----------|------|
| Focus row missing | **Low confidence — missing observations** |
| Any missing in recent window (focus row complete) | **Low confidence — recent observations missing** |
| Slice `status === 'no_peak'` | **Moderate confidence — pattern still forming** |
| `fertile_unconfirmed_peak` | **Moderate — pattern still forming** |
| `p_plus_1` / `p_plus_2` | **Moderate — pattern still forming** |
| `peak_confirmed` / `p_plus_3` / `post_peak` | **High confidence — Peak confirmed** |
| `fertile_open` / `dry` / `previous_cycle` | **Moderate — pattern still forming** |
| default | **Moderate — pattern still forming** |

---

## Support line selection (`compactSupportField`)

The mobile **StatusBanner** shows **one** primary support string from this priority (first match):

| Priority | Field | When |
|----------|-------|------|
| 1 | `interpretationNote` | `focusMissing && interpretationNotes.length > 0` |
| 2 | `completeness` | `Low confidence && missingCount > 0` |
| 3 | `baselineContext` | Non-null baseline string (see below) |
| 4 | `guidance` | Default |

Resolve the displayed string: `guidance` | `baselineContext` | `completeness` | `interpretationNotes[0]` per field.

---

## Baseline context (`baselineContext`)

Optional; requires **`baselineComparison`** from `buildCycleComparisonStructured(currentSlice, allSlices)` (mobile: `useCurrentCycleSummaryFromCycles`).

**Global guards:** No baseline if `comparison` absent, **`confidence` starts with `Low confidence`**, or **`priorSampleSize < 2`**.

**Additional suppression:** Baseline is cleared when **`primaryClass === 'menstrual_flow'`** (spotting is **not** suppressed — spotting with mucus uses `mucus_observed` / `peak_type`; pure spotting may still show phase-appropriate baseline).

| Phase | Baseline text (when applicable) |
|-------|--------------------------------|
| `dry` / `previous_cycle` | If `avgFertileStartDay` known and `cycleDay < avgFertileStartDay`: *Your cycles have typically shown fertile signs starting around day {avg}.* |
| `fertile_open` | If `avgPeakDay` known: *Peak has usually occurred around day {avg} in your previous cycles.* |
| `fertile_unconfirmed_peak` | Same as `fertile_open` (uses **day number**, not vague “this point in the cycle”). |
| `peak_confirmed` / `post_peak` | If `peakVsPrior` is `earlier` or `later`: *Peak occurred earlier/later than your usual pattern.* |
| `p_plus_1`, `p_plus_2`, `p_plus_3` | No baseline (guidance only). |

---

## Completeness (`completeness`)

Unchanged: explicit `missing: true` rows + interior calendar gaps + trailing gaps through `calendarAsOfDate` for in-progress slices. See `RULES_ENGINE_SPEC.md` (Current cycle summary section).

**Mobile:** StatusBanner shows **`completeness`** as a **secondary line under Cycle Day** when it is **not** already the selected `compactSupportField` (avoids duplicating the same line when Low confidence selects completeness as the support line).

---

## Other engine fields (banner / exports)

| Field | Role |
|-------|------|
| `supportingContext` | Still computed for tests/traceability; compact UI does not show it. |
| `interpretationNotes` | Full list from `interpretationWarnings`; compact UI shows **at most one** line when `compactSupportField === 'interpretationNote'`. |
| `guidance` | Primary non-baseline line when selected. |
| `summaryTone` | `neutral` \| `caution` \| `positive` → banner background tokens. |

---

## Mobile layout (`StatusBanner.tsx`)

Typical order:

1. `focusQualification` (if any)
2. `headline`
3. `confidence`
4. `cycleDay` (if non-null)
5. `completeness` (if not duplicate of support line)
6. Single **support line** from `compactSupportField`

---

## Scenario reference (quick QA)

| Situation | Expect headline theme | Notes |
|-----------|------------------------|--------|
| Empty slice | *Your cycle will appear here* | Empty-state object |
| Dry days, no peak in slice | **Tracking** | Not “Peak not yet identified” |
| Fertile, peak not confirmed | **Fertile pattern — Peak not confirmed yet** | |
| P+1 / P+2 | **Peak day identified** | Moderate confidence |
| P+3 / post-peak | **Post-peak phase** | High confidence when window clean |
| Focus missing | **Observation needed for this day** | Low confidence |

---

## Related files

| File | Purpose |
|------|---------|
| `core/rulesEngine/src/currentCycleSummary.ts` | Summary builder |
| `core/rulesEngine/src/cycleComparisonSummary.ts` | `CycleComparisonStructured`, `avgPeakDay`, `avgFertileStartDay` |
| `core/rulesEngine/src/observationEducationCopy.ts` | `HELP_STATUS_MESSAGE_SECTIONS` glossary |
| `apps/mobile/src/hooks/useCurrentCycleSummary.ts` | Passes `baselineComparison` |
| `apps/mobile/src/components/StatusBanner.tsx` | Compact layout |
