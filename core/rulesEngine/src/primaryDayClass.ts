import { BleedingClass, DailyEntry, PhaseLabel, PrimaryDayClass } from './types';

function mucusPrimary(rank: number | null): Exclude<PrimaryDayClass, 'missing' | 'menstrual_flow' | 'spotting'> {
  if (rank === null) return 'dry';
  if (rank >= 3) return 'peak_type';
  if (rank >= 1) return 'mucus_observed';
  return 'dry';
}

/**
 * Single-day classification for UI (calendar, entry preview) when full slice context is unavailable.
 * Conservative: heavy/moderate/light are treated as menses for preview. Spotting uses mucus when rank ≥ 1.
 */
export function derivePrimaryDayClassFromEntry(
  entry: DailyEntry,
  rank: number | null,
): PrimaryDayClass {
  if (entry.missing || rank === null) return 'missing';

  const b = entry.bleeding ?? 'none';
  if (b === 'heavy' || b === 'moderate' || b === 'light') {
    return 'menstrual_flow';
  }
  if (b === 'spotting') {
    return rank >= 1 ? mucusPrimary(rank) : 'spotting';
  }
  if (b === 'brown') {
    return mucusPrimary(rank);
  }
  return mucusPrimary(rank);
}

/**
 * Per-day primary class for calendar color and copy. Uses `bleedingClassByDay` from `deriveBleedingMetadata`
 * so post-peak spotting with mucus resolves to mucus/peak tiers, not menstrual red.
 */
export function derivePrimaryDayClassAtIndex(
  i: number,
  entries: DailyEntry[],
  ranks: Array<number | null>,
  bleedingClassByDay: BleedingClass[],
): PrimaryDayClass {
  const entry = entries[i];
  const rank = ranks[i];
  if (entry?.missing || rank === null) return 'missing';

  const bc = bleedingClassByDay[i] ?? 'none';

  if (bc === 'cycle_start_flow' || bc === 'continuing_menses') {
    return 'menstrual_flow';
  }

  if (bc === 'post_peak_spotting') {
    return rank >= 1 ? mucusPrimary(rank) : 'spotting';
  }

  if (bc === 'spotting') {
    return rank >= 1 ? mucusPrimary(rank) : 'spotting';
  }

  if (bc === 'brown_discharge' || bc === 'intermenstrual') {
    return mucusPrimary(rank);
  }

  return mucusPrimary(rank);
}

export function derivePrimaryDayClassByDay(
  entries: DailyEntry[],
  ranks: Array<number | null>,
  bleedingClassByDay: BleedingClass[],
): PrimaryDayClass[] {
  return entries.map((_, i) =>
    derivePrimaryDayClassAtIndex(i, entries, ranks, bleedingClassByDay),
  );
}

/** Phases that imply fertile/peak stickers; coerce to dry during true menses flow days. */
export function phaseCoercedToDryDuringFlow(phase: PhaseLabel): boolean {
  return (
    phase === 'fertile_open' ||
    phase === 'fertile_unconfirmed_peak' ||
    phase === 'peak_confirmed' ||
    phase === 'p_plus_1' ||
    phase === 'p_plus_2' ||
    phase === 'p_plus_3'
  );
}
