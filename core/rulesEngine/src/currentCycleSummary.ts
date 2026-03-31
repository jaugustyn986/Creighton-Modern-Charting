import { addDaysIso, compareIsoDate } from './calendar';
import {
  CycleResult,
  DailyEntry,
  InterpretationWarningId,
  PhaseLabel,
  PrimaryDayClass,
} from './types';

export type CycleSliceStatus = 'complete' | 'in_progress' | 'no_peak';

export type SummaryTone = 'neutral' | 'caution' | 'positive';

export interface CurrentCycleSummary {
  /** 1-based cycle day for the focused row, or null when there are no entries. */
  cycleDay: number | null;
  headline: string;
  /** Requirement 2: tier + variant only (engine-owned; UI must not infer). */
  confidence: string;
  /** Optional extra line; usually empty so copy lives in guidance (banner layout). */
  supportingContext: string;
  completeness: string;
  guidance: string;
  summaryTone: SummaryTone;
  /** Non-null iff today is not in the slice and there is at least one entry. */
  focusQualification: string | null;
  interpretationNotes: string[];
}

export interface BuildCurrentCycleSummaryParams {
  entries: DailyEntry[];
  result: CycleResult;
  status: CycleSliceStatus;
  todayIndex: number | null;
  /**
   * Device "today" (YYYY-MM-DD). When set on an in-progress slice, days after the
   * last logged date through this date with no stored row count as missing (matches
   * empty cells on the calendar grid).
   */
  calendarAsOfDate?: string;
}

const FOCUS_QUALIFICATION =
  'No entry today. Showing your last logged day.';

/** Last three slice indices ending at focusIndex (inclusive), per RULES_ENGINE_SPEC. */
function recentWindowHasGap(
  entries: DailyEntry[],
  result: CycleResult,
  focusIndex: number,
): boolean {
  const start = Math.max(0, focusIndex - 2);
  for (let i = start; i <= focusIndex; i++) {
    if (entries[i]?.missing === true) return true;
    if (result.phaseLabels[i] === 'missing') return true;
  }
  return false;
}

const WARNING_COPY: Record<InterpretationWarningId, string> = {
  uncertain_fertile_start:
    'Where the chart picks up fertile opening, a gap or missing day earlier in the cycle means that boundary is a little less certain.',
  calendar_gap_blocks_peak_confirmation:
    'There is a calendar gap in the three days after your Peak-type day, so Peak cannot be confirmed from what is logged yet.',
  missing_blocks_peak_confirmation:
    'A missing day in the three days after your Peak-type day means Peak cannot be confirmed until those observations are in.',
  peak_confirmation_incomplete:
    'Peak is not confirmed yet — keep logging; the three days after your Peak-type sign need to show the usual post-Peak pattern.',
};

const WARNING_ORDER: InterpretationWarningId[] = [
  'uncertain_fertile_start',
  'calendar_gap_blocks_peak_confirmation',
  'missing_blocks_peak_confirmation',
  'peak_confirmation_incomplete',
];

