/**
 * OnboardingPanels — static, code-rendered UI previews for onboarding slides.
 *
 * Each panel mirrors the real app's exact component styles so it looks identical
 * to the live UI at native resolution. No image assets, no upscaling, no blur.
 *
 * Data policy: all state shown is illustrative (early-cycle defaults and empty
 * stats). No user-specific values are fabricated.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BG_CARD, BG_PAGE, BG_CARD_GRADIENT_START, BG_POST_PEAK, BG_PEAK_TYPE,
  BG_BLEEDING, BG_DRY, BG_NO_ENTRY, BG_MISSING,
  BANNER_TONE_POSITIVE_BG, FERTILE_ACCENT, PEAK_BORDER,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, TEXT_SUBTLE,
  BORDER_CARD, BORDER_TODAY,
  ACCENT_WARM, ACCENT_WARM_TINT, BRAND_NAME,
} from '../theme/colors';

/* ─────────────────────────────────────────────────
   Shared wrapper
───────────────────────────────────────────────── */

function PhoneCard({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <View style={shared.card}>
      {children}
    </View>
  );
}

const shared = StyleSheet.create({
  card: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_CARD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});

/* ─────────────────────────────────────────────────
   Mini calendar (internal — used by slides 2, 4, 7)

   April 2026: starts Wednesday (offset = 3).
   Each cell can carry an optional dot (mucus indicator).
───────────────────────────────────────────────── */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const APRIL_OFFSET = 3; // April 1 2026 = Wednesday

type CellData = { day: number; bg: string; isToday: boolean; dot?: string; peakBorder?: boolean } | null;

function padAndChunk(days: CellData[]): CellData[][] {
  const cells: CellData[] = [
    ...Array(APRIL_OFFSET).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: CellData[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/** Slide 2 — bleeding days 1-3, no-entry day 4, dry days 5-6, today=7 */
function buildSlide2Cells(): CellData[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = i + 1;
    let bg = BG_NO_ENTRY;
    if (d <= 3) bg = BG_BLEEDING;
    else if (d === 5 || d === 6) bg = BG_DRY;
    return { day: d, bg, isToday: d === 7 };
  });
}

/** Slide 4 — mucus 1-2 (dot), peak-type 3, confirmed peak 4 (charcoal border), post-peak 5-7, today=7 */
function buildSlide4Cells(): CellData[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = i + 1;
    let bg = BG_NO_ENTRY;
    let dot: string | undefined;
    let peakBorder: boolean | undefined;
    if (d <= 2) { bg = BG_DRY; dot = FERTILE_ACCENT; }
    else if (d === 3) { bg = BG_PEAK_TYPE; }
    else if (d === 4) { bg = BG_PEAK_TYPE; peakBorder = true; }
    else if (d >= 5 && d <= 7) { bg = BG_POST_PEAK; }
    return { day: d, bg, isToday: d === 7, dot, peakBorder };
  });
}

/** Slide 7 — all no-entry, today=7 */
function buildSlide7Cells(): CellData[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = i + 1;
    return { day: d, bg: BG_NO_ENTRY, isToday: d === 7 };
  });
}

function MiniCalendar({ cells, rows = 3 }: { cells: CellData[]; rows?: number }): JSX.Element {
  const allRows = padAndChunk(cells);
  const visible = allRows.slice(0, rows);

  return (
    <View style={cal.wrap}>
      <View style={cal.header}>
        <Text style={cal.arrow}>{'<'}</Text>
        <Text style={cal.month}>April 2026</Text>
        <Text style={cal.arrow}>{'>'}</Text>
      </View>
      <View style={cal.wdRow}>
        {WEEKDAYS.map(w => <Text key={w} style={cal.wd}>{w}</Text>)}
      </View>
      {visible.map((row, ri) => (
        <View key={ri} style={cal.row}>
          {row.map((cell, ci) =>
            !cell
              ? <View key={ci} style={cal.cell} />
              : (
                <View
                  key={ci}
                  style={[
                    cal.cell,
                    { backgroundColor: cell.bg },
                    cell.peakBorder && cal.peakBorder,
                    !cell.peakBorder && cell.isToday && cal.today,
                  ]}
                >
                  <Text style={cal.num}>{cell.day}</Text>
                  {cell.dot ? <View style={[cal.dot, { backgroundColor: cell.dot }]} /> : null}
                </View>
              ),
          )}
        </View>
      ))}
    </View>
  );
}

const cal = StyleSheet.create({
  wrap: { marginTop: 0, maxWidth: 380, width: '100%' as unknown as number, alignSelf: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  arrow: { fontSize: 17, color: TEXT_SUBTLE, paddingHorizontal: 8 },
  month: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  wdRow: { flexDirection: 'row', marginBottom: 2 },
  wd: { flex: 1, textAlign: 'center', fontSize: 10, color: TEXT_MUTED, fontWeight: '500' },
  row: { flexDirection: 'row' },
  cell: {
    flex: 1, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 6, margin: 1,
  },
  today: { borderWidth: 2, borderColor: BORDER_TODAY },
  peakBorder: { borderWidth: 2, borderColor: PEAK_BORDER },
  num: { fontSize: 12, fontWeight: '500', color: TEXT_PRIMARY },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    position: 'absolute', top: 3, right: 3,
  },
});

