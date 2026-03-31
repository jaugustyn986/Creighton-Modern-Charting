import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCycleData } from '../hooks/useCycleData';
import { useCycleHistory } from '../hooks/useCycleHistory';
import { useCurrentCycleSummaryFromCycles } from '../hooks/useCurrentCycleSummary';
import { StatusBanner } from '../components/StatusBanner';
import { CalendarGrid } from '../components/CalendarGrid';
import { TodayEntryCard } from '../components/TodayEntryCard';
import { SegmentedToggle, TabKey } from '../components/SegmentedToggle';
import { CycleSummaryPanel } from '../components/CycleSummaryPanel';
import { PatternInsights } from '../components/PatternInsights';
import { PeakAlignedOverlay } from '../components/PeakAlignedOverlay';
import { CycleCard } from '../components/CycleCard';
import { PhaseLabel, PrimaryDayClass } from 'core-rules-engine';
import { LineIcon } from '../components/LineIcon';
import {
  BG_PAGE, BG_CARD, BORDER_CARD,
  TEXT_PRIMARY, TEXT_MUTED, TEXT_SUBTLE, TEXT_SECONDARY,
  BRAND_NAME,
} from '../theme/colors';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoSource = require('../../assets/icon-1024.png');

type Nav = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CalendarScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { entries, sortedEntries, result, loading, refresh } = useCycleData();
  const cycleHistory = useCycleHistory();
  const [activeTab, setActiveTab] = useState<TabKey>('calendar');

  useFocusEffect(useCallback(() => {
    refresh();
    cycleHistory.refresh();
  }, [refresh, cycleHistory.refresh]));
  const today = todayString();

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const handlePrev = useCallback(() => {
    setViewMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  }, []);

  const handleNext = useCallback(() => {
    setViewMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  }, []);

  const todayEntry = entries[today] ?? null;

  const currentCycleSlice = cycleHistory.cycles.length > 0
    ? cycleHistory.cycles[cycleHistory.cycles.length - 1]
    : null;

  const cycleSummary = useCurrentCycleSummaryFromCycles(cycleHistory.cycles);

  const todayRank = useMemo(() => {
    if (currentCycleSlice) {
      const idx = currentCycleSlice.entries.findIndex((e) => e.date === today);
      if (idx >= 0) {
        return currentCycleSlice.result.mucusRanks[idx];
      }
    }
    const idx = sortedEntries.findIndex((e) => e.date === today);
    return idx >= 0 ? result.mucusRanks[idx] : null;
  }, [currentCycleSlice, sortedEntries, result, today]);

  const todayPrimaryClass = useMemo((): PrimaryDayClass | null => {
    if (currentCycleSlice) {
      const idx = currentCycleSlice.entries.findIndex((e) => e.date === today);
      if (idx >= 0) {
        return currentCycleSlice.result.primaryDayClassByDay[idx] ?? 'dry';
      }
    }
    const idx = sortedEntries.findIndex((e) => e.date === today);
    return idx >= 0 ? result.primaryDayClassByDay[idx] ?? 'dry' : null;
  }, [currentCycleSlice, sortedEntries, result, today]);

  const dayInfos = useMemo(() => {
    const dateMap = new Map<
      string,
      { phaseLabel: PhaseLabel; mucusRank: number | null; primaryDayClass: PrimaryDayClass }
    >();

    for (const slice of cycleHistory.cycles) {
      for (let i = 0; i < slice.entries.length; i++) {
        const date = slice.entries[i].date ?? '';
        dateMap.set(date, {
          phaseLabel: slice.result.phaseLabels[i],
          mucusRank: slice.result.mucusRanks[i],
          primaryDayClass: slice.result.primaryDayClassByDay[i],
        });
      }
    }

    return sortedEntries.map((entry, idx) => {
      const date = entry.date ?? '';
      const cycleInfo = dateMap.get(date);
      return {
        date,
        hasEntry: true,
        phaseLabel: cycleInfo?.phaseLabel ?? result.phaseLabels[idx],
        isToday: date === today,
        primaryDayClass: cycleInfo?.primaryDayClass ?? result.primaryDayClassByDay[idx],
        mucusRank: cycleInfo?.mucusRank ?? null,
        intercourse: !!entry.intercourse,
      };
    });
  }, [cycleHistory.cycles, sortedEntries, result, today]);

  const goToDetail = useCallback(
    (cycleNumber: number) => navigation.navigate('CycleDetail', { cycleNumber }),
    [navigation],
  );

  if (loading || cycleHistory.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const reversedCycles = [...cycleHistory.cycles].reverse();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View style={styles.logoContainer}>
            <Image source={logoSource} style={styles.topBarLogo} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>Well Within</Text>
        </View>
        <Pressable
          style={styles.gearBtn}
          onPress={() => navigation.navigate('Settings')}
          hitSlop={8}
        >
          <LineIcon name="gear" size={20} />
        </Pressable>
      </View>

      <SegmentedToggle activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView>
        {activeTab === 'calendar' ? (
          <>
            <StatusBanner summary={cycleSummary} />

            <CalendarGrid
              year={viewMonth.year}
              month={viewMonth.month}
              days={dayInfos}
              onDayPress={(date) =>
                navigation.navigate('DailyEntry', { date, existingEntry: !!entries[date] })
              }
              onPrevMonth={handlePrev}
              onNextMonth={handleNext}
            />

            <TodayEntryCard
              entry={todayEntry}
              mucusRank={todayRank}
              primaryDayClass={todayPrimaryClass}
              date={today}
              onPress={() => navigation.navigate('DailyEntry', { date: today, existingEntry: !!todayEntry })}
            />

            <Pressable
              style={styles.helpLink}
              onPress={() => navigation.navigate('Help')}
            >
              <Text style={styles.helpText}>Need help understanding your chart?</Text>
              <Text style={styles.helpSub}>Learn about sensation, appearance, peak day, and more</Text>
            </Pressable>
          </>
        ) : (
          <>
            {cycleHistory.cycles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={{ marginBottom: 16 }}>
                  <LineIcon name="chart" size={48} />
                </View>
                <Text style={styles.emptyTitle}>Cycle History</Text>
                <Text style={styles.emptyText}>
                  Your cycles will show here once you begin charting.
                </Text>
              </View>
            ) : (
              <View style={styles.historyContent}>
                <CycleSummaryPanel summary={cycleHistory.summary} />
                <PatternInsights insights={cycleHistory.insights} />
                <PeakAlignedOverlay cycles={cycleHistory.cycles} onCyclePress={goToDetail} />

                <View style={styles.cardsSection}>
                  <Text style={styles.cardsHeading}>Your Cycles</Text>
                  {reversedCycles.map((c) => (
                    <CycleCard
                      key={c.cycleNumber}
                      cycle={c}
                      allCycles={cycleHistory.cycles}
                      onPress={() => goToDetail(c.cycleNumber)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_PAGE },
  loading: { textAlign: 'center', marginTop: 100, color: TEXT_MUTED, fontSize: 15 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: { backgroundColor: BG_PAGE, borderRadius: 8, padding: 4, marginRight: 8 },
  topBarLogo: { width: 32, height: 32, backgroundColor: 'transparent' },
  appName: { fontSize: 28, fontWeight: '600', color: BRAND_NAME, letterSpacing: -0.2 },
  gearBtn: { padding: 8 },
  helpLink: {
    backgroundColor: BG_CARD, borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginTop: 16, marginBottom: 32,
    borderWidth: 1, borderColor: BORDER_CARD,
  },
  helpText: { fontSize: 15, fontWeight: '500', color: TEXT_SECONDARY },
  helpSub: { fontSize: 14, color: TEXT_MUTED, marginTop: 4, lineHeight: 22 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 40 },
  emptyTitle: { fontSize: 21, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  emptyText: { fontSize: 15, color: TEXT_MUTED, textAlign: 'center', lineHeight: 22 },
  historyContent: { paddingBottom: 32 },
  cardsSection: { marginHorizontal: 16, marginTop: 24 },
  cardsHeading: { fontSize: 21, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
});
