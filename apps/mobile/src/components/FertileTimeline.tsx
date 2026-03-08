import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CycleSlice } from '../../../../core/rulesEngine/src/multiCycle';
import {
  BG_CARD, BG_DRY, BG_POST_PEAK,
  PEAK_ACCENT, FERTILE_ACCENT,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
  BORDER_CARD,
} from '../theme/colors';

interface Props {
  cycle: CycleSlice;
}

interface Milestone {
  label: string;
  dayLabel: string;
  color: string;
}

export function FertileTimeline({ cycle }: Props): JSX.Element {
  const { result, peakDay, length } = cycle;

  const fertileStartDay =
    result.fertileStartIndex !== null ? result.fertileStartIndex + 1 : null;
  const fertileEndDay =
    result.fertileEndIndex !== null ? result.fertileEndIndex + 1 : null;

  const milestones: Milestone[] = [];

  if (fertileStartDay !== null) {
    milestones.push({
      label: 'Fertile Start',
      dayLabel: `Day ${fertileStartDay}`,
      color: FERTILE_ACCENT,
    });
  }

  if (peakDay !== null) {
    milestones.push({
      label: 'Peak Day',
      dayLabel: `Day ${peakDay}`,
      color: PEAK_ACCENT,
    });
  }

  if (fertileEndDay !== null) {
    milestones.push({
      label: 'Fertile End (P+3)',
      dayLabel: `Day ${fertileEndDay}`,
      color: BG_POST_PEAK,
    });
  }

  const totalFertileDays =
    fertileStartDay !== null && fertileEndDay !== null
      ? fertileEndDay - fertileStartDay + 1
      : null;

  if (milestones.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Fertile Window</Text>
        <View style={styles.card}>
          <Text style={styles.emptyText}>No confirmed fertile window in this cycle.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Fertile Window</Text>
      <View style={styles.card}>
        {milestones.map((m, idx) => (
          <View key={idx} style={styles.milestoneRow}>
            <View style={[styles.dot, { backgroundColor: m.color }]} />
            {idx < milestones.length - 1 && <View style={styles.line} />}
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneLabel}>{m.label}</Text>
              <Text style={styles.milestoneDay}>{m.dayLabel}</Text>
            </View>
          </View>
        ))}
        {totalFertileDays !== null && (
          <Text style={styles.totalText}>
            Total fertile days: {totalFertileDays}
          </Text>
        )}
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
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  emptyText: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center' },
  milestoneRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, position: 'relative' },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 12, marginTop: 2 },
  line: {
    position: 'absolute', left: 6, top: 16,
    width: 2, height: 24,
    backgroundColor: BORDER_CARD,
  },
  milestoneContent: { flex: 1 },
  milestoneLabel: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
  milestoneDay: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 1 },
  totalText: { fontSize: 13, color: TEXT_MUTED, marginTop: 4, textAlign: 'center', fontWeight: '500' },
});
