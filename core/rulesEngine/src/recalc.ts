import { deriveBleedingMetadata } from './bleedingDerive';
import { addDaysIso, compareIsoDate, entryDateOrSynthetic } from './calendar';
import { blocksFertileOpening } from './flowBleeding';
import { detectFertileStartDetailed } from './fertileWindow';
import { deriveMucusDerivedByDay } from './mucusClassification';
import {
  derivePrimaryDayClassByDay,
  phaseCoercedToDryDuringFlow,
} from './primaryDayClass';
import { detectPeak } from './peak';
import { computeMucusRank } from './rank';
import {
  CycleResult,
  DailyEntry,
  FertileStartReason,
  InterpretationWarningId,
  PhaseLabel,
} from './types';

interface RecalcOptions {
  debug?: boolean;
}

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

function buildDateToIndex(entries: DailyEntry[]): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < entries.length; i += 1) {
    m.set(entryDateOrSynthetic(entries[i]?.date, i), i);
  }
  return m;
}

function collectInterpretationWarnings(
  entries: DailyEntry[],
  ranks: Array<number | null>,
  peakCandidateIndex: number | null,
  peakIndex: number | null,
  fertileStartReason: FertileStartReason | null,
): InterpretationWarningId[] {
  const w: InterpretationWarningId[] = [];
  if (fertileStartReason === 'uncertain_due_to_missing') {
    w.push('uncertain_fertile_start');
  }
  if (peakCandidateIndex !== null && peakIndex === null) {
    const dateToIndex = buildDateToIndex(entries);
    const D = entryDateOrSynthetic(entries[peakCandidateIndex]?.date, peakCandidateIndex);
    let blockedByGapOrMissing = false;
    for (let k = 1; k <= 3; k += 1) {
      const nextD = addDaysIso(D, k);
      const idx = dateToIndex.get(nextD);
      if (idx === undefined) {
        w.push('calendar_gap_blocks_peak_confirmation');
        blockedByGapOrMissing = true;
        break;
      }
      if (entries[idx]?.missing || ranks[idx] === null) {
        w.push('missing_blocks_peak_confirmation');
        blockedByGapOrMissing = true;
        break;
      }
    }
    if (!blockedByGapOrMissing) {
      w.push('peak_confirmation_incomplete');
    }
  }
  return w;
}

export function recalculateCycle(
  entries: Array<DailyEntry | null>,
  options: RecalcOptions = {},
): CycleResult {
  const safeEntries: DailyEntry[] = entries.map((e) => e ?? {});
  const phaseLabels: PhaseLabel[] = new Array(safeEntries.length).fill('dry');
  const mucusRanks = safeEntries.map((entry) => computeMucusRank(entry));
  const mucusDerivedByDay = deriveMucusDerivedByDay(safeEntries, mucusRanks);
  const cycleStartIndex = findCurrentCycleStart(safeEntries);

  const { fertileStartIndex, fertileStartReason } = detectFertileStartDetailed(
    safeEntries,
    mucusRanks,
    cycleStartIndex,
  );

  const {
    peakCandidateIndex,
    peakIndex,
    fertileEndIndex,
  } = detectPeak(safeEntries, mucusRanks, cycleStartIndex);

  const peakConfirmed = peakIndex !== null && fertileEndIndex !== null;
  const hasFertileWindow = fertileStartIndex !== null;

  const interpretationWarnings = collectInterpretationWarnings(
    safeEntries,
    mucusRanks,
    peakCandidateIndex,
    peakIndex,
    fertileStartReason,
  );

  const { bleedingClassByDay, brownBleedingContextByDay } = deriveBleedingMetadata(
    safeEntries,
    cycleStartIndex,
    peakConfirmed,
    fertileEndIndex,
  );

  const dataComplete = interpretationWarnings.length === 0;

  for (let i = 0; i < safeEntries.length; i += 1) {
    const rank = mucusRanks[i];

    if (i < cycleStartIndex) {
      phaseLabels[i] = 'previous_cycle';
      continue;
    }

    if (safeEntries[i]?.missing || entries[i] === null || rank === null) {
      phaseLabels[i] = 'missing';
      continue;
    }

    const d = entryDateOrSynthetic(safeEntries[i]?.date, i);

    if (peakConfirmed && peakIndex !== null && fertileStartIndex !== null) {
      const peakDate = entryDateOrSynthetic(safeEntries[peakIndex]?.date, peakIndex);
      const fertileStartDate = entryDateOrSynthetic(
        safeEntries[fertileStartIndex]?.date,
        fertileStartIndex,
      );
      if (compareIsoDate(d, fertileStartDate) < 0) {
        phaseLabels[i] = 'dry';
      } else if (compareIsoDate(d, peakDate) < 0) {
        phaseLabels[i] = 'fertile_open';
      } else if (d === peakDate) {
        phaseLabels[i] = 'peak_confirmed';
      } else if (d === addDaysIso(peakDate, 1)) {
        phaseLabels[i] = 'p_plus_1';
      } else if (d === addDaysIso(peakDate, 2)) {
        phaseLabels[i] = 'p_plus_2';
      } else if (d === addDaysIso(peakDate, 3)) {
        phaseLabels[i] = 'p_plus_3';
      } else if (compareIsoDate(d, addDaysIso(peakDate, 3)) > 0) {
        phaseLabels[i] = 'post_peak';
      } else {
        phaseLabels[i] = 'dry';
      }
    } else if (hasFertileWindow && fertileStartIndex !== null) {
      const fertileStartDate = entryDateOrSynthetic(
        safeEntries[fertileStartIndex]?.date,
        fertileStartIndex,
      );
      if (compareIsoDate(d, fertileStartDate) >= 0) {
        phaseLabels[i] = 'fertile_unconfirmed_peak';
      } else {
        phaseLabels[i] = 'dry';
      }
    } else {
      phaseLabels[i] = 'dry';
    }
  }

  for (let i = 0; i < safeEntries.length; i += 1) {
    if (
      blocksFertileOpening(safeEntries[i]?.bleeding) &&
      phaseCoercedToDryDuringFlow(phaseLabels[i])
    ) {
      phaseLabels[i] = 'dry';
    }
  }

  const primaryDayClassByDay = derivePrimaryDayClassByDay(
    safeEntries,
    mucusRanks,
    bleedingClassByDay,
  );

  if (options.debug) {
    console.debug({
      cycleStartIndex,
      mucusRanks,
      fertileStartIndex,
      peakIndex,
      fertileEndIndex,
      phaseLabels,
    });
  }

  return {
    peakCandidateIndex,
    peakIndex,
    peakConfirmed,
    fertileStartIndex,
    fertileStartReason,
    fertileEndIndex,
    phaseLabels,
    mucusRanks,
    mucusDerivedByDay,
    bleedingClassByDay,
    brownBleedingContextByDay,
    dataComplete,
    interpretationWarnings,
    primaryDayClassByDay,
  };
}
