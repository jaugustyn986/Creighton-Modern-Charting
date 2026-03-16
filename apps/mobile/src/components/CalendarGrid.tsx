import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PhaseLabel } from '../../../../core/rulesEngine/src/types';
import {
  BG_BLEEDING, BG_CARD, BG_DRY, BG_NO_ENTRY, BG_PEAK_TYPE, BG_POST_PEAK,
  FERTILE_ACCENT, PEAK_BORDER,
  TEXT_PRIMARY, TEXT_MUTED, TEXT_SUBTLE,
  BORDER_TODAY, BORDER_CARD, INTERCOURSE_ICON,
} from '../theme/colors';

interface DayInfo {
  date: string;
  hasEntry: boolean;
  phaseLabel?: PhaseLabel;
  isToday: boolean;
  bleeding?: boolean;
  mucusRank?: number | null;
  intercourse?: boolean;
}

interface Props {
  year: number;
  month: number;
  days: DayInfo[];
  onDayPress: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Returns the cell background color based on Creighton sticker system:
// Red sticker → bleeding, Green sticker → dry, White sticker → peak-type mucus,
// Yellow → post-peak (P+1–P+3), White (no tint) → no entry.
function getDayBackground(day: DayInfo): string {
  if (day.bleeding) return BG_BLEEDING;
  if (!day.hasEntry) return BG_NO_ENTRY;

  switch (day.phaseLabel) {
    case 'p_plus_1':
    case 'p_plus_2':
    case 'p_plus_3':
      return BG_POST_PEAK;
    case 'fertile_open':
    case 'fertile_unconfirmed_peak':
      if (day.mucusRank !== null && day.mucusRank !== undefined && day.mucusRank >= 3) return BG_PEAK_TYPE;
      if (day.mucusRank !== null && day.mucusRank !== undefined && day.mucusRank >= 1) return BG_DRY;
      return BG_DRY;
    case 'peak_confirmed':
      return BG_PEAK_TYPE;
    case 'dry':
    case 'post_peak':
      return BG_DRY;
    case 'missing':
    case 'previous_cycle':
      return BG_NO_ENTRY;
    default:
      return BG_DRY;
  }
}

function getIndicatorColor(day: DayInfo): string | null {
  if (!day.hasEntry || day.bleeding) return null;
  if (day.phaseLabel === 'peak_confirmed') return null;

  const rank = day.mucusRank;
  if (rank === null || rank === undefined) return null;
  if (rank >= 3) return null;
  if (rank >= 1) return FERTILE_ACCENT;
  return null;
}

function getDayTextColor(_day: DayInfo): string {
  return TEXT_PRIMARY;
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CalendarGrid({ year, month, days, onDayPress, onPrevMonth, onNextMonth }: Props): JSX.Element {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayString();

  const cells: (DayInfo | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const info = days.find((di) => di.date === dateStr);
    cells.push(info ?? { date: dateStr, hasEntry: false, isToday: dateStr === today });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (DayInfo | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} hitSlop={12}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        <Pressable onPress={onNextMonth} hitSlop={12}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd) => (
          <Text key={wd} style={styles.weekdayText}>{wd}</Text>
        ))}
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((cell, ci) => {
            if (!cell) return <View key={ci} style={styles.cell} />;
            const dayNum = parseInt(cell.date.split('-')[2], 10);
            const bg = getDayBackground(cell);
            const textColor = getDayTextColor(cell);
            const indicatorColor = getIndicatorColor(cell);
            const isPeakConfirmed = cell.phaseLabel === 'peak_confirmed';
            return (
              <Pressable
                key={ci}
                style={[
                  styles.cell,
                  { backgroundColor: bg },
                  cell.isToday && !isPeakConfirmed && styles.todayBorder,
                  isPeakConfirmed && styles.peakBorder,
                ]}
                onPress={() => onDayPress(cell.date)}
              >
                <Text style={[styles.dayText, { color: textColor }]}>{dayNum}</Text>
                {indicatorColor && (
                  <View style={[styles.babyDot, { backgroundColor: indicatorColor }]} />
                )}
                {cell.intercourse && (
                  <Text style={styles.roseIcon}>{INTERCOURSE_ICON}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <LegendItem color={BG_NO_ENTRY} label="No entry" />
        <LegendItem color={BG_BLEEDING} label="Bleeding" />
        <LegendItem color={BG_DRY} label="Dry" />
        <LegendItem color={BG_DRY} dotColor={FERTILE_ACCENT} label="Mucus" />
        <LegendItem color={BG_PEAK_TYPE} label="Peak-type" />
        <LegendItem color={BG_POST_PEAK} label="Post-peak" />
      </View>
    </View>
  );
}

function LegendItem({ color, dotColor, label }: { color: string; dotColor?: string; label: string }): JSX.Element {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]}>
        {dotColor && <View style={[styles.legendBabyDot, { backgroundColor: dotColor }]} />}
      </View>
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: BG_CARD, borderRadius: 12, padding: 12, marginHorizontal: 16, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  navArrow: { fontSize: 20, color: TEXT_SUBTLE, paddingHorizontal: 8 },
  monthTitle: { fontSize: 17, fontWeight: '600', color: TEXT_PRIMARY },
  weekdayRow: { flexDirection: 'row', marginBottom: 4 },
  weekdayText: { flex: 1, textAlign: 'center', fontSize: 12, color: TEXT_MUTED, fontWeight: '500' },
  row: { flexDirection: 'row' },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 1,
  },
  todayBorder: { borderWidth: 2, borderColor: BORDER_TODAY },
  peakBorder: { borderWidth: 2, borderColor: PEAK_BORDER },
  dayText: { fontSize: 14, fontWeight: '500' },
  babyDot: {
    width: 7, height: 7, borderRadius: 4,
    position: 'absolute', top: 3, right: 3,
  },
  roseIcon: {
    position: 'absolute', bottom: 1, right: 1,
    fontSize: 8,
  },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendSwatch: {
    width: 14, height: 14, borderRadius: 3,
    borderWidth: 1, borderColor: BORDER_CARD,
    marginRight: 4, justifyContent: 'center', alignItems: 'center',
  },
  legendBabyDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 11, color: TEXT_SUBTLE },
});
