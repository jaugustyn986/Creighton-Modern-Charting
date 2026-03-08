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

1. mucus ranking
2. fertile window start detection
3. peak candidate detection
4. peak confirmation
5. fertile window end detection
6. phase labeling

Multi-cycle layer (core/rulesEngine/src/multiCycle.ts):

splitIntoCycles(entries) — splits sorted entries into individual CycleSlice objects by bleeding boundaries
computeCycleSummary(cycles) — aggregate stats (avg length, peak day, luteal phase)
generateInsights(cycles) — human-readable insight strings (requires 2+ completed cycles)

These functions wrap recalculateCycle() without modifying it.

The rules engine must never depend on:

React
Expo
UI state
Local storage

The engine must always be testable in isolation.
