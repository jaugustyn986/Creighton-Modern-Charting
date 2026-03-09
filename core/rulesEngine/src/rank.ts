import { Appearance, DailyEntry, Observation } from './types';

/**
 * RULES ENGINE SPEC: docs/RULES_ENGINE_SPEC.md
 * Deterministic rank mapping only. Predictive features are forbidden.
 */
export function computeMucusRank(entry: DailyEntry | null): number | null {
  if (!entry || entry.missing) return null;

  if (typeof entry.mucusRankOverride === 'number') {
    return Math.max(0, Math.min(3, Math.trunc(entry.mucusRankOverride)));
  }

  if (entry.observations?.length) {
    return Math.max(...entry.observations.map((obs) => computeObservationRank(obs)));
  }

  return computeObservationRank({
    sensation: entry.sensation ?? 'dry',
    appearances: entry.appearances ?? [],
  });
}

function sensationRank(sensation: string): number {
  switch (sensation) {
    case 'stretchy': return 3;
    case 'tacky': return 2;
    case 'wet': return 2;
    case 'sticky': return 1;
    case 'shiny': return 1;
    case 'damp': return 1;
    default: return 0;
  }
}

function appearanceBoost(appearances: Appearance[]): number {
  let rank = 0;
  for (const a of appearances) {
    if (a === 'clear' || a === 'cloudy_clear' || a === 'lubricative') rank = Math.max(rank, 3);
    else if (a === 'cloudy' || a === 'gummy' || a === 'pasty' || a === 'yellow') rank = Math.max(rank, 1);
  }
  return rank;
}

function lubricativePromotion(sensation: string, appearances: Appearance[]): number {
  if (!appearances.includes('lubricative')) return 0;
  if (sensation === 'damp' || sensation === 'shiny' || sensation === 'wet') return 3;
  return 0;
}

function computeObservationRank(observation: Observation): number {
  const sr = sensationRank(observation.sensation);
  const ab = appearanceBoost(observation.appearances);
  const lp = lubricativePromotion(observation.sensation, observation.appearances);
  return Math.max(sr, ab, lp);
}
