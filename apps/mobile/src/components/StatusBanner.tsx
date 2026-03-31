import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CurrentCycleSummary, SummaryTone } from 'core-rules-engine';
import {
  BG_CARD_GRADIENT_START,
  BANNER_TONE_CAUTION_BG,
  BANNER_TONE_POSITIVE_BG,
  BORDER_CARD,
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

export function StatusBanner({ summary }: Props): JSX.Element {
  const bg = backgroundForTone(summary.summaryTone);
  const { cycleDay } = summary;
  const hasSupportingContext = summary.supportingContext.trim().length > 0;
  const notes = summary.interpretationNotes ?? [];
  const hasNotes = notes.length > 0;

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
      <Text
        style={[
          styles.completeness,
          cycleDay === null ? styles.completenessAfterConfidence : null,
        ]}
      >
        {summary.completeness}
      </Text>
      {hasSupportingContext ? (
        <Text style={styles.supporting}>{summary.supportingContext}</Text>
      ) : null}
      {hasNotes
        ? notes.map((line, i) => (
            <Text key={`note-${i}`} style={styles.interpretationNote}>
              {line}
            </Text>
          ))
        : null}
      <Text style={styles.guidance}>{summary.guidance}</Text>
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
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_SUBTLE,
    marginTop: 10,
    lineHeight: 22,
  },
  completeness: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_SUBTLE,
    marginTop: 8,
    lineHeight: 22,
  },
  completenessAfterConfidence: {
    marginTop: 10,
  },
  supporting: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    marginTop: 10,
    lineHeight: 22,
  },
  interpretationNote: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    marginTop: 8,
    lineHeight: 22,
  },
  guidance: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER_CARD,
    lineHeight: 22,
  },
});
