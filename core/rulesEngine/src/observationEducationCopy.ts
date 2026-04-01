/**
 * User-facing help and chart labels derived from the same rules as the engine.
 * Keep aligned with docs/RULES_ENGINE_SPEC.md, rank.ts, and creightonCode.ts.
 */

/** Column header for PDF / tables: chart strength from mucusRank (not numeric rank). */
export const PDF_CHART_STRENGTH_HEADER = 'Chart';

/**
 * Short label for calendar / daily log / PDF row from internal mucus rank (0–3).
 * Internal values are unchanged; this is presentation only.
 */
export function mucusChartStrengthLabel(
  rank: number | null | undefined,
  whenMissing = '',
): string {
  if (rank === null || rank === undefined) return whenMissing;
  const r = Math.trunc(rank);
  switch (r) {
    case 0:
      return 'Dry';
    case 1:
      return 'Damp';
    case 2:
      return 'Wet';
    case 3:
      return 'Peak-type';
    default:
      return whenMissing;
  }
}

export const HELP_HOW_TO_OBSERVE_TITLE = 'How do I make my observation?';

export const HELP_HOW_TO_OBSERVE_BODY =
  'Use folded toilet tissue and wipe front to back.\n\n' +
  '\u2022 Note the sensation (what you feel)\n' +
  '\u2022 Note the appearance of any mucus on the tissue (what you see)\n' +
  '\u2022 Check before and after toileting throughout the day\n' +
  '\u2022 Make a final observation at bedtime\n' +
  '\u2022 Record the most fertile sign you noticed all day \u2014 not just the last check';

export const HELP_SENSATION_APPEARANCE_TITLE = 'How do sensation and appearance work together?';

export const HELP_SENSATION_APPEARANCE_BODY =
  'Each day, you record what you feel (sensation) and what you see (appearance).\n\n' +
  'The app looks at both and identifies the most fertile sign of the day.\n\n' +
  'Sensation describes how it feels (dry, damp, wet, slippery).\n' +
  'Appearance describes what you see (cloudy, clear, stretchy, etc.).\n\n' +
  'When both are present, the app uses the strongest fertility sign from either one.\n\n' +
  'Examples:\n\n' +
  'Dry sensation with no mucus \u2192 dry day\n' +
  'Damp or sticky mucus \u2192 early fertile pattern\n' +
  'Clear, stretchy, or lubricative mucus \u2192 peak-type pattern\n\n' +
  'If you record multiple observations in one day, the app uses the most fertile one.\n\n' +
  'During your period\n\n' +
  'If you are experiencing menstrual flow, bleeding is the primary sign. Mucus observations during this time are not used to identify fertility.';

export const HELP_TRYING_TO_CONCEIVE_BODY =
  'Best timing:\n' +
  'Have intercourse every 1\u20132 days starting when you first see non-dry mucus on your chart (the first day that is not a dry day) and continue through Peak Day.\n\n' +
  'The fertile window is approximately 6 days before ovulation through 1 day after. Your chances are highest 1\u20132 days before ovulation.\n\n' +
  'Tip: Don\u2019t wait for peak-type mucus to start. Sperm can survive in fertile mucus for several days, so starting when you first notice fertile signs improves your chances.';

/** Color guide: day with non-peak mucus signal (green dot on calendar). */
export const HELP_COLOR_GUIDE_NON_PEAK_MUCUS =
  'Non-peak mucus (green dot on calendar)';

/** Color guide: peak-type mucus (warm grey calendar tile). */
export const HELP_COLOR_GUIDE_PEAK_TYPE_MUCUS =
  'Peak-type mucus (warm grey calendar days)';

export const HELP_WHAT_IS_PEAK_DAY_TITLE = 'What is the Peak Day?';

export const HELP_WHAT_IS_PEAK_DAY_BODY =
  'The Peak Day is the last day of peak-type mucus (clear, stretchy, or lubricative).\n\n' +
  'It is only confirmed after three full days of lower-quality observations.\n\n' +
  'Why it matters: Ovulation typically occurs within 1\u20132 days after the Peak Day. Once Peak is confirmed, the fertile window is considered closed.';

export interface HelpStatusMessageSection {
  title: string;
  body: string;
}

/** Glossary for status headlines (Understanding Your Chart). */
export const HELP_STATUS_MESSAGE_SECTIONS: readonly HelpStatusMessageSection[] = [
  {
    title: 'Menstrual flow',
    body:
      'You\u2019re in your period. Bleeding is the primary sign during this time, and fertility is not assessed.',
  },
  {
    title: 'Tracking',
    body:
      'You\u2019re recording observations, but no fertile signs have been identified yet.',
  },
  {
    title: 'Fertile pattern',
    body:
      'Mucus has been observed. This may be the start of your fertile window.',
  },
  {
    title: 'Fertile pattern \u2014 Peak not confirmed yet',
    body:
      'Fertile signs are present, but Peak has not been confirmed. The pattern is still developing.',
  },
  {
    title: 'Peak day identified',
    body:
      'A Peak Day has been identified. Ovulation likely occurred within the last 1\u20132 days.',
  },
  {
    title: 'Post-peak phase',
    body:
      'You are past Peak. Three days of lower-quality mucus confirm the end of the fertile window.',
  },
  {
    title: 'Missing observation',
    body:
      'A required observation is missing. This can prevent the app from confirming Peak or identifying the fertile window accurately.',
  },
];
