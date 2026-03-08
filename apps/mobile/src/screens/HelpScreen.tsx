import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useResetOnboarding } from '../navigation/AppNavigator';

interface AccordionItemData {
  title: string;
  icon: string;
  content: string;
}

const SECTIONS: AccordionItemData[] = [
  {
    title: 'How do I make my observation?',
    icon: '👁',
    content:
      'Use folded toilet tissue and wipe front to back.\n\n' +
      '• Note the sensation at the vulva (what you feel)\n' +
      '• Note the appearance of any mucus on the tissue (what you see)\n' +
      '• Check before and after toileting throughout the day\n' +
      '• Make a final observation at bedtime\n' +
      '• Record the most fertile observation of the day\n' +
      '• Record the most fertile sign you observed all day — not just the last one',
  },
  {
    title: 'What do the mucus types mean?',
    icon: '💧',
    content:
      'Type 0 - Dry\nNo mucus present. No discharge observed at the vulva. Dry day — record as no mucus.\n\n' +
      'Type 1 - Damp\nSticky, pasty, or cloudy mucus. Slightly moist feeling. Non-peak type — early fertility sign.\n\n' +
      'Type 2 - Wet\nWet, cloudy mucus. Fertile but not peak-type. Indicates rising fertility.\n\n' +
      'Type 3 - Peak\nClear, stretchy, lubricative, or slippery mucus (like raw egg white). Peak-type mucus — this signals ovulation is near.',
  },
  {
    title: 'What is the Peak Day?',
    icon: '✨',
    content:
      'The Peak Day is the last day you observe peak-type mucus (clear, stretchy, or slippery/lubricative).\n\n' +
      'Why it matters: Ovulation typically occurs within 1–2 days after the Peak Day. This is your body\'s signal that the egg has been released.\n\n' +
      'The app uses the P+3 Rule: After Peak Day, you need 3 days of lower-quality mucus to confirm ovulation. Your fertile window ends at P+3.',
  },
  {
    title: 'When should we try to conceive?',
    icon: '❤️',
    content:
      'Best timing:\nHave intercourse every 1–2 days starting when you first see mucus (Type 1 or higher) and continue through Peak Day.\n\n' +
      'The fertile window is approximately 6 days before ovulation through 1 day after. Your chances are highest 1–2 days before ovulation.\n\n' +
      'Tip: Don\'t wait for peak-type mucus to start! Sperm can survive in fertile mucus for several days, so starting early improves your chances.',
  },
  {
    title: 'What do the status messages mean?',
    icon: '📊',
    content:
      'Tracking: You\'re recording observations but haven\'t yet entered your fertile window.\n\n' +
      'Fertile: You\'re in your fertile window! Mucus is present and fertility is elevated.\n\n' +
      'Peak: Peak Day detected! Ovulation likely occurred within the last 1–2 days.',
  },
  {
    title: 'Calendar color guide',
    icon: '📅',
    content:
      '⬜ White — No entry logged\n' +
      '🟥 Red/Pink — Bleeding day\n' +
      '🟩 Green — Dry day (no mucus, rank 0)\n' +
      '🟩 Green + dot — Non-peak mucus present (Type 1–2)\n' +
      '⬜ White + blue dot — Peak-type mucus (Type 3, clear/stretchy/lubricative)\n' +
      '⬜ White + blue dot + blue border — Confirmed Peak Day\n' +
      '🟨 Yellow — Post-peak days (P+1, P+2, P+3)',
  },
];

function AccordionItem({ item }: { item: AccordionItemData }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.accordionItem}>
      <Pressable style={styles.accordionHeader} onPress={() => setOpen(!open)}>
        <Text style={styles.accordionIcon}>{item.icon}</Text>
        <Text style={styles.accordionTitle}>{item.title}</Text>
        <Text style={styles.chevron}>{open ? '∧' : '∨'}</Text>
      </Pressable>
      {open && (
        <View style={styles.accordionBody}>
          <Text style={styles.accordionContent}>{item.content}</Text>
        </View>
      )}
    </View>
  );
}

export function HelpScreen(): JSX.Element {
  const resetOnboarding = useResetOnboarding();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Understanding Your Chart</Text>
      {SECTIONS.map((section, idx) => (
        <AccordionItem key={idx} item={section} />
      ))}
      {resetOnboarding && (
        <Pressable style={styles.showOnboarding} onPress={resetOnboarding.resetOnboarding}>
          <Text style={styles.showOnboardingText}>Show onboarding again</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  accordionItem: {
    backgroundColor: '#fff', borderRadius: 12,
    marginBottom: 8, overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
  },
  accordionIcon: { fontSize: 18, marginRight: 10 },
  accordionTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1e293b' },
  chevron: { fontSize: 16, color: '#94a3b8' },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  accordionContent: { fontSize: 13, color: '#475569', lineHeight: 20 },
  showOnboarding: {
    marginTop: 24, padding: 14, backgroundColor: '#e2e8f0', borderRadius: 10, alignItems: 'center',
  },
  showOnboardingText: { fontSize: 14, color: '#475569', fontWeight: '500' },
});
