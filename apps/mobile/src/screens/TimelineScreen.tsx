import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCycleData } from '../hooks/useCycleData';
import { useCycleHistory } from '../hooks/useCycleHistory';
import { useCurrentCycleSummaryFromCycles } from '../hooks/useCurrentCycleSummary';
import { MucusChart } from '../components/MucusChart';
import { StatusBanner } from '../components/StatusBanner';

export function TimelineScreen(): JSX.Element {
  const { sortedEntries, result, loading, refresh } = useCycleData();
  const cycleHistory = useCycleHistory();
  const cycleSummary = useCurrentCycleSummaryFromCycles(cycleHistory.cycles);

  useFocusEffect(
    useCallback(() => {
      refresh();
      cycleHistory.refresh();
    }, [refresh, cycleHistory.refresh]),
  );

  if (loading || cycleHistory.loading) {
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
        <StatusBanner summary={cycleSummary} />
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