/* ─────────────────────────────────────────────────
   SLIDE 2 — "Not sure what your chart means?"
   Matches reference: Tracking banner + calendar with
   bleeding days 1-3, dry days 5-6, today=7 (no entry).
───────────────────────────────────────────────── */

export function OnboardingCalendarUncertaintyPanel(): JSX.Element {
  return (
    <View style={{ gap: 10 }}>
      <PhoneCard>
        <View style={[banner.container, { backgroundColor: BG_CARD_GRADIENT_START }]}>
          <Text style={banner.headline}>Tracking</Text>
          <Text style={banner.confidence}>Moderate confidence — pattern still forming</Text>
          <Text style={banner.cycleDay}>Cycle Day 7</Text>
          <Text style={banner.extra}>1 day still open in this cycle</Text>
          <Text style={banner.support}>As you add days, your cycle pattern becomes clearer.</Text>
        </View>
      </PhoneCard>
      <PhoneCard>
        <MiniCalendar cells={buildSlide2Cells()} rows={5} />
      </PhoneCard>
    </View>
  );
}

/* ─────────────────────────────────────────────────
   SLIDE 4 — "See where you are in your cycle"
   Matches reference: Post-peak phase banner (green bg)
   + calendar with mucus days 1-2 (dot), post-peak 5-7,
   today=7.
───────────────────────────────────────────────── */

export function OnboardingStatusBannerPanel(): JSX.Element {
  return (
    <View style={{ gap: 10 }}>
      <PhoneCard>
        <View style={[banner.container, { backgroundColor: BANNER_TONE_POSITIVE_BG }]}>
          <Text style={banner.headline}>Post-peak phase</Text>
          <Text style={banner.confidence}>High confidence — Peak confirmed</Text>
          <Text style={banner.cycleDay}>Cycle Day 15</Text>
          <Text style={banner.extra}>No gaps in your chart this cycle</Text>
          <Text style={banner.support}>Three days past Peak confirm the post-Peak phase.</Text>
        </View>
      </PhoneCard>
      <PhoneCard>
        <MiniCalendar cells={buildSlide4Cells()} rows={5} />
      </PhoneCard>
    </View>
  );
}

const banner = StyleSheet.create({
  container: { borderRadius: 10, padding: 14 },
  headline: { fontSize: 19, fontWeight: '600', color: TEXT_PRIMARY, letterSpacing: -0.2 },
  confidence: { fontSize: 13, fontWeight: '500', color: TEXT_SECONDARY, marginTop: 8, lineHeight: 20 },
  cycleDay: { fontSize: 12, color: TEXT_SUBTLE, marginTop: 4, lineHeight: 17 },
  extra: { fontSize: 12, color: TEXT_SUBTLE, marginTop: 2, lineHeight: 17 },
  support: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 8, lineHeight: 20 },
});

/* ─────────────────────────────────────────────────
   SLIDE 5 — "Record a simple observation each day"
   Shows the top section of EntryForm (bleeding, hint).
───────────────────────────────────────────────── */

const BLEEDING_LABELS = ['None', 'Spotting', 'Light', 'Moderate', 'Heavy', 'Brown'];
const SENSATION_LABELS = ['Dry', 'Damp', 'Wet', 'Stretchy'];

