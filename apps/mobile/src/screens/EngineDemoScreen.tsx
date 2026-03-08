import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import fixture from '../../../../core/rulesEngine/fixtures/simple-peak.json';
import { recalculateCycle } from '../../../../core/rulesEngine/src';

export function EngineDemoScreen(): JSX.Element {
  const result = recalculateCycle(fixture.entries);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Engine Demo</Text>
      <ScrollView>
        {result.phaseLabels.map((phase, index) => (
          <View key={index} style={[styles.row, index === result.peakIndex ? styles.peakRow : undefined]}>
            <Text style={styles.text}>Day {index}</Text>
            <Text style={styles.text}>Rank {result.mucusRanks[index] ?? 'missing'}</Text>
            <Text style={styles.text}>{phase}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  row: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  peakRow: { backgroundColor: '#fce7f3' },
  text: { fontSize: 14 },
});
