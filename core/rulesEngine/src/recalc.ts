import { detectFertileStart } from './fertileWindow';
import { detectPeak } from './peak';
import { computeMucusRank } from './rank';
import { CycleResult, DailyEntry, PhaseLabel } from './types';

interface RecalcOptions {
  debug?: boolean;
}

/**
 * Find the start of the most recent cycle by locating the last occurrence
 * of heavy or moderate bleeding. Per Creighton rules, a new cycle begins
 * on the first day of menstruation (heavy/moderate bleeding).
 */
function findCurrentCycleStart(entries: Array<DailyEntry | null>): number {
  let startIndex = 0;
  for (let i = 0; i < entries.length; i += 1) {
    const bleeding = entries[i]?.bleeding;
    if (bleeding === 'heavy' || bleeding === 'moderate') {
      const prevBleeding = i > 0 ? entries[i - 1]?.bleeding : undefined;
      const prevIsHeavyOrModerate =
        prevBleeding === 'heavy' || prevBleeding === 'moderate';
      if (!prevIsHeavyOrModerate) {
        startIndex = i;
      }
    }
  }
  return startIndex;
}

/**
 * RULES ENGINE SPEC: docs/RULES_ENGINE_SPEC.md
 * Recompute whole cycle on every edit. Predictive behavior is forbidden.
 */
export function recalculateCycle(entries: Array<DailyEntry | null>, options: RecalcOptions = {}): CycleResult {
  const phaseLabels: PhaseLabel[] = new Array(entries.length).fill('dry');
  const mucusRanks = entries.map((entry) => computeMucusRank(entry));
  const cycleStartIndex = findCurrentCycleStart(entries);

  const fertileStartIndex = detectFertileStart(mucusRanks, cycleStartIndex);
  const { peakIndex, fertileEndIndex } = detectPeak(mucusRanks, cycleStartIndex);

  const hasFertileWindow = fertileStartIndex !== null;
  const peakConfirmed = peakIndex !== null && fertileEndIndex !== null;

  for (let i = 0; i < entries.length; i += 1) {
    const rank = mucusRanks[i];

    if (i < cycleStartIndex) {
      phaseLabels[i] = 'previous_cycle';
      continue;
    }

    if (entries[i]?.missing || entries[i] === null || rank === null) {
      phaseLabels[i] = 'missing';
      continue;
    }

    if (peakConfirmed) {
      if (i < fertileStartIndex!) {
        phaseLabels[i] = 'dry';
      } else if (i < peakIndex!) {
        phaseLabels[i] = 'fertile_open';
      } else if (i === peakIndex) {
        phaseLabels[i] = 'peak_confirmed';
      } else if (i === peakIndex! + 1) {
        phaseLabels[i] = 'p_plus_1';
      } else if (i === peakIndex! + 2) {
        phaseLabels[i] = 'p_plus_2';
      } else if (i === peakIndex! + 3) {
        phaseLabels[i] = 'p_plus_3';
      } else if (i > fertileEndIndex!) {
        phaseLabels[i] = 'post_peak';
      }
    } else if (hasFertileWindow && i >= fertileStartIndex!) {
      phaseLabels[i] = 'fertile_unconfirmed_peak';
    } else {
      phaseLabels[i] = 'dry';
    }
  }

  if (options.debug) {
    // eslint-disable-next-line no-console
    console.debug({ cycleStartIndex, mucusRanks, fertileStartIndex, peakIndex, fertileEndIndex, phaseLabels });
  }

  return { peakIndex, fertileStartIndex, fertileEndIndex, phaseLabels, mucusRanks };
}
