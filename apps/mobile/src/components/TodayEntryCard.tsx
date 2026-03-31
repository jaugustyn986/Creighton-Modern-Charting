import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { mucusChartStrengthLabel, DailyEntry, PrimaryDayClass } from 'core-rules-engine';
import {
  BG_CARD, BG_MISSING,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, TEXT_SUBTLE,
  BORDER_CARD, ACCENT_WARM, ACCENT_WARM_TINT,
} from '../theme/colors';

interface Props {
  entry: DailyEntry | null;
  mucusRank: number | null;
  /** From engine `primaryDayClassByDay`; when null, label falls back to rank only. */
  primaryDayClass?: PrimaryDayClass | null;
  date: string;
  onPress: () => void;
}

function getMucusLabel(rank: number | null, primary: PrimaryDayClass | null | undefined): string {
  if (primary === 'menstrual_flow') return 'Menstrual flow';
  if (primary === 'spotting') return 'Spotting';
  return mucusChartStrengthLabel(rank, 'No observation');
}

function getFertilityHint(
  rank: number | null,
  primary: PrimaryDayClass | null | undefined,
): string {
  if (primary === 'menstrual_flow') {
    return 'Logged as menstrual flow; mucus is not read as Peak-type for this day.';
  }
  if (primary === 'spotting') {
    return 'Spotting noted; mucus signs show when present.';
  }
  switch (rank) {
    case 0: return 'Non-fertile day.';
    case 1: return 'Early fertile signs.';
    case 2: return 'Fertile day.';
    case 3: return 'Peak fertility!';
    default: return '';
  }
}

export function TodayEntryCard({ entry, mucusRank, primaryDayClass, date, onPress }: Props): JSX.Element {
  const monthDay = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Observation</Text>
        <Text style={styles.date}>{monthDay}</Text>
      </View>
      {entry ? (
        <View style={styles.body}>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{getMucusLabel(mucusRank, primaryDayClass)}</Text>
            </View>
            {entry.intercourse && (
              <View style={[styles.tag, styles.intercourseTag]}>
                <Text style={styles.tagText}>Intercourse</Text>
              </View>
            )}
          </View>
          <Text style={styles.hint}>{getFertilityHint(mucusRank, primaryDayClass)}</Text>
          <View style={styles.tapRow}>
            <Text style={styles.tapHint}>Tap to edit your observation</Text>
            <Text style={styles.tapArrow}>{'›'}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyBody}>
          <Text style={styles.emptyText}>Tap to record today's observation</Text>
          <Text style={styles.tapArrow}>{'›'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  date: { fontSize: 14, color: TEXT_MUTED },
  body: { marginTop: 8 },
  tags: { flexDirection: 'row', gap: 8 },
  tag: {
    backgroundColor: BG_MISSING,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  intercourseTag: { backgroundColor: ACCENT_WARM_TINT },
  tagText: { fontSize: 12, color: TEXT_SECONDARY },
  hint: { fontSize: 14, fontWeight: '400', color: TEXT_SUBTLE, marginTop: 8 },
  tapRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: BORDER_CARD,
  },
  tapHint: { fontSize: 15, fontWeight: '500', color: ACCENT_WARM },
  tapArrow: { fontSize: 20, color: ACCENT_WARM },
  emptyBody: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: BORDER_CARD,
  },
  emptyText: { fontSize: 15, fontWeight: '500', color: ACCENT_WARM },
});
