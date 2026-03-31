import { addDaysIso, compareIsoDate, entryDateOrSynthetic } from './calendar';
import { blocksFertileOpening } from './flowBleeding';
import { DailyEntry, FertileStartReason } from './types';

function buildDateToIndex(entries: DailyEntry[]): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < entries.length; i++) {
    m.set(entryDateOrSynthetic(entries[i]?.date, i), i);
  }
  return m;
}

function gapOrMissingBetween(
  entries: DailyEntry[],
  ranks: Array<number | null | undefined>,
  startIdx: number,
  endIdx: number,
  dateToIndex: Map<string, number>,
): boolean {
  const d0 = entryDateOrSynthetic(entries[startIdx]?.date, startIdx);
  const d1 = entryDateOrSynthetic(entries[endIdx]?.date, endIdx);
  if (compareIsoDate(d0, d1) >= 0) return false;
  let cur = addDaysIso(d0, 1);
  while (compareIsoDate(cur, d1) < 0) {
    const idx = dateToIndex.get(cur);
    if (idx === undefined) return true;
    if (entries[idx]?.missing) return true;
    const r = ranks[idx];
    if (r === null || r === undefined) return true;
    cur = addDaysIso(cur, 1);
  }
  return false;
}

/**
 * First mucus after flow phase; conservative when gaps/missing precede first mucus.
 */
export function detectFertileStartDetailed(
  entries: DailyEntry[],
  ranks: Array<number | null | undefined>,
  cycleStartIndex: number,
): { fertileStartIndex: number | null; fertileStartReason: FertileStartReason | null } {
  const dateToIndex = buildDateToIndex(entries);
  for (let i = cycleStartIndex; i < entries.length; i += 1) {
    const rank = ranks[i];
    if (rank == null || rank < 1) continue;
    if (blocksFertileOpening(entries[i]?.bleeding)) continue;
    let uncertain = false;
    for (let j = cycleStartIndex; j < i; j += 1) {
      if (entries[j]?.missing || ranks[j] === null || ranks[j] === undefined) {
        uncertain = true;
        break;
      }
    }
    if (!uncertain) {
      uncertain = gapOrMissingBetween(entries, ranks, cycleStartIndex, i, dateToIndex);
    }
    return {
      fertileStartIndex: i,
      fertileStartReason: uncertain ? 'uncertain_due_to_missing' : 'first_mucus_after_dry',
    };
  }
  return { fertileStartIndex: null, fertileStartReason: null };
}

/** @deprecated Use detectFertileStartDetailed with real entries for flow-aware opening. */
export function detectFertileStart(
  ranks: Array<number | null | undefined>,
  startIndex = 0,
): number | null {
  const entries: DailyEntry[] = ranks.map(() => ({}));
  return detectFertileStartDetailed(entries, ranks, startIndex).fertileStartIndex;
}
