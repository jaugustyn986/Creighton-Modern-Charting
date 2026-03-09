import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CycleSlice } from '../../../../core/rulesEngine/src/multiCycle';
import {
  BG_BLEEDING, BG_CARD, BG_DRY, BG_MISSING, BG_PEAK_TYPE, BG_POST_PEAK,
  FERTILE_ACCENT, PEAK_BORDER,
  TEXT_PRIMARY, TEXT_MUTED, TEXT_SUBTLE,
  BORDER_CARD,
} from '../theme/colors';

interface Props {
  cycles: CycleSlice[];
  onCyclePress: (cycleNumber: number) => void;
}

function getCellColor(rank: number | null, phase: string, bleeding: boolean): string {
  if (bleeding) return BG_BLEEDING;
  if (phase === 'p_plus_1' || phase === 'p_plus_2' || phase === 'p_plus_3') return BG_POST_PEAK;
  if (rank !== null && rank >= 3) return BG_PEAK_TYPE;
  if (rank !== null && rank >= 0) return BG_DRY;
  return BG_MISSING;
}

function getCellDotColor(rank: number | null, phase: string, bleeding: boolean): string | null {
  if (bleeding) return null;
  if (phase === 'peak_confirmed') return null;
  if (
    (phase === 'fertile_open' || phase === 'fertile_unconfirmed_peak') &&
    rank !== null
  ) {
    if (rank >= 3) return null;
    if (rank >= 1) return FERTILE_ACCENT;
  }
  return null;
}

export function PeakAlignedOverlay({ cycles, onCyclePress }: Props): JSX.Element {
  const peakCycles = cycles
    .filter((c) => c.peakDay !== null && c.status === 'complete')
    .slice(-6);

  if (peakCycles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Peak-Aligned Overlay</Text>
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            Overlay will appear once cycles with confirmed peaks are recorded.
          </Text>
        </View>
      </View>
    );
  }

  const maxBefore = Math.max(...peakCycles.map((c) => c.peakDay! - 1));
  const maxAfter = Math.max(...peakCycles.map((c) => c.length - c.peakDay!));
  const colStart = -maxBefore;
  const colEnd = maxAfter;
  const columns: number[] = [];
  for (let i = colStart; i <= colEnd; i++) columns.push(i);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Peak-Aligned Overlay</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.rowLabel} />
            {columns.map((col) => (
              <View key={col} style={styles.headerCell}>
                <Text style={[styles.headerText, col === 0 && styles.peakHeaderText]}>
                  {col === 0 ? 'P' : col > 0 ? `+${col}` : String(col)}
                </Text>
              </View>
            ))}
          </View>

          {peakCycles.map((cycle) => {
            const peakIdx = cycle.peakDay! - 1;
            return (
              <Pressable
                key={cycle.cycleNumber}
                style={styles.dataRow}
                onPress={() => onCyclePress(cycle.cycleNumber)}
              >
                <View style={styles.rowLabel}>
                  <Text style={styles.rowLabelText}>C{cycle.cycleNumber}</Text>
                </View>
                {columns.map((col) => {
                  const entryIdx = peakIdx + col;
                  if (entryIdx < 0 || entryIdx >= cycle.entries.length) {
                    return <View key={col} style={[styles.cell, { backgroundColor: BG_MISSING }]} />;
                  }
                  const entry = cycle.entries[entryIdx];
                  const rank = cycle.result.mucusRanks[entryIdx];
                  const phase = cycle.result.phaseLabels[entryIdx];
                  const bleeding = entry.bleeding !== undefined && entry.bleeding !== 'none';
                  const bg = getCellColor(rank, phase, bleeding);
                  const dotColor = getCellDotColor(rank, phase, bleeding);

                  return (
                    <View key={col} style={[styles.cell, { backgroundColor: bg }, col === 0 && styles.peakCell]}>
                      {dotColor && <View style={[styles.cellDot, { backgroundColor: dotColor }]} />}
                    </View>
                  );
                })}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <LegendItem color={BG_BLEEDING} label="Bleeding" />
        <LegendItem color={BG_DRY} label="Dry" />
        <LegendItem color={BG_DRY} dotColor={FERTILE_ACCENT} label="Mucus" />
        <LegendItem color={BG_PEAK_TYPE} label="Peak" />
        <LegendItem color={BG_POST_PEAK} label="Post-peak" />
        <LegendItem color={BG_MISSING} label="No data" />
      </View>
    </View>
  );
}

function LegendItem({ color, dotColor, label }: { color: string; dotColor?: string; label: string }): JSX.Element {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]}>
        {dotColor && <View style={[styles.legendDot, { backgroundColor: dotColor }]} />}
      </View>
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 16 },
  heading: { fontSize: 21, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  card: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  emptyText: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center' },
  headerRow: { flexDirection: 'row', marginBottom: 4 },
  headerCell: { width: 28, alignItems: 'center' },
  headerText: { fontSize: 10, color: TEXT_MUTED },
  peakHeaderText: { color: PEAK_BORDER, fontWeight: '700' },
  dataRow: { flexDirection: 'row', marginBottom: 3 },
  rowLabel: { width: 32, justifyContent: 'center' },
  rowLabelText: { fontSize: 11, color: TEXT_SUBTLE, fontWeight: '500' },
  cell: {
    width: 26, height: 20, borderRadius: 4, marginHorizontal: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  peakCell: { borderWidth: 1.5, borderColor: PEAK_BORDER },
  cellDot: { width: 6, height: 6, borderRadius: 3 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendSwatch: {
    width: 14, height: 14, borderRadius: 3,
    borderWidth: 1, borderColor: BORDER_CARD,
    marginRight: 4, justifyContent: 'center', alignItems: 'center',
  },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 11, color: TEXT_SUBTLE },
});
