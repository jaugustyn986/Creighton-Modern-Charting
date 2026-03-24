import {
  computeMucusRank,
  detectFertileStart,
  detectPeak,
  recalculateCycle,
  generateCreightonCode,
  classifyFertility,
  splitIntoCycles,
  computeCycleSummary,
  generateInsights,
  mucusChartStrengthLabel,
  buildCycleComparisonNarrative,
  buildCycleComparisonStructured,
  buildCurrentCycleSummary,
} from '../src';

describe('package index exports', () => {
  it('re-exports public API functions', () => {
    expect(typeof computeMucusRank).toBe('function');
    expect(typeof detectFertileStart).toBe('function');
    expect(typeof detectPeak).toBe('function');
    expect(typeof recalculateCycle).toBe('function');
    expect(typeof generateCreightonCode).toBe('function');
    expect(typeof classifyFertility).toBe('function');
    expect(typeof splitIntoCycles).toBe('function');
    expect(typeof computeCycleSummary).toBe('function');
    expect(typeof generateInsights).toBe('function');
    expect(typeof mucusChartStrengthLabel).toBe('function');
    expect(typeof buildCycleComparisonNarrative).toBe('function');
    expect(typeof buildCycleComparisonStructured).toBe('function');
    expect(typeof buildCurrentCycleSummary).toBe('function');
  });
});
