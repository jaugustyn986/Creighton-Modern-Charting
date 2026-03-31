# Rules Engine Architecture

The rules engine is the core logic of the application.

Location

/core/rulesEngine

The rules engine must be completely independent from UI.

Constraints

Pure functions only.

No side effects.

No network calls.

No persistent storage.

The engine accepts cycle data and returns a computed result.

Function signature example:

recalculateCycle(entries: DailyEntryInput[]): CycleResult

The engine performs:

1. mucus ranking and per-day mucus-derived classification (`mucusDerivedByDay`: peak-type vs lubricative/stretchy flags, classification enum for labels)
2. fertile window start detection (flow-aware; `fertileStartReason` when uncertain)
3. peak candidate detection and calendar-based P+3 confirmation (`peakCandidateIndex`, `peakConfirmed`)
4. fertile window end detection (`fertileEndIndex` on the calendar day of P+3)
5. per-day bleeding classification (`bleedingClassByDay`, `brownBleedingContextByDay`)
6. interpretation warnings (`InterpretationWarningId[]`) and `dataComplete` (true iff warnings are empty)
7. primary day classification (`primaryDayClassByDay`) for calendar color and copy (bleeding-aware vs raw mucus rank)
8. phase labeling (calendar-aligned to Peak Day and P+1–P+3)

Multi-cycle layer (core/rulesEngine/src/multiCycle.ts):

splitIntoCycles(entries) — splits sorted entries into individual CycleSlice objects by bleeding boundaries; leading days with no heavy/moderate bleeding before the first such day are merged into that first period cycle (avoids a spurious one-day “cycle” in history UI)
computeCycleSummary(cycles) — aggregate stats (avg length, peak day, luteal phase)
generateInsights(cycles) — human-readable insight strings (requires 2+ completed cycles)

These functions wrap recalculateCycle() without modifying it.

The mobile app consumes this package by name: **`core-rules-engine`** (npm workspace). Do not import the engine from React components using deep relative paths into `core/rulesEngine/src`.

The rules engine must never depend on:

React
Expo
UI state
Local storage

The engine must always be testable in isolation.
