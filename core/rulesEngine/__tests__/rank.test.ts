import { computeMucusRank } from '../src/rank';

describe('computeMucusRank', () => {
  it('maps dry+none to 0', () => {
    expect(computeMucusRank({ sensation: 'dry', appearances: [] })).toBe(0);
  });

  it('maps stretchy to 3', () => {
    expect(computeMucusRank({ sensation: 'stretchy', appearances: [] })).toBe(3);
    expect(computeMucusRank({ sensation: 'stretchy', appearances: ['cloudy'] })).toBe(3);
  });

  it('maps clear appearance to 3', () => {
    expect(computeMucusRank({ sensation: 'damp', appearances: ['clear'] })).toBe(3);
    expect(computeMucusRank({ sensation: 'dry', appearances: ['clear'] })).toBe(3);
  });

  it('maps cloudy_clear appearance to 3', () => {
    expect(computeMucusRank({ sensation: 'dry', appearances: ['cloudy_clear'] })).toBe(3);
  });

  it('maps lubricative appearance to 3', () => {
    expect(computeMucusRank({ sensation: 'dry', appearances: ['lubricative'] })).toBe(3);
    expect(computeMucusRank({ sensation: 'sticky', appearances: ['lubricative'] })).toBe(3);
  });

  it('maps tacky to 2', () => {
    expect(computeMucusRank({ sensation: 'tacky', appearances: [] })).toBe(2);
  });

  it('maps sticky to 1', () => {
    expect(computeMucusRank({ sensation: 'sticky', appearances: [] })).toBe(1);
  });

  it('maps shiny to 1', () => {
    expect(computeMucusRank({ sensation: 'shiny', appearances: [] })).toBe(1);
  });

  it('maps wet to 2, damp to 1', () => {
    expect(computeMucusRank({ sensation: 'wet', appearances: ['cloudy'] })).toBe(2);
    expect(computeMucusRank({ sensation: 'damp', appearances: ['cloudy'] })).toBe(1);
  });

  it('Lubricative promotes damp/shiny/wet to rank 3', () => {
    expect(computeMucusRank({ sensation: 'damp', appearances: ['lubricative'] })).toBe(3);
    expect(computeMucusRank({ sensation: 'shiny', appearances: ['lubricative'] })).toBe(3);
    expect(computeMucusRank({ sensation: 'wet', appearances: ['lubricative'] })).toBe(3);
  });

  it('Lubricative does not promote dry/sticky/tacky/stretchy base code (but still boosts rank to 3)', () => {
    expect(computeMucusRank({ sensation: 'dry', appearances: ['lubricative'] })).toBe(3);
    expect(computeMucusRank({ sensation: 'tacky', appearances: ['lubricative'] })).toBe(3);
  });

  it('takes maximum rank across sensation and appearances', () => {
    expect(computeMucusRank({ sensation: 'damp', appearances: ['gummy'] })).toBe(1);
    expect(computeMucusRank({ sensation: 'wet', appearances: ['clear'] })).toBe(3);
    expect(computeMucusRank({ sensation: 'tacky', appearances: ['pasty'] })).toBe(2);
  });

  it('returns null for missing entry and max for multi-observations', () => {
    expect(computeMucusRank(null)).toBeNull();
    expect(computeMucusRank({ missing: true })).toBeNull();
    expect(
      computeMucusRank({
        observations: [
          { sensation: 'damp', appearances: ['cloudy'] },
          { sensation: 'wet', appearances: ['cloudy'] }
        ]
      })
    ).toBe(2);
  });

  it('handles multi-observations with different appearances', () => {
    expect(
      computeMucusRank({
        observations: [
          { sensation: 'damp', appearances: ['gummy'] },
          { sensation: 'dry', appearances: ['clear'] }
        ]
      })
    ).toBe(3);
  });

  it('returns rank 1 for cloudy mucus with dry sensation', () => {
    expect(computeMucusRank({ sensation: 'dry', appearances: ['cloudy'] })).toBe(1);
  });

  it('uses clamped override when supplied', () => {
    expect(computeMucusRank({ mucusRankOverride: 9 })).toBe(3);
    expect(computeMucusRank({ mucusRankOverride: -3 })).toBe(0);
  });

  it('falls back to 0 for unrecognized sensation with no appearances', () => {
    expect(computeMucusRank({ sensation: 'unknown' as never, appearances: [] })).toBe(0);
  });

  it('defaults missing sensation to dry and missing appearances to empty', () => {
    expect(computeMucusRank({})).toBe(0);
    expect(computeMucusRank({ sensation: 'wet' })).toBe(2);
    expect(computeMucusRank({ appearances: ['clear'] })).toBe(3);
  });

  it('gummy, pasty, and yellow appearances each boost to rank 1', () => {
    expect(computeMucusRank({ sensation: 'dry', appearances: ['gummy'] })).toBe(1);
    expect(computeMucusRank({ sensation: 'dry', appearances: ['pasty'] })).toBe(1);
    expect(computeMucusRank({ sensation: 'dry', appearances: ['yellow'] })).toBe(1);
  });

  it('brown and red appearances do not boost rank', () => {
    expect(computeMucusRank({ sensation: 'dry', appearances: ['brown'] })).toBe(0);
    expect(computeMucusRank({ sensation: 'dry', appearances: ['red'] })).toBe(0);
  });

  it('multi-select appearances: max boost wins', () => {
    expect(computeMucusRank({ sensation: 'dry', appearances: ['cloudy', 'clear'] })).toBe(3);
    expect(computeMucusRank({ sensation: 'dry', appearances: ['brown', 'gummy'] })).toBe(1);
  });
});