function buildInterpretationNotes(result: CycleResult): string[] {
  const seen = new Set<InterpretationWarningId>();
  const notes: string[] = [];
  for (const id of WARNING_ORDER) {
    if (!result.interpretationWarnings.includes(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    notes.push(WARNING_COPY[id]);
  }
  return notes;
}


function eachIsoDayInclusive(from: string, to: string): string[] {
  if (compareIsoDate(from, to) > 0) return [];
  const out: string[] = [];
  let cur = from;
  while (compareIsoDate(cur, to) <= 0) {
    out.push(cur);
    cur = addDaysIso(cur, 1);
  }
  return out;
}

function countDaysWithoutEntry(
  loggedDates: Set<string>,
  from: string,
  to: string,
): number {
  return eachIsoDayInclusive(from, to).filter((d) => !loggedDates.has(d)).length;
}

/**
 * Matches calendar "missing" UX: explicit `missing: true` rows plus calendar days in the
 * slice span (first→last logged date) with no row, plus trailing unlogged days through
 * `calendarAsOfDate` for in-progress cycles.
 */
function countCompletenessMissing(params: {
  entries: DailyEntry[];
  status: CycleSliceStatus;
  calendarAsOfDate?: string;
}): number {
  const { entries, status, calendarAsOfDate } = params;
  const loggedDates = new Set(
    entries.map((e) => e.date ?? '').filter((d) => d.length > 0),
  );
  const explicit = entries.reduce(
    (n, e) => n + (e.missing === true ? 1 : 0),
    0,
  );
  const first = entries[0]?.date ?? '';
  const last = entries[entries.length - 1]?.date ?? '';
  if (!first || !last) return explicit;

  const interiorGaps = countDaysWithoutEntry(loggedDates, first, last);

  let trailingGaps = 0;
  if (
    calendarAsOfDate &&
    status !== 'complete' &&
    compareIsoDate(last, calendarAsOfDate) < 0
  ) {
    const trailStart = addDaysIso(last, 1);
    trailingGaps = countDaysWithoutEntry(
      loggedDates,
      trailStart,
      calendarAsOfDate,
    );
  }

  return explicit + interiorGaps + trailingGaps;
}

function isFocusMissing(
  entries: DailyEntry[],
  focusIndex: number,
  phase: PhaseLabel,
): boolean {
  const e = entries[focusIndex];
  return phase === 'missing' || e?.missing === true || e == null;
}

/**
 * Deterministic confidence tier (Requirement 2 — Summary Confidence Indicator).
 * Evaluated top-to-bottom; High never applies when recent-window gaps exist.
 */
function computeConfidenceLine(
  focusMissing: boolean,
  recentWindowMissing: boolean,
  status: CycleSliceStatus,
  phase: PhaseLabel,
): string {
  if (focusMissing) {
    return 'Low confidence — missing observations';
  }
  if (recentWindowMissing) {
    return 'Low confidence — recent observations missing';
  }
  if (status === 'no_peak') {
    return 'Moderate confidence — pattern still forming';
  }
  if (phase === 'fertile_unconfirmed_peak') {
    return 'Moderate confidence — pattern still forming';
  }
  if (phase === 'p_plus_1' || phase === 'p_plus_2') {
    return 'Moderate confidence — pattern still forming';
  }
  if (
    phase === 'peak_confirmed' ||
    phase === 'p_plus_3' ||
    phase === 'post_peak'
  ) {
    return 'High confidence — Peak confirmed';
  }
  if (
    phase === 'fertile_open' ||
    phase === 'dry' ||
    phase === 'previous_cycle'
  ) {
    return 'Moderate confidence — pattern still forming';
  }
  return 'Moderate confidence — pattern still forming';
}

function headlineFromPhase(phase: PhaseLabel): string {
  switch (phase) {
    case 'dry':
      return 'Dry pattern';
    case 'fertile_open':
      return 'Fertile signs present';
    case 'peak_confirmed':
      return 'Peak day identified';
    case 'p_plus_1':
    case 'p_plus_2':
      return 'Peak day identified';
    case 'p_plus_3':
      return 'Post-peak phase';
    case 'post_peak':
      return 'Post-peak phase';
    case 'fertile_unconfirmed_peak':
      return 'Fertile pattern — Peak not confirmed yet';
    case 'previous_cycle':
      return 'Earlier in this cycle';
    case 'missing':
      return 'Observation incomplete';
    default:
      return 'Continue your observations';
  }
}

/**
 * Deterministic calendar header summary for the current (last) cycle slice.
 * See docs/RULES_ENGINE_SPEC.md — current cycle summary.
 */
export function buildCurrentCycleSummary(
  params: BuildCurrentCycleSummaryParams,
): CurrentCycleSummary {
  const { entries, result, status, todayIndex, calendarAsOfDate } = params;

  if (entries.length === 0) {
    return {
      cycleDay: null,
      headline: 'Your cycle will appear here',
      confidence: 'Moderate confidence — pattern still forming',
      supportingContext: '',
      completeness: 'Nothing charted in this cycle yet.',
      guidance: 'Log today’s observation when you’re ready to begin.',
      summaryTone: 'neutral',
      focusQualification: null,
      interpretationNotes: [],
    };
  }

  const focusIndex =
    todayIndex !== null
      ? todayIndex
      : Math.max(0, entries.length - 1);

  const phase = result.phaseLabels[focusIndex] ?? 'dry';
  const primaryClass: PrimaryDayClass =
    result.primaryDayClassByDay[focusIndex] ?? 'dry';
  const missingCount = countCompletenessMissing({
    entries,
    status,
    calendarAsOfDate,
  });
  const focusMissing = isFocusMissing(entries, focusIndex, phase);
  const recentWindowMissing = recentWindowHasGap(entries, result, focusIndex);

  const focusQualification =
    todayIndex === null ? FOCUS_QUALIFICATION : null;

  const confidence = computeConfidenceLine(
    focusMissing,
    recentWindowMissing,
    status,
    phase,
  );

  const interpretationNotes = buildInterpretationNotes(result);

  let headline: string;
  let guidance: string;
  let summaryTone: SummaryTone;

  if (focusMissing) {
    headline = 'Observation needed for this day';
    guidance =
      'Add this day’s observation when you can so your chart stays accurate.';
    summaryTone = 'caution';
  } else if (primaryClass === 'menstrual_flow') {
    headline = 'Menstrual flow day';
    guidance =
      'This day is logged as menstrual flow. Mucus is still recorded but is not interpreted as Peak-type while flow is selected.';
    summaryTone = 'neutral';
  } else if (primaryClass === 'spotting') {
    headline = 'Spotting';
    guidance =
      'Light bleeding or spotting is noted; combine with your mucus signs for a full picture of the day.';
    summaryTone = 'neutral';
  } else if (status === 'no_peak') {
    headline = 'Peak not yet identified';
    guidance =
      'Keep charting daily; a clear Peak pattern has not appeared on this cycle yet.';
    summaryTone = 'caution';
  } else if (phase === 'fertile_unconfirmed_peak') {
    headline =
      result.interpretationWarnings.includes('peak_confirmation_incomplete') &&
      result.peakCandidateIndex !== null
        ? 'Working toward Peak confirmation'
        : headlineFromPhase(phase);
    guidance =
      'Keep noting your clearest fertile sign each day until Peak can be confirmed on the chart.';
    summaryTone = 'caution';
  } else {
    headline = headlineFromPhase(phase);
    summaryTone = 'neutral';

    if (phase === 'peak_confirmed') {
      guidance =
        'The three days after Peak Day confirm the pattern on your chart.';
    } else if (phase === 'p_plus_1') {
      guidance = 'Day 1 of 3 after Peak toward confirming the pattern.';
    } else if (phase === 'p_plus_2') {
      guidance = 'Day 2 of 3 after Peak toward confirming the pattern.';
    } else if (phase === 'p_plus_3') {
      guidance = 'Three days past Peak confirm the post-Peak phase.';
      summaryTone = 'positive';
    } else if (phase === 'post_peak') {
      guidance = 'Your chart reflects the post-Peak phase.';
      summaryTone = 'positive';
    } else if (phase === 'fertile_open') {
      guidance =
        'Fertile signs are present; more logged days will sharpen the picture.';
    } else if (phase === 'dry' || phase === 'previous_cycle') {
      guidance = 'As you add days, your cycle pattern becomes clearer.';
    } else {
      guidance = 'Continue your daily observations when you can.';
    }
  }

  let supportingContext = '';
  if (
    !focusMissing &&
    primaryClass !== 'menstrual_flow' &&
    primaryClass !== 'spotting' &&
    result.peakCandidateIndex !== null &&
    !result.peakConfirmed
  ) {
    supportingContext =
      'Your chart shows a Peak-type day; the next step is confirming it with the usual three days after.';
  }

  let completeness: string;
  if (missingCount === 0) {
    completeness = 'No gaps in your chart this cycle';
  } else if (missingCount === 1) {
    completeness = '1 day still open in this cycle';
  } else {
    completeness = `${missingCount} days still open in this cycle`;
  }

  return {
    cycleDay: focusIndex + 1,
    headline,
    confidence,
    supportingContext,
    completeness,
    guidance,
    summaryTone,
    focusQualification,
    interpretationNotes,
  };
}
