import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CycleSummary } from '../../../../core/rulesEngine/src/multiCycle';
import { BG_CARD, TEXT_PRIMARY, TEXT_MUTED, BORDER_CARD } from '../theme/colors';

interface Props {
  summary: CycleSummary;
}

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function CycleSummaryPanel({ summary }: Props): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cycle Summary</Text>
      <View style={styles.grid}>
        <StatCard label="Cycles Tracked" value={String(summary.cyclesTracked)} />
        <StatCard label="Avg Cycle (days)" value={summary.avgLength !== null ? String(summary.avgLength) : '--'} />
        <StatCard label="Avg Peak Day" value={summary.avgPeakDay !== null ? `Day ${summary.avgPeakDay}` : '--'} />
        <StatCard label="Avg Luteal Phase" value={summary.avgLutealPhase !== null ? `${summary.avgLutealPhase} days` : '--'} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 12 },
  heading: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 14,
    width: '48%' as unknown as number,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  value: { fontSize: 24, fontWeight: '700', color: TEXT_PRIMARY },
  label: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
});
