import { syntheticDateForIndex } from '../src/calendar';
import { detectPeak } from '../src/peak';
import { DailyEntry } from '../src/types';

function entriesForLength(n: number): DailyEntry[] {
  return Array.from({ length: n }, (_, i) => ({ date: syntheticDateForIndex(i) }));
}

describe('detectPeak', () => {
  it('detects a valid peak with P+3 lower ranks', () => {
    const ranks = [0, 1, 3, 2, 1, 0];
    expect(detectPeak(entriesForLength(ranks.length), ranks, 0)).toEqual({
      peakCandidateIndex: 2,
      peakIndex: 2,
      fertileEndIndex: 5,
    });
  });

  it('resets candidate when equal/higher rank appears during waiting period', () => {
    const ranks = [0, 1, 3, 1, 3, 1, 0, 0];
    expect(detectPeak(entriesForLength(ranks.length), ranks, 0)).toEqual({
      peakCandidateIndex: 4,
      peakIndex: 4,
      fertileEndIndex: 7,
    });
  });

  it('does not confirm when P+1..P+3 missing', () => {
    const ranks = [0, 1, 3, null, 1, 0, 0];
    expect(detectPeak(entriesForLength(ranks.length), ranks, 0)).toEqual({
      peakCandidateIndex: 2,
      peakIndex: null,
      fertileEndIndex: null,
    });
    const ranks2 = [0, 1, 3, 2];
    expect(detectPeak(entriesForLength(ranks2.length), ranks2, 0)).toEqual({
      peakCandidateIndex: 2,
      peakIndex: null,
      fertileEndIndex: null,
    });
  });

  it('supports shifted cycle start', () => {
    const ranks = [3, 2, 1, 0, 1, 3, 1, 0, 0];
    expect(detectPeak(entriesForLength(ranks.length), ranks, 4)).toEqual({
      peakCandidateIndex: 5,
      peakIndex: 5,
      fertileEndIndex: 8,
    });
  });

  it('does not treat flow bleeding day as peak-type candidate', () => {
    const entries: DailyEntry[] = [
      { date: '2000-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2000-01-02', bleeding: 'moderate', mucusRankOverride: 3 },
      { date: '2000-01-03', bleeding: 'none', mucusRankOverride: 2 },
      { date: '2000-01-04', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2000-01-05', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const ranks = [0, 3, 2, 1, 0];
    expect(detectPeak(entries, ranks, 0)).toEqual({
      peakCandidateIndex: null,
      peakIndex: null,
      fertileEndIndex: null,
    });
  });
});
