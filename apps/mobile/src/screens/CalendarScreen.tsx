import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCycleData } from '../hooks/useCycleData';
import { useCycleHistory } from '../hooks/useCycleHistory';
import { StatusBanner } from '../components/StatusBanner';
import { CalendarGrid } from '../components/CalendarGrid';
import { TodayEntryCard } from '../components/TodayEntryCard';
import { PhaseLabel } from '../../../../core/rulesEngine/src/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CalendarScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { entries, sortedEntries, result, loading, refresh } = useCycleData();
  const cycleHistory = useCycleHistory();

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

  const { todayRank, todayLabel, cycleDay } = useMemo(() => {
    if (currentCycleSlice) {
      const idx = currentCycleSlice.entries.findIndex((e) => e.date === today);
      if (idx >= 0) {
        return {
          todayRank: currentCycleSlice.result.mucusRanks[idx],
          todayLabel: currentCycleSlice.result.phaseLabels[idx] as PhaseLabel | null,
          cycleDay: idx + 1,
        };
      }
    }
    const idx = sortedEntries.findIndex((e) => e.date === today);
    return {
      todayRank: idx >= 0 ? result.mucusRanks[idx] : null,
      todayLabel: idx >= 0 ? (result.phaseLabels[idx] as PhaseLabel | null) : null,
      cycleDay: idx >= 0 ? idx + 1 : null,
    };
  }, [currentCycleSlice, sortedEntries, result, today]);

  const dayInfos = useMemo(() => {
    const dateMap = new Map<string, { phaseLabel: PhaseLabel; mucusRank: number | null }>();

    for (const slice of cycleHistory.cycles) {
      for (let i = 0; i < slice.entries.length; i++) {
        const date = slice.entries[i].date ?? '';
        dateMap.set(date, {
          phaseLabel: slice.result.phaseLabels[i],
          mucusRank: slice.result.mucusRanks[i],
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
        bleeding: entry.bleeding !== undefined && entry.bleeding !== 'none',
        mucusRank: cycleInfo?.mucusRank ?? null,
        intercourse: !!entry.intercourse,
      };
    });
  }, [cycleHistory.cycles, sortedEntries, result, today]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.appName}>Holistic Cycle</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('DailyEntry', { date: today })}
        >
          <Text style={styles.addBtnText}>+ Entry</Text>
        </Pressable>
      </View>

      <ScrollView>
        <StatusBanner cycleDay={cycleDay} phaseLabel={todayLabel} />

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
          date={today}
          onPress={() => navigation.navigate('DailyEntry', { date: today, existingEntry: !!todayEntry })}
        />

        <Pressable
          style={styles.historyLink}
          onPress={() => navigation.navigate('CycleHistory')}
        >
          <Text style={styles.historyText}>Cycle History</Text>
          <Text style={styles.historySub}>View past cycles, patterns, and insights</Text>
        </Pressable>

        <Pressable
          style={styles.helpLink}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.helpText}>Need help understanding your chart?</Text>
          <Text style={styles.helpSub}>Learn about mucus types, peak day, and more</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loading: { textAlign: 'center', marginTop: 100, color: '#94a3b8', fontSize: 16 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  appName: { fontSize: 20, fontWeight: '700', color: '#be123c' },
  addBtn: {
    backgroundColor: '#f43f5e', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  historyLink: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginTop: 12,
  },
  historyText: { fontSize: 14, fontWeight: '600', color: '#0369a1' },
  historySub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  helpLink: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginTop: 12, marginBottom: 24,
  },
  helpText: { fontSize: 14, fontWeight: '600', color: '#be123c' },
  helpSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
});
