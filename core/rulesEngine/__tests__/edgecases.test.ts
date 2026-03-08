import { recalculateCycle } from '../src/recalc';
import { DailyEntry } from '../src/types';

const byRanks = (ranks: Array<number | null>): Array<DailyEntry | null> =>
  ranks.map((rank) => {
    if (rank === null) return { missing: true };
    return { mucusRankOverride: rank, bleeding: 'none' };
  });

describe('rules engine edge cases', () => {
  it('Always dry', () => {
    const result = recalculateCycle(byRanks([0, 0, 0, 0]));
    expect(result.fertileStartIndex).toBeNull();
    expect(result.peakIndex).toBeNull();
    expect(result.fertileEndIndex).toBeNull();
    expect(result.phaseLabels).toEqual(['dry', 'dry', 'dry', 'dry']);
  });

  it('Simple Peak', () => {
    const result = recalculateCycle(byRanks([0, 0, 1, 2, 3, 0, 0, 0]));
    expect(result.fertileStartIndex).toBe(2);
    expect(result.peakIndex).toBe(4);
    expect(result.fertileEndIndex).toBe(7);
    expect(result.phaseLabels).toEqual(['dry', 'dry', 'fertile_open', 'fertile_open', 'peak_confirmed', 'p_plus_1', 'p_plus_2', 'p_plus_3']);
  });

  it('Peak Reset', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, 1, 3, 1, 0, 0, 0]));
    expect(result.peakIndex).toBe(4);
    expect(result.fertileStartIndex).toBe(1);
    expect(result.fertileEndIndex).toBe(7);
  });

  it('No Confirm (continuous 3s)', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, 3, 3, 3]));
    expect(result.peakIndex).toBeNull();
    expect(result.fertileStartIndex).toBe(1);
    expect(result.fertileEndIndex).toBeNull();
  });

  it('Missing Day Blocks Confirmation', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, null, 1, 0, 0]));
    expect(result.peakIndex).toBeNull();
  });

  it('Gradual Decline', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, 2, 2, 1]));
    expect(result.peakIndex).toBe(2);
    expect(result.fertileEndIndex).toBe(5);
  });

  it('Continuous low-quality', () => {
    const result = recalculateCycle(byRanks([0, 1, 1, 1, 1, 1]));
    expect(result.peakIndex).toBeNull();
    expect(result.fertileStartIndex).toBe(1);
    expect(result.fertileEndIndex).toBeNull();
  });

  it('Multiple entries per day uses max rank', () => {
    const entries: DailyEntry[] = [
      { bleeding: 'none', observations: [{ sensation: 'damp', appearance: 'cloudy' }, { sensation: 'wet', appearance: 'cloudy' }] },
      { bleeding: 'none', observations: [{ sensation: 'dry', appearance: 'none' }, { sensation: 'slippery', appearance: 'cloudy' }] }
    ];
    const result = recalculateCycle(entries);
    expect(result.mucusRanks).toEqual([2, 3]);
  });

  it('heavy/moderate bleeding sequence starts a new cycle', () => {
    const entries: DailyEntry[] = [
      { bleeding: 'none', mucusRankOverride: 3 },
      { bleeding: 'none', mucusRankOverride: 1 },
      { bleeding: 'heavy', mucusRankOverride: 0 },
      { bleeding: 'moderate', mucusRankOverride: 0 },
      { bleeding: 'none', mucusRankOverride: 1 }
    ];
    const result = recalculateCycle(entries);
    expect(result.phaseLabels[0]).toBe('previous_cycle');
    expect(result.phaseLabels[1]).toBe('previous_cycle');
    expect(result.fertileStartIndex).toBe(4);
  });

  it('heavy bleeding on first entry sets cycle start at 0', () => {
    const entries: DailyEntry[] = [
      { bleeding: 'heavy', mucusRankOverride: 0 },
      { bleeding: 'moderate', mucusRankOverride: 0 },
      { bleeding: 'none', mucusRankOverride: 1 },
    ];
    const result = recalculateCycle(entries);
    expect(result.phaseLabels[0]).toBe('dry');
    expect(result.fertileStartIndex).toBe(2);
  });

  it('dry + cloudy yields rank 1 (visible mucus = fertility sign)', () => {
    const entries: DailyEntry[] = [
      { sensation: 'dry', appearance: 'cloudy' },
    ];
    const result = recalculateCycle(entries);
    expect(result.mucusRanks).toEqual([1]);
    expect(result.fertileStartIndex).toBe(0);
  });

  it('dry + stretchy yields rank 3 (stretchy triggers peak)', () => {
    const entries: DailyEntry[] = [
      { sensation: 'dry', appearance: 'stretchy' },
    ];
    const result = recalculateCycle(entries);
    expect(result.mucusRanks).toEqual([3]);
  });

  it('rank 2 as cycle max — fertile window opens, peak never confirmed', () => {
    const result = recalculateCycle(byRanks([0, 2, 2, 2, 0, 0]));
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

  it('peak candidate at array boundary — stays unconfirmed', () => {
    const result = recalculateCycle(byRanks([0, 1, 3]));
    expect(result.peakIndex).toBeNull();
    expect(result.fertileEndIndex).toBeNull();
  });

  it('all missing days', () => {
    const entries: Array<DailyEntry | null> = [
      { missing: true },
      { missing: true },
      { missing: true },
    ];
    const result = recalculateCycle(entries);
    expect(result.fertileStartIndex).toBeNull();
    expect(result.peakIndex).toBeNull();
    expect(result.phaseLabels).toEqual(['missing', 'missing', 'missing']);
  });

  it('single-day cycle', () => {
    const entries: DailyEntry[] = [
      { sensation: 'dry', appearance: 'none' },
    ];
    const result = recalculateCycle(entries);
    expect(result.fertileStartIndex).toBeNull();
    expect(result.peakIndex).toBeNull();
    expect(result.phaseLabels).toEqual(['dry']);
  });

  it('late-cycle mucus reappearance after confirmed P+3 is ignored', () => {
    const result = recalculateCycle(byRanks([0, 1, 3, 1, 0, 0, 0, 0, 3, 1, 0, 0]));
    expect(result.peakIndex).toBe(2);
    expect(result.fertileEndIndex).toBe(5);
    expect(result.phaseLabels[8]).toBe('post_peak');
  });

  it('empty entries array', () => {
    const result = recalculateCycle([]);
    expect(result.fertileStartIndex).toBeNull();
    expect(result.peakIndex).toBeNull();
    expect(result.fertileEndIndex).toBeNull();
    expect(result.phaseLabels).toEqual([]);
    expect(result.mucusRanks).toEqual([]);
  });

  it('debug mode logs cycle state', () => {
    const spy = jest.spyOn(console, 'debug').mockImplementation();
    recalculateCycle(byRanks([0, 1, 3, 1, 0, 0]), { debug: true });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