export function OnboardingEntryPanel(): JSX.Element {
  return (
    <PhoneCard>
      <Text style={entry.title}>Daily Observation</Text>
      <View style={entry.dateBox}>
        <Text style={entry.dateText}>April 7, 2026</Text>
      </View>

      <View style={entry.toggleRow}>
        <Text style={entry.toggleLabel}>Did you observe today?</Text>
        {/* Static toggle in "on" position */}
        <View style={entry.switchTrack}>
          <View style={entry.switchThumb} />
        </View>
      </View>

      <View style={entry.section}>
        <Text style={entry.fieldLabel}>Bleeding</Text>
        <View style={entry.pillRow}>
          {BLEEDING_LABELS.map((label, i) => (
            <View key={label} style={[entry.pill, i === 0 && entry.pillSelected]}>
              <Text style={[entry.pillText, i === 0 && entry.pillTextSel]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={entry.hintCard}>
        <Text style={entry.hintText}>
          Record your most fertile observation of the day — not just the most recent.
        </Text>
      </View>

      <View style={entry.section}>
        <Text style={entry.fieldLabel}>Sensation</Text>
        <View style={entry.pillRow}>
          {SENSATION_LABELS.map(s => (
            <View key={s} style={entry.pill}>
              <Text style={entry.pillText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </PhoneCard>
  );
}

const entry = StyleSheet.create({
  title: { fontSize: 19, fontWeight: '600', color: TEXT_PRIMARY },
  dateBox: {
    borderWidth: 1, borderColor: BORDER_CARD, borderRadius: 8,
    padding: 10, marginTop: 8,
  },
  dateText: { fontSize: 14, color: TEXT_PRIMARY },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: BG_MISSING, padding: 12, borderRadius: 10, marginTop: 10,
  },
  toggleLabel: { fontSize: 13, fontWeight: '500', color: TEXT_SECONDARY },
  switchTrack: {
    width: 42, height: 24, borderRadius: 12, backgroundColor: '#34C759',
    justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 2,
  },
  switchThumb: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },
  section: { marginTop: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: TEXT_SECONDARY, marginBottom: 6 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: BORDER_CARD,
  },
  pillSelected: { backgroundColor: ACCENT_WARM_TINT, borderColor: ACCENT_WARM },
  pillText: { fontSize: 12, color: TEXT_SECONDARY },
  pillTextSel: { color: BRAND_NAME, fontWeight: '600' },
  hintCard: {
    backgroundColor: '#f0fdf4', borderLeftWidth: 3, borderLeftColor: '#16a34a',
    padding: 9, borderRadius: 8, marginTop: 10,
  },
  hintText: { fontSize: 11, color: '#166534', fontStyle: 'italic', lineHeight: 17 },
});

/* ─────────────────────────────────────────────────
   SLIDE 6 — "Understand your pattern over time"
   Mock data sourced from reference screenshot provided by user.
───────────────────────────────────────────────── */

const STAT_CARDS = [
  { label: 'Complete cycles', value: '3' },
  { label: 'Avg Cycle (days)', value: '27' },
  { label: 'Avg Peak Day',     value: 'Day 17' },
  { label: 'Avg Luteal Phase', value: '11 days' },
];

const PATTERN_INSIGHTS = [
  'Peak day has ranged from cycle day 13 to 22.',
  'Fertile window typically opens around cycle day 8.',
  'Average luteal phase is 11 days.',
  'Your cycles show significant variation in length.',
];

export function OnboardingHistoryPanel(): JSX.Element {
  return (
    <View style={{ gap: 10 }}>
      <PhoneCard>
        <Text style={hist.heading}>Cycle Summary</Text>
        <View style={hist.grid}>
          {STAT_CARDS.map(c => (
            <View key={c.label} style={hist.card}>
              <Text style={hist.value}>{c.value}</Text>
              <Text style={hist.label}>{c.label}</Text>
            </View>
          ))}
        </View>
      </PhoneCard>

      <PhoneCard>
        <Text style={hist.heading}>Your Patterns</Text>
        {PATTERN_INSIGHTS.map((text, i) => (
          <View key={i} style={hist.bulletRow}>
            <Text style={hist.bullet}>{'\u2022'}</Text>
            <Text style={hist.insight}>{text}</Text>
          </View>
        ))}
      </PhoneCard>
    </View>
  );
}

const hist = StyleSheet.create({
  heading: { fontSize: 17, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    backgroundColor: BG_PAGE, borderRadius: 10, padding: 12,
    width: '48%' as unknown as number, flexGrow: 1,
    borderWidth: 1, borderColor: BORDER_CARD,
  },
  value: { fontSize: 20, fontWeight: '700', color: TEXT_PRIMARY },
  label: { fontSize: 10, color: TEXT_MUTED, marginTop: 2 },
  bulletRow: { flexDirection: 'row', marginBottom: 6 },
  bullet: { fontSize: 13, color: TEXT_SECONDARY, marginRight: 7, lineHeight: 20 },
  insight: { flex: 1, fontSize: 13, color: TEXT_SECONDARY, lineHeight: 20 },
});

/* ─────────────────────────────────────────────────
   SLIDE 7 — "Start your first cycle"
   Empty calendar + today's entry prompt below.
───────────────────────────────────────────────── */

export function OnboardingEmptyCalendarPanel(): JSX.Element {
  return (
    <View style={{ gap: 10 }}>
      <PhoneCard>
        <MiniCalendar cells={buildSlide7Cells()} rows={4} />
      </PhoneCard>

      <PhoneCard>
        <View style={todayEntry.row}>
          <Text style={todayEntry.title}>Today's Observation</Text>
          <Text style={todayEntry.date}>Apr 7</Text>
        </View>
        <View style={todayEntry.divider} />
        <View style={todayEntry.tapRow}>
          <Text style={todayEntry.tapLabel}>Tap to record today's observation</Text>
          <Text style={todayEntry.chevron}>{'›'}</Text>
        </View>
      </PhoneCard>
    </View>
  );
}

const todayEntry = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  date: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_CARD,
    marginBottom: 10,
  },
  tapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tapLabel: {
    fontSize: 15,
    color: ACCENT_WARM,
  },
  chevron: {
    fontSize: 20,
    color: ACCENT_WARM,
    lineHeight: 22,
  },
});
