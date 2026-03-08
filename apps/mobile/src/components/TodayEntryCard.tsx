import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DailyEntry } from '../../../../core/rulesEngine/src/types';

interface Props {
  entry: DailyEntry | null;
  mucusRank: number | null;
  date: string;
  onPress: () => void;
}

function getMucusLabel(rank: number | null): string {
  switch (rank) {
    case 0: return 'Type 0 Mucus';
    case 1: return 'Type 1 Mucus';
    case 2: return 'Type 2 Mucus';
    case 3: return 'Type 3 Mucus';
    default: return 'No entry';
  }
}

function getFertilityHint(rank: number | null): string {
  switch (rank) {
    case 0: return 'Non-fertile day.';
    case 1: return 'Early fertile signs.';
    case 2: return 'Fertile day.';
    case 3: return 'Peak fertility!';
    default: return '';
  }
}

export function TodayEntryCard({ entry, mucusRank, date, onPress }: Props): JSX.Element {
  const monthDay = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Entry</Text>
        <Text style={styles.date}>{monthDay}</Text>
      </View>
      {entry ? (
        <View style={styles.body}>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{getMucusLabel(mucusRank)}</Text>
            </View>
            {entry.intercourse && (
              <View style={[styles.tag, styles.intercourseTag]}>
                <Text style={styles.tagText}>Intercourse</Text>
              </View>
            )}
          </View>
          <Text style={styles.hint}>{getFertilityHint(mucusRank)}</Text>
        </View>
      ) : (
        <Text style={styles.noEntry}>No entry yet. Tap to add.</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  date: { fontSize: 13, color: '#94a3b8' },
  body: { marginTop: 8 },
  tags: { flexDirection: 'row', gap: 8 },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intercourseTag: { backgroundColor: '#d1fae5' },
  tagText: { fontSize: 12, color: '#334155' },
  hint: { fontSize: 13, color: '#64748b', marginTop: 6 },
  noEntry: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
});
