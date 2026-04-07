import {
  buildCycleComparisonNarrative,
  buildCycleComparisonStructured,
  getPriorCompleted,
} from '../src/cycleComparisonSummary';
import { CycleSlice } from '../src/multiCycle';
import { CycleResult } from '../src/types';

const emptyResult = {} as CycleResult;

function makeSlice(
  overrides: Partial<CycleSlice> &
    Pick<CycleSlice, 'cycleNumber' | 'status' | 'length'>,
): CycleSlice {
  return {
    startDate: '2025-01-01',
    endDate: '2025-01-28',
    entries: [],
    result: emptyResult,
    peakDay: 14,
    lutealPhase: 14,
    ...overrides,
  };
}

describe('getPriorCompleted', () => {
  it('returns only completed cycles before current', () => {
    const all = [
      makeSlice({ cycleNumber: 1, status: 'complete', length: 28 }),
      makeSlice({ cycleNumber: 2, status: 'complete', length: 30 }),
      makeSlice({ cycleNumber: 3, status: 'in_progress', length: 5, lutealPhase: null }),
    ];
    const priors = getPriorCompleted(all[2], all);
    expect(priors.map((c) => c.cycleNumber)).toEqual([1, 2]);
  });
});

describe('buildCycleComparisonNarrative', () => {
  it('asks for two completed cycles when fewer exist', () => {
    const current = makeSlice({ cycleNumber: 1, status: 'in_progress', length: 5, lutealPhase: null });
    const text = buildCycleComparisonNarrative(current, [current]);
    expect(text).toContain('at least two cycles');
  });

  it('handles no earlier completed priors', () => {
    const c1 = makeSlice({ cycleNumber: 1, status: 'complete', length: 28 });
    const c2 = makeSlice({ cycleNumber: 2, status: 'complete', length: 28 });
    const text = buildCycleComparisonNarrative(c1, [c1, c2]);
    expect(text).toContain('Not enough earlier');
  });

  it('compares when priors exist', () => {
    const c1 = makeSlice({ cycleNumber: 1, status: 'complete', length: 28, peakDay: 14 });
    const c2 = makeSlice({ cycleNumber: 2, status: 'complete', length: 28, peakDay: 14 });
    const c3 = makeSlice({ cycleNumber: 3, status: 'complete', length: 32, peakDay: 16 });
    const text = buildCycleComparisonNarrative(c3, [c1, c2, c3]);
    expect(text.length).toBeGreaterThan(10);
    expect(text).not.toContain('at least two cycles');
  });
});

describe('buildCycleComparisonStructured', () => {
  it('marks length not_comparable for in-progress current', () => {
    const c1 = makeSlice({ cycleNumber: 1, status: 'complete', length: 28 });
    const cur = makeSlice({
      cycleNumber: 2,
      status: 'in_progress',
      length: 5,
      lutealPhase: null,
      peakDay: null,
    });
    const s = buildCycleComparisonStructured(cur, [c1, cur]);
    expect(s.lengthVsPrior).toBe('not_comparable');
  });

  it('computes avgPeakDay from prior completed cycles', () => {
    const c1 = makeSlice({ cycleNumber: 1, status: 'complete', length: 28, peakDay: 14 });
    const c2 = makeSlice({ cycleNumber: 2, status: 'complete', length: 30, peakDay: 16 });
    const cur = makeSlice({ cycleNumber: 3, status: 'in_progress', length: 8, peakDay: null, lutealPhase: null });
    const s = buildCycleComparisonStructured(cur, [c1, c2, cur]);
    expect(s.avgPeakDay).toBe(15);
  });

  it('returns null avgPeakDay when no prior peaks', () => {
    const c1 = makeSlice({ cycleNumber: 1, status: 'complete', length: 28, peakDay: null, lutealPhase: null });
    const cur = makeSlice({ cycleNumber: 2, status: 'in_progress', length: 5, peakDay: null, lutealPhase: null });
    const s = buildCycleComparisonStructured(cur, [c1, cur]);
    expect(s.avgPeakDay).toBeNull();
  });

  it('computes avgFertileStartDay from prior results', () => {
    const resultWithFertile = { ...emptyResult, fertileStartIndex: 7 } as CycleResult;
    const c1 = makeSlice({ cycleNumber: 1, status: 'complete', length: 28, result: resultWithFertile });
    const c2 = makeSlice({ cycleNumber: 2, status: 'complete', length: 30, result: { ...emptyResult, fertileStartIndex: 9 } as CycleResult });
    const cur = makeSlice({ cycleNumber: 3, status: 'in_progress', length: 5, peakDay: null, lutealPhase: null });
    const s = buildCycleComparisonStructured(cur, [c1, c2, cur]);
    expect(s.avgFertileStartDay).toBe(9);
  });

  it('returns null avgFertileStartDay when no prior fertile data', () => {
    const resultNoFertile = { ...emptyResult, fertileStartIndex: null } as CycleResult;
    const c1 = makeSlice({ cycleNumber: 1, status: 'complete', length: 28, result: resultNoFertile });
    const cur = makeSlice({ cycleNumber: 2, status: 'in_progress', length: 5, peakDay: null, lutealPhase: null });
    const s = buildCycleComparisonStructured(cur, [c1, cur]);
    expect(s.avgFertileStartDay).toBeNull();
  });
});
