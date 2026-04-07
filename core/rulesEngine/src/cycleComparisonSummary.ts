import { CycleSlice } from './multiCycle';

export type LengthCompare = 'shorter' | 'similar' | 'longer' | 'not_comparable';
export type PeakCompare = 'earlier' | 'similar' | 'later' | 'not_comparable';
export type VariationBand = 'low' | 'moderate' | 'high' | 'unknown';

export interface CycleComparisonStructured {
  lengthVsPrior: LengthCompare;
  peakVsPrior: PeakCompare;
  lutealVsPrior: LengthCompare;
  patternVariation: VariationBand;
  priorSampleSize: number;
  completedCyclesTotal: number;
  avgPeakDay: number | null;
  avgFertileStartDay: number | null;
}

export function getPriorCompleted(
  current: CycleSlice,
  allCycles: CycleSlice[],
  maxPrior = 6,
): CycleSlice[] {
  return allCycles
    .filter((c) => c.status === 'complete' && c.cycleNumber < current.cycleNumber)
    .sort((a, b) => a.cycleNumber - b.cycleNumber)
    .slice(-maxPrior);
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function lengthBand(delta: number, threshold: number): LengthCompare {
  if (delta < -threshold) return 'shorter';
  if (delta > threshold) return 'longer';
  return 'similar';
}

function peakBand(delta: number, threshold: number): PeakCompare {
  if (delta < -threshold) return 'earlier';
  if (delta > threshold) return 'later';
  return 'similar';
}

function variationFromLengths(lengths: number[]): VariationBand {
  if (lengths.length < 2) return 'unknown';
  const range = Math.max(...lengths) - Math.min(...lengths);
  if (range <= 3) return 'low';
  if (range <= 7) return 'moderate';
  return 'high';
}

export function buildCycleComparisonStructured(
  current: CycleSlice,
  allCycles: CycleSlice[],
): CycleComparisonStructured {
  const completedTotal = allCycles.filter((c) => c.status === 'complete').length;
  const priors = getPriorCompleted(current, allCycles);

  const priorLengths = priors.map((c) => c.length);
  const priorPeaks = priors.filter((c) => c.peakDay !== null).map((c) => c.peakDay!);
  const priorLuteals = priors.filter((c) => c.lutealPhase !== null).map((c) => c.lutealPhase!);

  let lengthVsPrior: LengthCompare = 'not_comparable';
  if (current.status === 'complete' && priorLengths.length > 0) {
    lengthVsPrior = lengthBand(current.length - mean(priorLengths), 2);
  }

  let peakVsPrior: PeakCompare = 'not_comparable';
  if (current.peakDay !== null && priorPeaks.length > 0) {
    peakVsPrior = peakBand(current.peakDay - mean(priorPeaks), 1);
  }

  let lutealVsPrior: LengthCompare = 'not_comparable';
  if (current.lutealPhase !== null && priorLuteals.length > 0) {
    lutealVsPrior = lengthBand(current.lutealPhase - mean(priorLuteals), 1);
  }

  const avgPeakDay =
    priorPeaks.length > 0
      ? Math.round(mean(priorPeaks))
      : null;

  const fertileStartDays = priors
    .filter((c) => c.result.fertileStartIndex !== null)
    .map((c) => c.result.fertileStartIndex! + 1);
  const avgFertileStartDay =
    fertileStartDays.length > 0
      ? Math.round(mean(fertileStartDays))
      : null;

  return {
    lengthVsPrior,
    peakVsPrior,
    lutealVsPrior,
    patternVariation: variationFromLengths(priorLengths),
    priorSampleSize: priors.length,
    completedCyclesTotal: completedTotal,
    avgPeakDay,
    avgFertileStartDay,
  };
}

/**
 * One or two short sentences for the cycle detail card. Deterministic, observational tone.
 */
export function buildCycleComparisonNarrative(
  current: CycleSlice,
  allCycles: CycleSlice[],
): string {
  const s = buildCycleComparisonStructured(current, allCycles);

  if (s.completedCyclesTotal < 2) {
    return 'Complete at least two cycles to see how this cycle compares to your usual pattern.';
  }

  if (s.priorSampleSize === 0) {
    return 'Not enough earlier completed cycles to compare yet.';
  }

  const sentences: string[] = [];

  if (current.status !== 'complete') {
    sentences.push('This cycle is still in progress.');
  } else if (s.lengthVsPrior === 'longer') {
    sentences.push('This cycle was a bit longer than your recent average.');
  } else if (s.lengthVsPrior === 'shorter') {
    sentences.push('This cycle was a bit shorter than your recent average.');
  } else if (s.lengthVsPrior === 'similar') {
    sentences.push('Length was close to your recent average.');
  }

  if (current.peakDay !== null && s.peakVsPrior !== 'not_comparable') {
    if (s.peakVsPrior === 'later') {
      sentences.push('Peak occurred a little later than usual for you.');
    } else if (s.peakVsPrior === 'earlier') {
      sentences.push('Peak occurred a little earlier than usual for you.');
    } else if (s.peakVsPrior === 'similar') {
      sentences.push(`Peak around day ${current.peakDay} is in line with your usual pattern.`);
    }
  }

  if (
    sentences.length < 2 &&
    current.status === 'complete' &&
    s.lutealVsPrior !== 'not_comparable'
  ) {
    if (s.lutealVsPrior === 'longer') {
      sentences.push('Your luteal phase was slightly longer than typical for you.');
    } else if (s.lutealVsPrior === 'shorter') {
      sentences.push('Your luteal phase was slightly shorter than typical for you.');
    }
  }

  let variation = '';
  if (s.patternVariation === 'low') {
    variation = 'Your recent cycle lengths have been quite steady.';
  } else if (s.patternVariation === 'moderate') {
    variation = 'Your cycle lengths have had some natural variation.';
  } else if (s.patternVariation === 'high') {
    variation = 'Your recent cycles have varied more in length.';
  }

  if (sentences.length === 0) {
    return variation || 'This cycle lines up with your recent completed cycles.';
  }

  if (sentences.length === 1 && variation) {
    return `${sentences[0]} ${variation}`;
  }

  return sentences.slice(0, 2).join(' ');
}
