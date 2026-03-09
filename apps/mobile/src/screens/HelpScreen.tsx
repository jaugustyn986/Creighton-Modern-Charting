import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useResetOnboarding } from '../navigation/AppNavigator';
import {
  BG_BLEEDING, BG_DRY, BG_NO_ENTRY, BG_PEAK_TYPE, BG_POST_PEAK, BG_PAGE, BG_CARD,
  FERTILE_ACCENT, PEAK_BORDER, BORDER_CARD, BORDER_TODAY, INTERCOURSE_ICON,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, TEXT_SUBTLE,
} from '../theme/colors';

interface AccordionItemData {
  title: string;
  icon: string;
  content?: string;
  renderContent?: () => JSX.Element;
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
      'Type 3 - Peak\nClear, stretchy, or lubricative mucus (like raw egg white). Peak-type mucus — this signals ovulation is near.',
  },
  {
    title: 'What is the Peak Day?',
    icon: '✨',
    content:
      'The Peak Day is the last day you observe peak-type mucus (clear, stretchy, or lubricative).\n\n' +
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
    renderContent: () => <ColorGuideSwatches />,
  },
];

function SwatchRow({ bg, dotColor, borderColor, label }: {
  bg: string; dotColor?: string; borderColor?: string; label: string;
}): JSX.Element {
  return (
    <View style={swatchStyles.row}>
      <View style={[
        swatchStyles.swatch,
        { backgroundColor: bg },
        borderColor ? { borderWidth: 2, borderColor } : { borderWidth: 1, borderColor: BORDER_CARD },
      ]}>
        {dotColor && <View style={[swatchStyles.dot, { backgroundColor: dotColor }]} />}
      </View>
      <Text style={swatchStyles.label}>{label}</Text>
    </View>
  );
}

function ColorGuideSwatches(): JSX.Element {
  return (
    <View style={swatchStyles.container}>
      <SwatchRow bg={BG_NO_ENTRY} label="No entry logged" />
      <SwatchRow bg={BG_BLEEDING} label="Bleeding day" />
      <SwatchRow bg={BG_DRY} label="Dry day (no mucus)" />
      <SwatchRow bg={BG_DRY} dotColor={FERTILE_ACCENT} label="Non-peak mucus (Type 1–2)" />
      <SwatchRow bg={BG_PEAK_TYPE} label="Peak-type mucus (Type 3)" />
      <SwatchRow bg={BG_PEAK_TYPE} borderColor={PEAK_BORDER} label="Confirmed Peak Day" />
      <SwatchRow bg={BG_POST_PEAK} label="Post-peak (P+1, P+2, P+3)" />
      <SwatchRow bg={BG_DRY} borderColor={BORDER_TODAY} label="Today" />
      <View style={swatchStyles.row}>
        <View style={[swatchStyles.swatch, { borderWidth: 1, borderColor: BORDER_CARD, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 14 }}>{INTERCOURSE_ICON}</Text>
        </View>
        <Text style={swatchStyles.label}>Intercourse recorded</Text>
      </View>
    </View>
  );
}

const swatchStyles = StyleSheet.create({
  container: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', top: 4, right: 4 },
  label: { fontSize: 14, color: TEXT_SECONDARY, flex: 1 },
});

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
          {item.renderContent ? item.renderContent() : (
            <Text style={styles.accordionContent}>{item.content}</Text>
          )}
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
  scroll: { flex: 1, backgroundColor: BG_PAGE },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 16, letterSpacing: -0.2 },
  accordionItem: {
    backgroundColor: BG_CARD, borderRadius: 12,
    marginBottom: 8, overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
  },
  accordionIcon: { fontSize: 18, marginRight: 10 },
  accordionTitle: { flex: 1, fontSize: 15, fontWeight: '500', color: TEXT_PRIMARY },
  chevron: { fontSize: 16, color: TEXT_MUTED },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  accordionContent: { fontSize: 15, fontWeight: '400', color: TEXT_SECONDARY, lineHeight: 22 },
  showOnboarding: {
    marginTop: 24, padding: 14, backgroundColor: BORDER_CARD, borderRadius: 10, alignItems: 'center',
  },
  showOnboardingText: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '500' },
});
