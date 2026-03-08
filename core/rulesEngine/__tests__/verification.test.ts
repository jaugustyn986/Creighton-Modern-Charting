// These tests correspond 1:1 to "Rules Engine Verification Examples" in
// docs/RULES_ENGINE_SPEC.md. If you add/change an example in the spec,
// update the corresponding test here and the fixture in fixtures/.

import { recalculateCycle } from '../src/recalc';
import { DailyEntry } from '../src/types';

const byRanks = (ranks: Array<number | null>): Array<DailyEntry | null> =>
  ranks.map((rank) => {
    if (rank === null) return { missing: true };
    return { mucusRankOverride: rank, bleeding: 'none' } as DailyEntry;
  });

describe('Spec Verification Examples', () => {
  it('Example 1 — Always Dry Cycle', () => {
    const entries: DailyEntry[] = [
      { sensation: 'dry', appearance: 'none' },
      { sensation: 'dry', appearance: 'none' },
      { sensation: 'dry', appearance: 'none' },
      { sensation: 'dry', appearance: 'none' },
      { sensation: 'dry', appearance: 'none' },
    ];
    const result = recalculateCycle(entries);
    expect(result.fertileStartIndex).toBeNull();
    expect(result.peakIndex).toBeNull();
    expect(result.fertileEndIndex).toBeNull();
    expect(result.phaseLabels).toEqual(['dry', 'dry', 'dry', 'dry', 'dry']);
  });

  it('Example 2 — Simple Fertile Cycle With Clear Peak', () => {
    const entries: DailyEntry[] = [
      { sensation: 'dry', appearance: 'none' },
      { sensation: 'damp', appearance: 'cloudy' },
      { sensation: 'wet', appearance: 'cloudy' },
      { sensation: 'slippery', appearance: 'clear' },
      { sensation: 'damp', appearance: 'cloudy' },
      { sensation: 'dry', appearance: 'none' },
      { sensation: 'dry', appearance: 'none' },
    ];
    const result = recalculateCycle(entries);
    expect(result.fertileStartIndex).toBe(1);
    expect(result.peakIndex).toBe(3);
    expect(result.fertileEndIndex).toBe(6);
    expect(result.phaseLabels).toEqual([
      'dry',
      'fertile_open',
      'fertile_open',
      'peak_confirmed',
      'p_plus_1',
      'p_plus_2',
      'p_plus_3',
    ]);
  });

  it('Example 3 — Peak Reset Scenario', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, 1, 3, 1, 0, 0]));
    expect(result.fertileStartIndex).toBe(1);
    expect(result.peakIndex).toBe(4);
    expect(result.fertileEndIndex).toBe(7);
  });

  it('Example 4 — Continuous High-Quality Mucus', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, 3, 3, 3]));
    expect(result.fertileStartIndex).toBe(1);
    expect(result.peakIndex).toBeNull();
    expect(result.fertileEndIndex).toBeNull();
    expect(result.phaseLabels).toEqual([
      'dry',
      'fertile_unconfirmed_peak',
      'fertile_unconfirmed_peak',
      'fertile_unconfirmed_peak',
      'fertile_unconfirmed_peak',
      'fertile_unconfirmed_peak',
    ]);
  });

  it('Example 5 — Missing Day Prevents Peak Confirmation', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, null, 1, 0]));
    expect(result.fertileStartIndex).toBe(1);
    expect(result.peakIndex).toBeNull();
    expect(result.fertileEndIndex).toBeNull();
  });

  it('Example 6 — Gradual Decline After Peak', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, 2, 2, 1]));
    expect(result.fertileStartIndex).toBe(1);
    expect(result.peakIndex).toBe(2);
    expect(result.fertileEndIndex).toBe(5);
    expect(result.phaseLabels).toEqual([
      'dry',
      'fertile_open',
      'peak_confirmed',
      'p_plus_1',
      'p_plus_2',
      'p_plus_3',
    ]);
  });

  it('Example 7 — Continuous Low-Quality Fertility Signs', () => {
    const result = recalculateCycle(byRanks([0, 1, 1, 1, 1, 1]));
    expect(result.fertileStartIndex).toBe(1);
    expect(result.peakIndex).toBeNull();
    expect(result.fertileEndIndex).toBeNull();
    expect(result.phaseLabels).toEqual([
      'dry',
      'fertile_unconfirmed_peak',
      'fertile_unconfirmed_peak',
      'fertile_unconfirmed_peak',
      'fertile_unconfirmed_peak',
      'fertile_unconfirmed_peak',
    ]);
  });

  it('Example 8 — Editing Past Data Recalculates Peak', () => {
    const before = recalculateCycle(byRanks([0, 1, 3, 1, 0, 0]));
    expect(before.peakIndex).toBe(2);

    // After editing day 4 to rank 3, candidate resets to index 3.
    // Need 7 entries so P+3 (index 6) exists for confirmation.
    const after = recalculateCycle(byRanks([0, 1, 3, 3, 0, 0, 0]));
    expect(after.peakIndex).toBe(3);
  });

  it('Example 9 — Bleeding Reset (Cycle Boundary)', () => {
    const entries: DailyEntry[] = [
      { bleeding: 'none', mucusRankOverride: 3 },
      { bleeding: 'none', mucusRankOverride: 1 },
      { bleeding: 'heavy', mucusRankOverride: 0 },
      { bleeding: 'moderate', mucusRankOverride: 0 },
      { bleeding: 'none', mucusRankOverride: 1 },
    ];
    const result = recalculateCycle(entries);
    expect(result.phaseLabels[0]).toBe('previous_cycle');
    expect(result.phaseLabels[1]).toBe('previous_cycle');
    expect(result.fertileStartIndex).toBe(4);
  });
});
