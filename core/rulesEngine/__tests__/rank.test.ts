import { computeMucusRank } from '../src/rank';

describe('computeMucusRank', () => {
  it('maps dry+none to 0', () => {
    expect(computeMucusRank({ sensation: 'dry', appearance: 'none' })).toBe(0);
  });

  it('maps slippery or clear/stretchy to 3', () => {
    expect(computeMucusRank({ sensation: 'slippery', appearance: 'cloudy' })).toBe(3);
    expect(computeMucusRank({ sensation: 'damp', appearance: 'clear' })).toBe(3);
    expect(computeMucusRank({ sensation: 'wet', appearance: 'stretchy' })).toBe(3);
  });

  it('maps wet to 2, damp to 1', () => {
    expect(computeMucusRank({ sensation: 'wet', appearance: 'cloudy' })).toBe(2);
    expect(computeMucusRank({ sensation: 'damp', appearance: 'cloudy' })).toBe(1);
  });

  it('returns null for missing entry and max for multi-observations', () => {
    expect(computeMucusRank(null)).toBeNull();
    expect(computeMucusRank({ missing: true })).toBeNull();
    expect(
      computeMucusRank({
        observations: [
          { sensation: 'damp', appearance: 'cloudy' },
          { sensation: 'wet', appearance: 'cloudy' }
        ]
      })
    ).toBe(2);
  });


  it('returns rank 1 for visible mucus with dry sensation (Creighton: any mucus = fertility sign)', () => {
    expect(computeMucusRank({ sensation: 'dry', appearance: 'cloudy' })).toBe(1);
  });

  it('uses clamped override when supplied', () => {
    expect(computeMucusRank({ mucusRankOverride: 9 })).toBe(3);
    expect(computeMucusRank({ mucusRankOverride: -3 })).toBe(0);
  });

  it('falls back to 0 for unrecognized sensation with no visible mucus', () => {
    expect(computeMucusRank({ sensation: 'unknown' as never, appearance: 'none' })).toBe(0);
  });

  it('defaults missing sensation to dry and missing appearance to none', () => {
    expect(computeMucusRank({})).toBe(0);
    expect(computeMucusRank({ sensation: 'wet' })).toBe(2);
    expect(computeMucusRank({ appearance: 'clear' })).toBe(3);
  });
});
