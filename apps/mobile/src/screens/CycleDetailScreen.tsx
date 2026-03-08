import React, { useCallback, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCycleHistory } from '../hooks/useCycleHistory';
import { MucusChart } from '../components/MucusChart';
import { FertileTimeline } from '../components/FertileTimeline';
import { DailyLogList } from '../components/DailyLogList';
import {
  BG_CARD, BG_PAGE,
  TEXT_PRIMARY, TEXT_MUTED,
  BORDER_CARD,
} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CycleDetail'>;

export function CycleDetailScreen({ route }: Props): JSX.Element {
  const { cycleNumber } = route.params;
  const { cycles, loading, refresh } = useCycleHistory();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const cycle = useMemo(
    () => cycles.find((c) => c.cycleNumber === cycleNumber) ?? null,
    [cycles, cycleNumber],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!cycle) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Cycle not found.</Text>
      </SafeAreaView>
    );
  }

  const fertileEndLabel =
    cycle.result.fertileEndIndex !== null
      ? `Day ${cycle.result.fertileEndIndex + 1}`
      : '--';

  const intercourseFlags = cycle.entries.map((e) => !!e.intercourse);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatBox label="Length" value={`${cycle.length}d`} />
          <StatBox label="Peak Day" value={cycle.peakDay !== null ? `Day ${cycle.peakDay}` : '--'} />
          <StatBox label="Fertile End" value={fertileEndLabel} />
        </View>

        <MucusChart
          mucusRanks={cycle.result.mucusRanks}
          phaseLabels={cycle.result.phaseLabels}
          peakIndex={cycle.result.peakIndex}
          intercourseFlags={intercourseFlags}
          title={`Cycle ${cycle.cycleNumber} Pattern`}
        />

        <FertileTimeline cycle={cycle} />
        <DailyLogList cycle={cycle} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_PAGE },
  loading: { textAlign: 'center', marginTop: 100, color: TEXT_MUTED, fontSize: 16 },
  scrollContent: { paddingBottom: 32 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: TEXT_PRIMARY },
  statLabel: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
});
