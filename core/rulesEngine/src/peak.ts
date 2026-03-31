import { addDaysIso, entryDateOrSynthetic } from './calendar';
import { blocksFertileOpening } from './flowBleeding';
import { DailyEntry } from './types';

/**
 * RULES ENGINE SPEC: docs/RULES_ENGINE_SPEC.md
 * Peak confirmed using three consecutive calendar days after peak-type day.
 */
export function detectPeak(
  entries: DailyEntry[],
  ranks: Array<number | null>,
  startIndex: number,
): {
  peakCandidateIndex: number | null;
  peakIndex: number | null;
  fertileEndIndex: number | null;
} {
  const n = entries.length;
  const dateToIndex = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const d = entryDateOrSynthetic(entries[i]?.date, i);
    dateToIndex.set(d, i);
  }

  const peakTypeIndices: number[] = [];
  for (let i = startIndex; i < n; i += 1) {
    if (entries[i]?.missing) continue;
    if (blocksFertileOpening(entries[i]?.bleeding)) continue;
    if (ranks[i] === 3) peakTypeIndices.push(i);
  }

  peakTypeIndices.sort((a, b) =>
    entryDateOrSynthetic(entries[a]?.date, a).localeCompare(
      entryDateOrSynthetic(entries[b]?.date, b),
    ),
  );

  let peakCandidateIndex: number | null =
    peakTypeIndices.length > 0 ? peakTypeIndices[peakTypeIndices.length - 1] : null;

  for (const cand of peakTypeIndices) {
    peakCandidateIndex = cand;
    const D = entryDateOrSynthetic(entries[cand]?.date, cand);
    const candRank = ranks[cand]!;
    let ok = true;
    for (let k = 1; k <= 3; k += 1) {
      const nextD = addDaysIso(D, k);
      const idx = dateToIndex.get(nextD);
      if (idx === undefined) {
        ok = false;
        break;
      }
      if (entries[idx]?.missing) {
        ok = false;
        break;
      }
      const r = ranks[idx];
      if (r === null || r === undefined) {
        ok = false;
        break;
      }
      if (r >= candRank) {
        ok = false;
        break;
      }
    }
    if (ok) {
      const endIdx = dateToIndex.get(addDaysIso(D, 3));
      if (endIdx === undefined) {
        return { peakCandidateIndex: cand, peakIndex: null, fertileEndIndex: null };
      }
      return {
        peakCandidateIndex: cand,
        peakIndex: cand,
        fertileEndIndex: endIdx,
      };
    }
  }

  return {
    peakCandidateIndex,
    peakIndex: null,
    fertileEndIndex: null,
  };
}
