import { recalculateCycle } from '../src/recalc';
import { DailyEntry } from '../src/types';

describe('recalculateCycle interpretation warnings', () => {
  it('adds calendar_gap_blocks_peak_confirmation when the calendar day after Peak-type is missing from the slice', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 2 },
    ];
    const r = recalculateCycle(entries);
    expect(r.peakCandidateIndex).not.toBeNull();
    expect(r.peakIndex).toBeNull();
    expect(r.interpretationWarnings).toContain('calendar_gap_blocks_peak_confirmation');
    expect(r.interpretationWarnings).not.toContain('peak_confirmation_incomplete');
  });

  it('adds missing_blocks_peak_confirmation when a day in P+1..P+3 is marked missing', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-04', bleeding: 'none', missing: true, mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 2 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-07', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const r = recalculateCycle(entries);
    expect(r.peakIndex).toBeNull();
    expect(r.interpretationWarnings).toContain('missing_blocks_peak_confirmation');
  });


  it('adds uncertain_fertile_start when a calendar gap precedes first mucus after cycle start', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 1 },
    ];
    const r = recalculateCycle(entries);
    expect(r.fertileStartReason).toBe('uncertain_due_to_missing');
    expect(r.interpretationWarnings).toContain('uncertain_fertile_start');
  });
});

