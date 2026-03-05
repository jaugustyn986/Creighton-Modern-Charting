# Testing Strategy

The rules engine must maintain 100% test coverage.

Each verification example in the PRD must be implemented as a unit test.

Tests must cover:

dry cycles
simple peak detection
peak reset behavior
continuous high-quality mucus
missing days
gradual decline after peak
recalculation after edits

Tests must run automatically in CI.

Any change to the rules engine must update tests accordingly.
