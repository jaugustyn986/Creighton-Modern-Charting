import { buildCurrentCycleSummary } from '../src/currentCycleSummary';
import { recalculateCycle } from '../src/recalc';
import { DailyEntry } from '../src/types';

function sliceResult(entries: DailyEntry[]) {
  return recalculateCycle(entries);
}

describe('buildCurrentCycleSummary', () => {
  it('returns empty-state summary when there are no entries', () => {
    const r = sliceResult([]);
    const s = buildCurrentCycleSummary({
      entries: [],
      result: r,
      status: 'no_peak',
      todayIndex: null,
    });
    expect(s.cycleDay).toBeNull();
    expect(s.headline).toContain('appear');
    expect(s.confidence).toMatch(/^Moderate confidence/);
    expect(s.supportingContext).toBe('');
    expect(s.completeness).toContain('Nothing charted');
    expect(s.focusQualification).toBeNull();
    expect(s.summaryTone).toBe('neutral');
  });

  it('uses shortened focus qualification when todayIndex is null', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: null,
    });
    expect(s.focusQualification).toBe(
      'No entry today. Showing your last logged day.',
    );
    expect(s.cycleDay).toBe(2);
  });

  it('omits focusQualification when todayIndex is set', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 1,
    });
    expect(s.focusQualification).toBeNull();
    expect(s.cycleDay).toBe(2);
  });

  it('prefers missing-data headline over no_peak status', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', missing: true, mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 1,
    });
    expect(s.headline).toBe('Observation needed for this day');
    expect(s.confidence).toBe('Low confidence — missing observations');
    expect(s.supportingContext).toBe('');
    expect(s.summaryTone).toBe('caution');
  });

  it('uses Peak not yet identified for no_peak when focus day is charted', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 2,
    });
    expect(s.headline).toBe('Peak not yet identified');
    expect(s.confidence).toBe('Moderate confidence — pattern still forming');
    expect(s.supportingContext).toBe('');
    expect(s.guidance).toContain('Peak pattern');
    expect(s.summaryTone).toBe('caution');
  });

  it('completeness counts days marked missing: true', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', missing: true, mucusRankOverride: 0 },
      { date: '2026-01-03', missing: true, mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 2,
    });
    expect(s.completeness).toBe('2 missing entries this cycle');
  });

  it('completeness counts calendar gaps between first and last logged dates', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 1,
    });
    expect(s.completeness).toBe('1 missing entry this cycle');
  });

  it('completeness counts unlogged days after last entry through calendarAsOfDate for in-progress cycles', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 0,
      calendarAsOfDate: '2026-01-04',
    });
    expect(s.completeness).toBe('3 missing entries this cycle');
  });

  it('uses empty supportingContext and guidance for no_peak single day', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 1 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 0,
    });
    expect(s.supportingContext).toBe('');
    expect(s.guidance).toContain('Peak pattern');
  });

  it('p_plus_2: Peak day headline, guidance only, Moderate confidence', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    expect(result.phaseLabels[4]).toBe('p_plus_2');
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 4,
    });
    expect(s.headline).toBe('Peak day identified');
    expect(s.confidence).toBe('Moderate confidence — pattern still forming');
    expect(s.supportingContext).toBe('');
    expect(s.guidance).toBe('Day 2 of 3 after Peak toward confirming the pattern.');
  });

  it('p_plus_3: Post-peak headline, High confidence — Peak confirmed, target guidance', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    expect(result.phaseLabels[5]).toBe('p_plus_3');
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 5,
    });
    expect(s.headline).toBe('Post-peak phase');
    expect(s.confidence).toBe('High confidence — Peak confirmed');
    expect(s.supportingContext).toBe('');
    expect(s.guidance).toBe(
      'Three days past Peak confirm the post-Peak phase.',
    );
    expect(s.guidance).not.toContain('non-peak-type');
    expect(s.summaryTone).toBe('positive');
  });

  it('peak_confirmed: Peak day headline and High confidence — Peak confirmed', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    expect(result.phaseLabels[2]).toBe('peak_confirmed');
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 2,
    });
    expect(s.headline).toBe('Peak day identified');
    expect(s.confidence).toBe('High confidence — Peak confirmed');
    expect(s.supportingContext).toBe('');
    expect(s.guidance).toContain('three days after Peak');
  });

  it('post_peak phase uses Post-peak headline and post-Peak guidance', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-07', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const idx = 6;
    expect(result.phaseLabels[idx]).toBe('post_peak');
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: idx,
    });
    expect(s.headline).toBe('Post-peak phase');
    expect(s.confidence).toBe('High confidence — Peak confirmed');
    expect(s.guidance).toBe('Your chart reflects the post-Peak phase.');
  });

  it('lowers confidence when recent window has missing entry but focus day is complete', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-03', bleeding: 'none', missing: true, mucusRankOverride: 0 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 4,
    });
    expect(s.headline).not.toBe('Observation needed for this day');
    expect(s.confidence).toBe('Low confidence — recent observations missing');
  });

  it('zero missing entries uses tightened completeness copy', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 0,
    });
    expect(s.completeness).toBe('No missing entries this cycle');
  });
});
