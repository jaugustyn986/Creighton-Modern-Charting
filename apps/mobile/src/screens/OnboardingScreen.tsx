import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native';
import {
  BG_PAGE, ACCENT_WARM, BORDER_CARD,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, TEXT_SUBTLE,
} from '../theme/colors';
import {
  OnboardingCalendarUncertaintyPanel,
  OnboardingStatusBannerPanel,
  OnboardingEntryPanel,
  OnboardingHistoryPanel,
  OnboardingEmptyCalendarPanel,
} from '../components/OnboardingPanels';

/* ---------- Asset imports ---------- */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoSource = require('../../assets/icon-1024.png');

const { width: SW, height: SH } = Dimensions.get('window');

interface Props {
  onComplete: () => void;
}

interface Slide {
  id: string;
  headline: string;
  body: string;
  renderPanel?: () => JSX.Element;
  isIdentity?: boolean;
  isStatusList?: boolean;
  footerTitle?: string;
  footerBody?: string;
}

/* ---------- Slide data ---------- */

const SLIDES: Slide[] = [
  {
    id: '1',
    headline: 'well within',
    body: 'Understand your cycle with clear, structured charting.',
    isIdentity: true,
  },
  {
    id: '2',
    headline: 'Not sure what your chart means?',
    body: "It's common to feel unsure where you are in your cycle or what your observations indicate.",
    renderPanel: () => <OnboardingCalendarUncertaintyPanel />,
  },
  {
    id: '3',
    headline: 'Structured, rules-based charting',
    body: 'We follow clear rules based on your observations—no guessing or predictions.',
    isStatusList: true,
  },
  {
    id: '4',
    headline: 'See where you are in your cycle',
    body: 'The app identifies your fertile window, Peak, and post-peak phase based on what you record.',
    renderPanel: () => <OnboardingStatusBannerPanel />,
  },
  {
    id: '5',
    headline: 'Record a simple observation each day',
    body: 'Consistency helps the app interpret your cycle clearly.',
    renderPanel: () => <OnboardingEntryPanel />,
    footerTitle: 'Consistency matters',
    footerBody:
      'Daily observations help the app interpret your cycle correctly. Missing even one day can delay or prevent confirming Peak.',
  },
  {
    id: '6',
    headline: 'Understand your pattern over time',
    body: "See how your cycles compare and recognize what's consistent or changing.",
    renderPanel: () => <OnboardingHistoryPanel />,
  },
  {
    id: '7',
    headline: 'Start your first cycle',
    body: 'Small steps today. Greater clarity over time.',
    renderPanel: () => <OnboardingEmptyCalendarPanel />,
  },
];

/* ================================================================
   IDENTITY SLIDE — Screen 1
   ================================================================ */

function IdentitySlide({ headline, body }: { headline: string; body: string }): JSX.Element {
  return (
    <View style={iS.container}>
      <View style={iS.decorativeLayer}>
        <View style={iS.blob1} />
        <View style={iS.blob2} />
        <View style={iS.blob3} />
      </View>
      <View style={iS.content}>
        <View style={iS.logoBox}>
          <Image source={logoSource} style={iS.logo} resizeMode="contain" />
        </View>
        <Text style={iS.brandName}>{headline}</Text>
        <Text style={iS.tagline}>{body}</Text>
      </View>
    </View>
  );
}

const iS = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: SW * 1.0,
    height: SW * 1.0,
    borderRadius: SW * 0.5,
    backgroundColor: '#EDE8DC',
    opacity: 0.65,
    top: SH * 0.02,
    left: -SW * 0.25,
  },
  blob2: {
    position: 'absolute',
    width: SW * 0.75,
    height: SW * 0.75,
    borderRadius: SW * 0.375,
    backgroundColor: '#E5E0D5',
    opacity: 0.55,
    top: SH * 0.32,
    right: -SW * 0.2,
  },
  blob3: {
    position: 'absolute',
    width: SW * 0.55,
    height: SW * 0.55,
    borderRadius: SW * 0.275,
    backgroundColor: '#D9E5DC',
    opacity: 0.45,
    bottom: SH * 0.12,
    left: SW * 0.08,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoBox: {
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: '#FDFCFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: 110,
    height: 110,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '300',
    color: TEXT_PRIMARY,
    letterSpacing: 2,
    marginBottom: 14,
    textTransform: 'lowercase',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});

/* ================================================================
   STATUS LIST SLIDE — Screen 3
   ================================================================ */

