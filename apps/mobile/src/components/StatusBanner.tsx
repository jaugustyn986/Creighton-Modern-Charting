import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CompactSupportField, CurrentCycleSummary, SummaryTone } from 'core-rules-engine';
import {
  BG_CARD_GRADIENT_START,
  BANNER_TONE_CAUTION_BG,
  BANNER_TONE_POSITIVE_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_SUBTLE,
  TEXT_MUTED,
} from '../theme/colors';

interface Props {
  summary: CurrentCycleSummary;
}

function backgroundForTone(tone: SummaryTone): string {
  switch (tone) {
    case 'caution':
      return BANNER_TONE_CAUTION_BG;
    case 'positive':
      return BANNER_TONE_POSITIVE_BG;
    default:
      return BG_CARD_GRADIENT_START;
  }
}

function resolveSupportLine(
  field: CompactSupportField,
  summary: CurrentCycleSummary,
): string | null {
  switch (field) {
    case 'guidance':
      return summary.guidance;
    case 'baselineContext':
      return summary.baselineContext;
    case 'completeness':
      return summary.completeness;
    case 'interpretationNote':
      return summary.interpretationNotes[0] ?? null;
    default:
      return summary.guidance;
  }
}

export function StatusBanner({ summary }: Props): JSX.Element {
  const bg = backgroundForTone(summary.summaryTone);
  const { cycleDay } = summary;
  const supportLine = resolveSupportLine(summary.compactSupportField, summary);
  const showCompleteness =
    summary.compactSupportField !== 'completeness' &&
    summary.completeness.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {summary.focusQualification ? (
        <Text style={styles.focusQualification}>{summary.focusQualification}</Text>
      ) : null}
      <Text style={styles.headline}>{summary.headline}</Text>
      <Text style={styles.confidence}>{summary.confidence}</Text>
      {cycleDay !== null ? (
        <Text style={styles.cycleDay}>Cycle Day {cycleDay}</Text>
      ) : null}
      {showCompleteness ? (
        <Text style={styles.completeness}>{summary.completeness}</Text>
      ) : null}
      {supportLine ? (
        <Text style={styles.supportLine}>{supportLine}</Text>
      ) : null}
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
  focusQualification: {
    fontSize: 12,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: 6,
    lineHeight: 16,
  },
  headline: {
    fontSize: 21,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  confidence: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginTop: 10,
    lineHeight: 22,
  },
  cycleDay: {
    fontSize: 13,
    fontWeight: '400',
    color: TEXT_SUBTLE,
    marginTop: 6,
    lineHeight: 18,
  },
  completeness: {
    fontSize: 13,
    fontWeight: '400',
    color: TEXT_SUBTLE,
    marginTop: 2,
    lineHeight: 18,
  },
  supportLine: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    marginTop: 10,
    lineHeight: 22,
  },
});
