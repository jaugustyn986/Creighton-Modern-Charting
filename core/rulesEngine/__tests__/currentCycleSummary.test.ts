import { buildCurrentCycleSummary } from '../src/currentCycleSummary';
import { CycleComparisonStructured } from '../src/cycleComparisonSummary';
import { recalculateCycle } from '../src/recalc';
import { DailyEntry } from '../src/types';

function sliceResult(entries: DailyEntry[]) {
  return recalculateCycle(entries);
}

describe('buildCurrentCycleSummary', () => {
  it('surfaces interpretationNotes from engine warnings', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 1 },
    ];
    const result = sliceResult(entries);
    const summary = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 1,
    });
    expect(result.interpretationWarnings).toContain('uncertain_fertile_start');
    expect(summary.interpretationNotes.length).toBeGreaterThan(0);
    expect(summary.interpretationNotes[0]).toContain('fertile');
  });


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
    expect(s.interpretationNotes).toEqual([]);
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

  it('uses phase headline for no_peak when focus day is charted', () => {
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
    expect(s.headline).toBe('Tracking');
    expect(s.confidence).toBe('Moderate confidence \u2014 pattern still forming');
    expect(s.supportingContext).toBe('');
    expect(s.guidance).toContain('cycle pattern becomes clearer');
    expect(s.summaryTone).toBe('neutral');
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
    expect(s.completeness).toBe('2 days still open in this cycle');
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
    expect(s.completeness).toBe('1 day still open in this cycle');
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
    expect(s.completeness).toBe('3 days still open in this cycle');
  });

  it('uses fertile headline and guidance for no_peak single day with mucus', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'none', mucusRankOverride: 1 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 0,
    });
    expect(s.supportingContext).toBe('');
    expect(s.headline).toContain('Fertile pattern');
    expect(s.guidance).toContain('Fertile signs');
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
    expect(s.guidance).toBe('Day 2 of 3 after Peak \u2014 continue observing to confirm.');
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
    expect(s.completeness).toBe('No gaps in your chart this cycle');
  });
});

describe('compact support field + baseline context', () => {
  const baseComparison: CycleComparisonStructured = {
    lengthVsPrior: 'similar',
    peakVsPrior: 'similar',
    lutealVsPrior: 'similar',
    patternVariation: 'low',
    priorSampleSize: 3,
    completedCyclesTotal: 3,
    avgPeakDay: 15,
    avgFertileStartDay: 11,
  };

  it('empty state: compactSupportField is guidance, no baseline', () => {
    const r = sliceResult([]);
    const s = buildCurrentCycleSummary({
      entries: [],
      result: r,
      status: 'no_peak',
      todayIndex: null,
    });
    expect(s.compactSupportField).toBe('guidance');
    expect(s.baselineContext).toBeNull();
  });

  it('dry pattern with baseline: shows fertile-start context', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'moderate', mucusRankOverride: 0 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-07', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-08', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 7,
      baselineComparison: baseComparison,
    });
    expect(s.baselineContext).toContain('day 11');
    expect(s.compactSupportField).toBe('baselineContext');
  });

  it('dry pattern without baseline: falls back to guidance', () => {
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
    expect(s.baselineContext).toBeNull();
    expect(s.compactSupportField).toBe('guidance');
  });

  it('dry pattern: no baseline when priorSampleSize < 2', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const lowSample: CycleComparisonStructured = {
      ...baseComparison,
      priorSampleSize: 1,
    };
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'no_peak',
      todayIndex: 1,
      baselineComparison: lowSample,
    });
    expect(s.baselineContext).toBeNull();
  });

  it('fertile open with baseline: shows avg peak day context', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    expect(result.phaseLabels[1]).toBe('fertile_open');
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 1,
      baselineComparison: baseComparison,
    });
    expect(s.baselineContext).toContain('day 15');
    expect(s.compactSupportField).toBe('baselineContext');
  });

  it('P+1: guidance only, no baseline', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    expect(result.phaseLabels[3]).toBe('p_plus_1');
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 3,
      baselineComparison: baseComparison,
    });
    expect(s.baselineContext).toBeNull();
    expect(s.compactSupportField).toBe('guidance');
    expect(s.guidance).toContain('Day 1 of 3');
  });

  it('P+2: guidance only, no baseline', () => {
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
      baselineComparison: baseComparison,
    });
    expect(s.baselineContext).toBeNull();
    expect(s.compactSupportField).toBe('guidance');
    expect(s.guidance).toContain('Day 2 of 3');
  });

  it('P+3: no baseline, guidance about confirmation', () => {
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
      baselineComparison: baseComparison,
    });
    expect(s.baselineContext).toBeNull();
    expect(s.compactSupportField).toBe('guidance');
    expect(s.headline).toBe('Post-peak phase');
    expect(s.confidence).toBe('High confidence \u2014 Peak confirmed');
  });

  it('post-peak with later peak: shows baseline context', () => {
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
    expect(result.phaseLabels[6]).toBe('post_peak');
    const laterComparison: CycleComparisonStructured = {
      ...baseComparison,
      peakVsPrior: 'later',
    };
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 6,
      baselineComparison: laterComparison,
    });
    expect(s.baselineContext).toContain('later');
    expect(s.compactSupportField).toBe('baselineContext');
  });

  it('missing day: Low confidence, interpretationNote takes priority', () => {
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
      baselineComparison: baseComparison,
    });
    expect(s.confidence).toContain('Low confidence');
    expect(s.baselineContext).toBeNull();
  });

  it('low confidence suppresses baseline even when comparison is provided', () => {
    const entries: DailyEntry[] = [
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-03', bleeding: 'none', missing: true, mucusRankOverride: 0 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 0 },
    ];
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 3,
      baselineComparison: baseComparison,
    });
    expect(s.confidence).toContain('Low confidence');
    expect(s.baselineContext).toBeNull();
  });

  it('peak_confirmed with similar peak: no baseline context', () => {
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
      baselineComparison: baseComparison,
    });
    expect(s.baselineContext).toBeNull();
    expect(s.compactSupportField).toBe('guidance');
  });

  it('dry cycle day past avgFertileStartDay: no baseline shown', () => {
    const entries: DailyEntry[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
      bleeding: i === 0 ? ('heavy' as const) : ('none' as const),
      mucusRankOverride: 0,
    }));
    const result = sliceResult(entries);
    const s = buildCurrentCycleSummary({
      entries,
      result,
      status: 'in_progress',
      todayIndex: 13,
      baselineComparison: baseComparison,
    });
    expect(s.baselineContext).toBeNull();
  });
});