function StatusListSlide({ headline, body }: { headline: string; body: string }): JSX.Element {
  const terms = [
    { label: 'Tracking', desc: 'Recording observations, no fertile signs yet' },
    { label: 'Fertile pattern', desc: 'Mucus observed, possible fertile window' },
    { label: 'Peak identified', desc: 'Most fertile day confirmed' },
    { label: 'Post-peak', desc: 'Past the fertile window' },
  ];

  return (
    <View style={sS.container}>
      <Text style={sS.headline}>{headline}</Text>
      <Text style={sS.body}>{body}</Text>

      <View style={sS.card}>
        {terms.map((t, idx) => (
          <View
            key={t.label}
            style={[sS.row, idx === 0 && sS.rowFirst]}
          >
            <View style={sS.dot} />
            <View style={sS.rowContent}>
              <Text style={sS.termLabel}>{t.label}</Text>
              <Text style={sS.termDesc}>{t.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const sS = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 28,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
    lineHeight: 32,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FDFCFB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_CARD,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT_WARM,
    marginTop: 5,
    marginRight: 16,
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
  },
  termLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  termDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
});

/* ================================================================
   PANEL SLIDE — Screens 2, 4, 5, 6, 7
   Renders code-based UI panels instead of image assets so content
   is always pixel-perfect at every display resolution.
   ================================================================ */

function PanelSlide({
  headline,
  body,
  renderPanel,
  footerTitle,
  footerBody,
}: {
  headline: string;
  body: string;
  renderPanel: () => JSX.Element;
  footerTitle?: string;
  footerBody?: string;
}): JSX.Element {
  const hasFooter = footerTitle != null && footerBody != null;

  return (
    <ScrollView
      style={pS.container}
      contentContainerStyle={pS.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={pS.textBlock}>
        <Text style={pS.headline}>{headline}</Text>
        <Text style={pS.body}>{body}</Text>
        {hasFooter ? (
          <View style={pS.footer}>
            <Text style={pS.footerTitle}>{footerTitle}</Text>
            <Text style={pS.footerBody}>{footerBody}</Text>
          </View>
        ) : null}
      </View>
      <View style={pS.panelArea}>
        {renderPanel()}
      </View>
    </ScrollView>
  );
}

const pS = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  textBlock: {
    paddingTop: 52,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
    lineHeight: 32,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  footer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER_CARD,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 5,
  },
  footerBody: {
    fontSize: 13,
    fontWeight: '400',
    color: TEXT_SUBTLE,
    lineHeight: 19,
  },
  panelArea: {
    paddingHorizontal: 28,
    justifyContent: 'flex-start',
  },
});

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

function renderSlideContent(item: Slide): JSX.Element | null {
  if (item.isIdentity) {
    return <IdentitySlide headline={item.headline} body={item.body} />;
  }
  if (item.isStatusList) {
    return <StatusListSlide headline={item.headline} body={item.body} />;
  }
  if (item.renderPanel != null) {
    return (
      <PanelSlide
        headline={item.headline}
        body={item.body}
        renderPanel={item.renderPanel}
        footerTitle={item.footerTitle}
        footerBody={item.footerBody}
      />
    );
  }
  return null;
}

export function OnboardingScreen({ onComplete }: Props): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  /* ---- Swipe tracking (iOS only — FlatList is reliable there) ---- */
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        activeIndexRef.current = viewableItems[0].index;
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const onScroll = useRef(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
      if (idx !== activeIndexRef.current) {
        activeIndexRef.current = idx;
        setActiveIndex(idx);
      }
    },
  ).current;

  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    const next = activeIndex + 1;
    if (activeIndex >= SLIDES.length - 1) {
      onComplete();
    } else {
      setActiveIndex(next);
      activeIndexRef.current = next;
      flatListRef.current?.scrollToOffset({ offset: next * SW, animated: true });
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width: SW }]}>
      {renderSlideContent(item)}
    </View>
  );

  const navFooter = (
    <View style={styles.navFooter}>
      <View style={styles.dots}>
        {SLIDES.map((_, idx) => (
          <View key={idx} style={[styles.dot, idx === activeIndex && styles.dotActive]} />
        ))}
      </View>
      <Pressable style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>{isLast ? 'Begin Charting' : 'Next'}</Text>
      </Pressable>
    </View>
  );

  /* ---- Web: simple state-driven single-slide view ---- */
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.slide}>
          {renderSlideContent(SLIDES[activeIndex])}
        </View>
        {navFooter}
      </View>
    );
  }

  /* ---- iOS: FlatList with swipe gestures ---- */
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScroll={onScroll}
        scrollEventThrottle={32}
      />
      {navFooter}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  slide: {
    flex: 1,
  },
  navFooter: {
    paddingHorizontal: 28,
    paddingBottom: 44,
    paddingTop: 16,
    alignItems: 'center',
    backgroundColor: BG_PAGE,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER_CARD,
  },
  dotActive: {
    backgroundColor: ACCENT_WARM,
    width: 20,
  },
  btn: {
    backgroundColor: ACCENT_WARM,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
