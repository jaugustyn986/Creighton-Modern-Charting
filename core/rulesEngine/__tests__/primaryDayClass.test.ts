import { recalculateCycle } from '../src/recalc';
import { derivePrimaryDayClassFromEntry } from '../src/primaryDayClass';

describe('primaryDayClassByDay', () => {
  it('classifies moderate bleeding with rank 3 as menstrual_flow, not peak candidate', () => {
    const r = recalculateCycle([
      { date: '2026-01-01', bleeding: 'moderate', mucusRankOverride: 3 },
    ]);
    expect(r.primaryDayClassByDay[0]).toBe('menstrual_flow');
    expect(r.peakCandidateIndex).toBeNull();
    expect(r.peakIndex).toBeNull();
  });

  it('post-peak spotting with mucus uses mucus tier, not menstrual red class', () => {
    const r = recalculateCycle([
      { date: '2026-01-01', bleeding: 'heavy', mucusRankOverride: 0 },
      { date: '2026-01-02', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-03', bleeding: 'none', mucusRankOverride: 3 },
      { date: '2026-01-04', bleeding: 'none', mucusRankOverride: 2 },
      { date: '2026-01-05', bleeding: 'none', mucusRankOverride: 2 },
      { date: '2026-01-06', bleeding: 'none', mucusRankOverride: 1 },
      { date: '2026-01-07', bleeding: 'none', mucusRankOverride: 0 },
      { date: '2026-01-08', bleeding: 'spotting', mucusRankOverride: 2 },
    ]);
    const idx = 7;
    expect(r.bleedingClassByDay[idx]).toBe('post_peak_spotting');
    expect(r.primaryDayClassByDay[idx]).toBe('mucus_observed');
  });
});

describe('derivePrimaryDayClassFromEntry (draft / form preview)', () => {
  it('heavy bleeding forces menstrual_flow regardless of rank', () => {
    expect(
      derivePrimaryDayClassFromEntry(
        { bleeding: 'heavy', sensation: 'wet', appearances: ['lubricative'] },
        3,
      ),
    ).toBe('menstrual_flow');
  });
});
