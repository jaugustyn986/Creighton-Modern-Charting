/**
 * RULES ENGINE SPEC: docs/RULES_ENGINE_SPEC.md
 * Peak confirmed after 3 lower-quality days. Missing days block confirmation.
 * Predictive behavior is forbidden.
 */
export function detectPeak(
  ranks: Array<number | null>,
  startIndex = 0
): { peakIndex: number | null; fertileEndIndex: number | null } {
  let candidate: number | null = null;

  for (let i = startIndex; i < ranks.length; i += 1) {
    const rank = ranks[i];
    if (rank === null) continue;

    if (rank === 3) candidate = i;

    if (candidate === null) continue;

    const candidateRank = ranks[candidate]!;

    if (i > candidate && rank >= candidateRank) {
      candidate = i;
      continue;
    }

    const c1 = ranks[candidate + 1];
    const c2 = ranks[candidate + 2];
    const c3 = ranks[candidate + 3];

    if (c1 === undefined || c2 === undefined || c3 === undefined) continue;
    if (c1 === null || c2 === null || c3 === null) continue;

    if (c1 < candidateRank && c2 < candidateRank && c3 < candidateRank) {
      return { peakIndex: candidate, fertileEndIndex: candidate + 3 };
    }
  }

  return { peakIndex: null, fertileEndIndex: null };
}
