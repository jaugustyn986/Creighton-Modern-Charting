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

The rules engine must never depend on:

React
Expo
UI state
Local storage

The engine must always be testable in isolation.
