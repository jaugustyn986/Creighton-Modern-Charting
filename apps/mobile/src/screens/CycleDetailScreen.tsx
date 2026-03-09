import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCycleHistory } from '../hooks/useCycleHistory';
import { MucusChart } from '../components/MucusChart';
import { FertileTimeline } from '../components/FertileTimeline';
import { DailyLogList } from '../components/DailyLogList';
import { buildCyclePdfHtml } from '../utils/exportCyclePdf';
import {
  BG_CARD, BG_PAGE,
  TEXT_PRIMARY, TEXT_MUTED, TEXT_SECONDARY,
  BORDER_CARD, ACCENT_WARM,
} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CycleDetail'>;

export function CycleDetailScreen({ route, navigation }: Props): JSX.Element {
  const { cycleNumber } = route.params;
  const { cycles, loading, refresh } = useCycleHistory();
  const [exporting, setExporting] = useState(false);
  const [showIntercoursePrompt, setShowIntercoursePrompt] = useState(false);
  const [pendingIncludeIntercourse, setPendingIncludeIntercourse] = useState<boolean | null>(null);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const cycle = useMemo(
    () => cycles.find((c) => c.cycleNumber === cycleNumber) ?? null,
    [cycles, cycleNumber],
  );

  const handleExport = useCallback(async (includeIntercourse: boolean) => {
    if (!cycle) return;
    setExporting(true);
    try {
      const html = buildCyclePdfHtml(cycle, includeIntercourse);
      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { mimeType: 'application/pdf' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'An error occurred while exporting.';
      Alert.alert('Export Failed', msg);
    } finally {
      setExporting(false);
    }
  }, [cycle]);

  const queueExport = useCallback((includeIntercourse: boolean) => {
    setPendingIncludeIntercourse(includeIntercourse);
    setShowIntercoursePrompt(false);
  }, []);

  const handlePromptDismiss = useCallback(() => {
    if (pendingIncludeIntercourse === null) {
      return;
    }
    const includeIntercourse = pendingIncludeIntercourse;
    setPendingIncludeIntercourse(null);
    void handleExport(includeIntercourse);
  }, [handleExport, pendingIncludeIntercourse]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!cycle) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cycle not found.</Text>
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Cycle {cycle.cycleNumber}</Text>
        <Pressable
          style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
          onPress={() => setShowIntercoursePrompt(true)}
          disabled={exporting}
        >
          <Text style={styles.exportBtnText}>{exporting ? 'Exporting...' : 'Export'}</Text>
        </Pressable>
      </View>

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

      <Modal visible={showIntercoursePrompt} transparent animationType="fade" onDismiss={handlePromptDismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Export Cycle PDF</Text>
            <Text style={styles.modalBody}>Include intercourse markers in the export?</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalBtnOutline}
                onPress={() => queueExport(false)}
              >
                <Text style={styles.modalBtnOutlineText}>No</Text>
              </Pressable>
              <Pressable
                style={styles.modalBtnFilled}
                onPress={() => queueExport(true)}
              >
                <Text style={styles.modalBtnFilledText}>Yes</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setShowIntercoursePrompt(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  loadingText: { textAlign: 'center', marginTop: 100, color: TEXT_MUTED, fontSize: 15 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: { paddingRight: 8 },
  backArrow: { fontSize: 28, color: TEXT_PRIMARY, fontWeight: '300', lineHeight: 32 },
  headerTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  exportBtn: {
    backgroundColor: ACCENT_WARM,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportBtnDisabled: { opacity: 0.5 },
  exportBtnText: { color: BG_CARD, fontWeight: '600', fontSize: 14 },
  scrollContent: { paddingBottom: 32 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  statValue: { fontSize: 22, fontWeight: '600', color: TEXT_PRIMARY },
  statLabel: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  modalBody: { fontSize: 15, fontWeight: '400', color: TEXT_SECONDARY, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  modalButtons: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  modalBtnOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER_CARD,
    alignItems: 'center',
  },
  modalBtnOutlineText: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  modalBtnFilled: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: ACCENT_WARM,
    alignItems: 'center',
  },
  modalBtnFilledText: { fontSize: 15, fontWeight: '600', color: BG_CARD },
  modalCancel: { fontSize: 14, color: TEXT_MUTED, marginTop: 8 },
});
