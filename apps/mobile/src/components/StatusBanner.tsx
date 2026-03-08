import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PhaseLabel } from '../../../../core/rulesEngine/src/types';

interface Props {
  cycleDay: number | null;
  phaseLabel: PhaseLabel | null;
}

function getStatusInfo(label: PhaseLabel | null): { title: string; message: string; bg: string } {
  switch (label) {
    case 'fertile_open':
      return { title: 'Fertile', message: 'Mucus is present and fertility is elevated.', bg: '#fef3c7' };
    case 'peak_confirmed':
      return { title: 'Peak', message: 'Peak Day detected! Ovulation likely occurred within the last 1–2 days.', bg: '#fce7f3' };
    case 'p_plus_1':
      return { title: 'Peak', message: 'P+1 of 3. Continue observing.', bg: '#fce7f3' };
    case 'p_plus_2':
      return { title: 'Peak', message: 'P+2 of 3. One more day.', bg: '#fce7f3' };
    case 'p_plus_3':
      return { title: 'Peak', message: 'P+3 confirmed! Fertile window closed.', bg: '#d1fae5' };
    case 'post_peak':
      return { title: 'Tracking', message: 'Post-peak phase. Continue daily observations.', bg: '#ede9fe' };
    case 'fertile_unconfirmed_peak':
      return { title: 'Fertile', message: 'Fertile signs present. Peak not yet confirmed.', bg: '#fef3c7' };
    default:
      return { title: 'Tracking', message: 'Early cycle. Continue daily observations.', bg: '#f1f5f9' };
  }
}

export function StatusBanner({ cycleDay, phaseLabel }: Props): JSX.Element {
  const info = getStatusInfo(phaseLabel);
  return (
    <View style={[styles.container, { backgroundColor: info.bg }]}>
      {cycleDay !== null && <Text style={styles.cycleDay}>Cycle Day {cycleDay}</Text>}
      <Text style={styles.title}>{info.title}</Text>
      <Text style={styles.message}>{info.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  cycleDay: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#1e293b' },
  message: { fontSize: 13, color: '#475569', marginTop: 4 },
});
