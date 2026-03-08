import { recalculateCycle } from './recalc';
import { CycleResult, DailyEntry } from './types';

export interface CycleSlice {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  entries: DailyEntry[];
  result: CycleResult;
  length: number;
  peakDay: number | null;
  lutealPhase: number | null;
  status: 'complete' | 'in_progress' | 'no_peak';
}

export interface CycleSummary {
  cyclesTracked: number;
  avgLength: number | null;
  shortestLength: number | null;
  longestLength: number | null;
  avgPeakDay: number | null;
  avgLutealPhase: number | null;
}

/**
 * Splits a sorted array of DailyEntry into individual cycles.
 * A new cycle starts on the first day of heavy/moderate bleeding that
 * is NOT preceded by another heavy/moderate day.
 */
export function splitIntoCycles(entries: DailyEntry[]): CycleSlice[] {
  if (entries.length === 0) return [];

  const boundaries: number[] = [0];

  for (let i = 1; i < entries.length; i++) {
    const bleeding = entries[i].bleeding;
    if (bleeding === 'heavy' || bleeding === 'moderate') {
      const prevBleeding = entries[i - 1].bleeding;
      const prevIsHeavyOrModerate =
        prevBleeding === 'heavy' || prevBleeding === 'moderate';
      if (!prevIsHeavyOrModerate) {
        boundaries.push(i);
      }
    }
  }

  const slices: CycleSlice[] = [];

  for (let b = 0; b < boundaries.length; b++) {
    const start = boundaries[b];
    const end = b + 1 < boundaries.length ? boundaries[b + 1] : entries.length;
    const cycleEntries = entries.slice(start, end);

    if (cycleEntries.length === 0) continue;

    const result = recalculateCycle(cycleEntries);
    const peakDay = result.peakIndex !== null ? result.peakIndex + 1 : null;
    const isLastCycle = b === boundaries.length - 1;

    let lutealPhase: number | null = null;
    if (peakDay !== null && !isLastCycle) {
      lutealPhase = cycleEntries.length - peakDay;
    }

    let status: CycleSlice['status'];
    if (result.peakIndex !== null && !isLastCycle) {
      status = 'complete';
    } else if (result.peakIndex !== null) {
      status = 'in_progress';
    } else {
      status = 'no_peak';
    }

    slices.push({
      cycleNumber: b + 1,
      startDate: cycleEntries[0].date ?? '',
      endDate: cycleEntries[cycleEntries.length - 1].date ?? '',
      entries: cycleEntries,
      result,
      length: cycleEntries.length,
      peakDay,
      lutealPhase,
      status,
    });
  }

  return slices;
}

/**
 * Computes aggregate summary statistics across all tracked cycles.
 */
export function computeCycleSummary(cycles: CycleSlice[]): CycleSummary {
  if (cycles.length === 0) {
    return {
      cyclesTracked: 0,
      avgLength: null,
      shortestLength: null,
      longestLength: null,
      avgPeakDay: null,
      avgLutealPhase: null,
    };
  }

  const completedCycles = cycles.filter((c) => c.status === 'complete');
  const lengths = completedCycles.map((c) => c.length);
  const peakDays = completedCycles.filter((c) => c.peakDay !== null).map((c) => c.peakDay!);
  const lutealPhases = completedCycles.filter((c) => c.lutealPhase !== null).map((c) => c.lutealPhase!);

  return {
    cyclesTracked: cycles.length,
    avgLength: lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : null,
    shortestLength: lengths.length > 0 ? Math.min(...lengths) : null,
    longestLength: lengths.length > 0 ? Math.max(...lengths) : null,
    avgPeakDay: peakDays.length > 0 ? Math.round(peakDays.reduce((a, b) => a + b, 0) / peakDays.length) : null,
    avgLutealPhase: lutealPhases.length > 0 ? Math.round(lutealPhases.reduce((a, b) => a + b, 0) / lutealPhases.length) : null,
  };
}

/**
 * Generates human-readable insight strings from cycle history.
 * Requires at least 2 completed cycles for meaningful output.
 */
export function generateInsights(cycles: CycleSlice[]): string[] {
  const completed = cycles.filter((c) => c.status === 'complete');
  if (completed.length < 2) return [];

  const insights: string[] = [];

  const peakDays = completed.filter((c) => c.peakDay !== null).map((c) => c.peakDay!);
  if (peakDays.length >= 2) {
    const minP = Math.min(...peakDays);
    const maxP = Math.max(...peakDays);
    insights.push(
      minP === maxP
        ? `Peak day has consistently occurred on cycle day ${minP}.`
        : `Peak day has ranged from cycle day ${minP} to ${maxP}.`
    );

    const earliestFertile = Math.max(1, minP - 5);
    insights.push(`Fertile window typically opens around cycle day ${earliestFertile}.`);
  }

  const lutealPhases = completed.filter((c) => c.lutealPhase !== null).map((c) => c.lutealPhase!);
  if (lutealPhases.length >= 2) {
    const avg = Math.round(lutealPhases.reduce((a, b) => a + b, 0) / lutealPhases.length);
    insights.push(`Average luteal phase is ${avg} days.`);
  }

  const lengths = completed.map((c) => c.length);
  if (lengths.length >= 2) {
    const range = Math.max(...lengths) - Math.min(...lengths);
    if (range <= 3) {
      insights.push('Your cycles have been very consistent.');
    } else if (range <= 7) {
      insights.push('Your cycles show moderate variation.');
    } else {
      insights.push('Your cycles show significant variation in length.');
    }
  }

  return insights;
}
