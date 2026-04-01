import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  HELP_COLOR_GUIDE_NON_PEAK_MUCUS,
  HELP_COLOR_GUIDE_PEAK_TYPE_MUCUS,
  HELP_HOW_TO_OBSERVE_BODY,
  HELP_HOW_TO_OBSERVE_TITLE,
  HELP_SENSATION_APPEARANCE_BODY,
  HELP_SENSATION_APPEARANCE_TITLE,
  HELP_STATUS_MESSAGE_SECTIONS,
  HELP_TRYING_TO_CONCEIVE_BODY,
  HELP_WHAT_IS_PEAK_DAY_BODY,
  HELP_WHAT_IS_PEAK_DAY_TITLE,
} from 'core-rules-engine';
import { useResetOnboarding } from '../navigation/AppNavigator';
import { LineIcon, type IconName } from '../components/LineIcon';
import {
  BG_BLEEDING, BG_DRY, BG_NO_ENTRY, BG_PEAK_TYPE, BG_POST_PEAK, BG_PAGE, BG_CARD,
  FERTILE_ACCENT, PEAK_BORDER, BORDER_CARD, BORDER_TODAY, INTERCOURSE_ICON,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
} from '../theme/colors';

interface AccordionItemData {
  title: string;
  icon: IconName;
  content?: string;
  renderContent?: () => JSX.Element;
}

const SECTIONS: AccordionItemData[] = [
  {
    title: HELP_HOW_TO_OBSERVE_TITLE,
    icon: 'eye',
    content: HELP_HOW_TO_OBSERVE_BODY,
  },
  {
    title: HELP_SENSATION_APPEARANCE_TITLE,
    icon: 'droplet',
    content: HELP_SENSATION_APPEARANCE_BODY,
  },
  {
    title: HELP_WHAT_IS_PEAK_DAY_TITLE,
    icon: 'sparkle',
    content: HELP_WHAT_IS_PEAK_DAY_BODY,
  },
  {
    title: 'When should we try to conceive?',
    icon: 'heart',
    content: HELP_TRYING_TO_CONCEIVE_BODY,
  },
  {
    title: 'What do the status messages mean?',
    icon: 'chart',
    renderContent: () => <StatusMessageSections />,
  },
  {
    title: 'Calendar color guide',
    icon: 'grid',
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

function StatusMessageSections(): JSX.Element {
  return (
    <View style={statusHelpStyles.container}>
      {HELP_STATUS_MESSAGE_SECTIONS.map((section, i) => (
        <View key={section.title + i} style={statusHelpStyles.block}>
          <Text style={statusHelpStyles.sectionTitle}>{section.title}</Text>
          <Text style={statusHelpStyles.sectionBody}>{section.body}</Text>
        </View>
      ))}
    </View>
  );
}

const statusHelpStyles = StyleSheet.create({
  container: { gap: 18 },
  block: { gap: 6 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  sectionBody: {
    fontSize: 15,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
});

function ColorGuideSwatches(): JSX.Element {
  return (
    <View style={swatchStyles.container}>
      <SwatchRow bg={BG_NO_ENTRY} label="No entry logged" />
      <SwatchRow bg={BG_BLEEDING} label="Bleeding day" />
      <SwatchRow bg={BG_DRY} label="Dry day (no mucus)" />
      <SwatchRow bg={BG_DRY} dotColor={FERTILE_ACCENT} label={HELP_COLOR_GUIDE_NON_PEAK_MUCUS} />
      <SwatchRow bg={BG_PEAK_TYPE} label={HELP_COLOR_GUIDE_PEAK_TYPE_MUCUS} />
      <SwatchRow bg={BG_PEAK_TYPE} borderColor={PEAK_BORDER} label="Confirmed Peak Day" />
      <SwatchRow bg={BG_POST_PEAK} label="Post-peak (P+1, P+2, P+3)" />
      <SwatchRow bg={BG_NO_ENTRY} borderColor={BORDER_TODAY} label="Today" />
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
        <View style={styles.accordionIconWrap}>
          <LineIcon name={item.icon} size={20} />
        </View>
        <Text style={styles.accordionTitle}>{item.title}</Text>
        <Text style={styles.chevron}>{open ? '\u2227' : '\u2228'}</Text>
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
  accordionIconWrap: { marginRight: 10 },
  accordionTitle: { flex: 1, fontSize: 15, fontWeight: '500', color: TEXT_PRIMARY },
  chevron: { fontSize: 16, color: TEXT_MUTED },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  accordionContent: { fontSize: 15, fontWeight: '400', color: TEXT_SECONDARY, lineHeight: 22 },
  showOnboarding: {
    marginTop: 24, padding: 14, backgroundColor: BORDER_CARD, borderRadius: 10, alignItems: 'center',
  },
  showOnboardingText: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '500' },
});
