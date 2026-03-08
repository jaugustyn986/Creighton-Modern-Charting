import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CycleSlice } from '../../../../core/rulesEngine/src/multiCycle';
import {
  BG_CARD, BG_DRY, BG_POST_PEAK, BG_MISSING,
  PEAK_ACCENT, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
  BORDER_CARD,
} from '../theme/colors';

interface Props {
  cycle: CycleSlice;
  onPress: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusStyle(status: CycleSlice['status']): { bg: string; text: string; label: string } {
  switch (status) {
    case 'complete':
      return { bg: BG_DRY, text: '#15803d', label: 'Complete' };
    case 'in_progress':
      return { bg: BG_POST_PEAK, text: '#92400e', label: 'In Progress' };
    case 'no_peak':
      return { bg: BG_MISSING, text: TEXT_MUTED, label: 'No Peak' };
  }
}

export function CycleCard({ cycle, onPress }: Props): JSX.Element {
  const statusInfo = getStatusStyle(cycle.status);
  const startFormatted = formatDate(cycle.startDate);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.cycleTitle}>Cycle {cycle.cycleNumber}</Text>
        <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.badgeText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
        </View>
      </View>
      <Text style={styles.dateText}>{startFormatted}</Text>
      <View style={styles.statsRow}>
        <StatPill label="Length" value={`${cycle.length}d`} />
        <StatPill label="Peak" value={cycle.peakDay !== null ? `Day ${cycle.peakDay}` : '--'} />
        <StatPill label="Luteal" value={cycle.lutealPhase !== null ? `${cycle.lutealPhase}d` : '--'} />
      </View>
    </Pressable>
  );
}

function StatPill({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cycleTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  dateText: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  statPill: {
    backgroundColor: BG_MISSING,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
  statLabel: { fontSize: 10, color: TEXT_MUTED, marginTop: 1 },
});
