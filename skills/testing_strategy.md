# Testing Strategy

The rules engine must maintain 100% test coverage.

Each verification example in the PRD and in `docs/RULES_ENGINE_SPEC.md` (including **Example 7B** — flow bleeding blocks fertile opening) must be implemented as a unit test.

Tests must cover:

dry cycles
simple peak detection
peak reset behavior
continuous high-quality mucus
flow blocks fertile opening (Example 7B)
missing days
gradual decline after peak
recalculation after edits
bleeding reset (cycle boundary)
multi-cycle splitting (splitIntoCycles), including leading non–heavy/moderate days merged into the first period cycle
cycle summary aggregation (computeCycleSummary)
insight generation (generateInsights)

Tests must run automatically in CI.

Any change to the rules engine must update tests accordingly.
