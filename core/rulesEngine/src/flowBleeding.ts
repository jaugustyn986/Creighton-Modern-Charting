/**
 * Flow bleeding types: days treated as menstrual flow for fertile opening and peak candidacy.
 * See docs/RULES_ENGINE_SPEC.md — Fertile start, Peak candidate.
 */
const FLOW_BLEEDING = new Set(['heavy', 'moderate', 'light', 'spotting']);

export function blocksFertileOpening(bleeding: string | undefined): boolean {
  return FLOW_BLEEDING.has(bleeding ?? 'none');
}
