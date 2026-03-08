import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CycleSlice } from '../../../../core/rulesEngine/src/multiCycle';
import { PhaseLabel } from '../../../../core/rulesEngine/src/types';
import {
  BG_BLEEDING, BG_CARD, BG_DRY, BG_MISSING, BG_PEAK_TYPE, BG_POST_PEAK,
  PEAK_ACCENT, FERTILE_ACCENT,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
  BORDER_CARD, INTERCOURSE_ICON,
} from '../theme/colors';

interface Props {
  cycle: CycleSlice;
}

function getDayCircleColor(phase: PhaseLabel, rank: number | null, bleeding: boolean): string {
  if (bleeding) return BG_BLEEDING;
  if (phase === 'p_plus_1' || phase === 'p_plus_2' || phase === 'p_plus_3') return BG_POST_PEAK;
  if (phase === 'peak_confirmed') return BG_PEAK_TYPE;
  if ((phase === 'fertile_open' || phase === 'fertile_unconfirmed_peak') && rank !== null && rank >= 3) return BG_PEAK_TYPE;
  if (rank !== null && rank >= 1) return BG_DRY;
  return BG_DRY;
}

function getPhaseShortLabel(phase: PhaseLabel): string {
  switch (phase) {
    case 'dry': return 'Dry';
    case 'fertile_open': return 'Fertile';
    case 'fertile_unconfirmed_peak': return 'Fertile';
    case 'peak_confirmed': return 'Peak';
    case 'p_plus_1': return 'P+1';
    case 'p_plus_2': return 'P+2';
    case 'p_plus_3': return 'P+3';
    case 'post_peak': return 'Post-peak';
    case 'missing': return 'Missing';
    default: return '';
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getRankLabel(rank: number | null): string {
  switch (rank) {
    case 0: return 'Dry';
    case 1: return 'Damp';
    case 2: return 'Wet';
    case 3: return 'Peak-type';
    default: return '--';
  }
}

export function DailyLogList({ cycle }: Props): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Daily Log</Text>
      <View style={styles.card}>
        {cycle.entries.map((entry, idx) => {
          const phase = cycle.result.phaseLabels[idx];
          const rank = cycle.result.mucusRanks[idx];
          const bleeding = entry.bleeding !== undefined && entry.bleeding !== 'none';
          const isPeak = phase === 'peak_confirmed';
          const circleColor = getDayCircleColor(phase, rank, bleeding);
          const dotColor =
            phase === 'peak_confirmed' ? PEAK_ACCENT
            : (phase === 'fertile_open' || phase === 'fertile_unconfirmed_peak') && rank !== null && rank >= 3 ? PEAK_ACCENT
            : (phase === 'fertile_open' || phase === 'fertile_unconfirmed_peak') && rank !== null && rank >= 1 ? FERTILE_ACCENT
            : null;

          return (
            <View key={idx} style={[styles.row, isPeak && styles.peakRow]}>
              <View style={[styles.dayCircle, { backgroundColor: circleColor }]}>
                {dotColor && <View style={[styles.dayDot, { backgroundColor: dotColor }]} />}
                <Text style={styles.dayNum}>{idx + 1}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.dateText}>{entry.date ? formatDate(entry.date) : '--'}</Text>
                <Text style={styles.rankText}>
                  {bleeding ? `Bleeding (${entry.bleeding})` : getRankLabel(rank)}
                </Text>
              </View>
              <View style={styles.rowRight}>
                {entry.intercourse && (
                  <Text style={styles.roseIcon}>{INTERCOURSE_ICON}</Text>
                )}
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>{getPhaseShortLabel(phase)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 16 },
  heading: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  card: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_CARD,
  },
  peakRow: {
    borderWidth: 1.5,
    borderColor: PEAK_ACCENT,
    borderRadius: 8,
    marginHorizontal: -4,
    paddingHorizontal: 4,
    borderBottomWidth: 1.5,
  },
  dayCircle: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  dayDot: {
    width: 6, height: 6, borderRadius: 3,
    position: 'absolute', top: 2, right: 2,
  },
  dayNum: { fontSize: 12, fontWeight: '600', color: TEXT_PRIMARY },
  rowContent: { flex: 1 },
  dateText: { fontSize: 13, color: TEXT_PRIMARY },
  rankText: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roseIcon: { fontSize: 12 },
  phaseBadge: {
    backgroundColor: BG_MISSING,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  phaseBadgeText: { fontSize: 10, fontWeight: '500', color: TEXT_MUTED },
});
