import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCycleHistory } from '../hooks/useCycleHistory';
import { CycleSummaryPanel } from '../components/CycleSummaryPanel';
import { PatternInsights } from '../components/PatternInsights';
import { PeakAlignedOverlay } from '../components/PeakAlignedOverlay';
import { CycleCard } from '../components/CycleCard';
import { BG_PAGE, TEXT_MUTED, TEXT_PRIMARY } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CycleHistory'>;

export function CycleHistoryScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { cycles, summary, insights, loading, refresh } = useCycleHistory();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const goToDetail = useCallback(
    (cycleNumber: number) => navigation.navigate('CycleDetail', { cycleNumber }),
    [navigation],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (cycles.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Cycle History</Text>
          <Text style={styles.emptyText}>
            Cycle insights will appear once multiple cycles are recorded.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const reversedCycles = [...cycles].reverse();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CycleSummaryPanel summary={summary} />
        <PatternInsights insights={insights} />
        <PeakAlignedOverlay cycles={cycles} onCyclePress={goToDetail} />

        <View style={styles.cardsSection}>
          <Text style={styles.cardsHeading}>Your Cycles</Text>
          {reversedCycles.map((c) => (
            <CycleCard
              key={c.cycleNumber}
              cycle={c}
              onPress={() => goToDetail(c.cycleNumber)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_PAGE },
  loading: { textAlign: 'center', marginTop: 100, color: TEXT_MUTED, fontSize: 16 },
  scrollContent: { paddingBottom: 32 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 8 },
  emptyText: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center', lineHeight: 20 },
  cardsSection: { marginHorizontal: 16, marginTop: 16 },
  cardsHeading: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
});
