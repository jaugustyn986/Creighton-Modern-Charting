import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { useCycleData } from '../hooks/useCycleData';
import { MucusChart } from '../components/MucusChart';
import { StatusBanner } from '../components/StatusBanner';
import { PhaseLabel } from '../../../../core/rulesEngine/src/types';

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TimelineScreen(): JSX.Element {
  const { sortedEntries, result, loading } = useCycleData();
  const today = todayString();
  const todayIdx = sortedEntries.findIndex((e) => e.date === today);
  const todayLabel: PhaseLabel | null = todayIdx >= 0 ? result.phaseLabels[todayIdx] : null;
  const cycleDay = todayIdx >= 0 ? todayIdx + 1 : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (sortedEntries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>No entries yet. Start charting to see your timeline.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <StatusBanner cycleDay={cycleDay} phaseLabel={todayLabel} />
        <MucusChart
          mucusRanks={result.mucusRanks}
          phaseLabels={result.phaseLabels}
          peakIndex={result.peakIndex}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loading: { textAlign: 'center', marginTop: 100, color: '#94a3b8', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 100, color: '#94a3b8', fontSize: 14, paddingHorizontal: 32 },
});
