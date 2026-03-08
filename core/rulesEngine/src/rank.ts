import { DailyEntry, Observation } from './types';

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
    appearance: entry.appearance ?? 'none',
    quantity: entry.quantity
  });
}

function computeObservationRank(observation: Observation): number {
  if (observation.sensation === 'dry' && observation.appearance === 'none') return 0;
  if (
    observation.sensation === 'slippery' ||
    observation.appearance === 'clear' ||
    observation.appearance === 'stretchy'
  ) {
    return 3;
  }
  if (observation.sensation === 'wet') return 2;
  if (observation.sensation === 'damp') return 1;
  if (observation.appearance !== 'none') return 1;
  return 0;
}
