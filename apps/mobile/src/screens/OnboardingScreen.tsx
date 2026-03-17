import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native';
import {
  BG_CARD, BG_PAGE, ACCENT_WARM, BORDER_CARD,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
} from '../theme/colors';
import { LineIcon, type IconName } from '../components/LineIcon';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoSource = require('../../assets/icon-1024.png');

interface Props {
  onComplete: () => void;
}

interface Slide {
  id: string;
  icon: IconName | 'logo';
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'logo',
    title: 'Welcome to Well Within',
    body: 'Your cycle tells a story. Well Within helps you notice the natural signs your body gives each day so you can better understand your fertility and your health.',
  },
  {
    id: '2',
    icon: 'observe',
    title: 'What to Notice',
    body: 'Each time you use the bathroom, simply notice anything you see or feel on the tissue. These small observations reveal where you are in your cycle.',
  },
  {
    id: '3',
    icon: 'clock',
    title: 'When to Observe',
    body: 'Check before and after using the bathroom during the day. At night, record the most fertile sign you noticed that day \u2014 not just the most recent one.',
  },
  {
    id: '4',
    icon: 'calendar',
    title: 'Start Charting',
    body: 'Your cycle begins on the first day of bleeding. Tap today\u2019s observation card to record your first entry and begin learning your body\u2019s natural rhythm.',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function OnboardingScreen({ onComplete }: Props): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const   renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.iconArea, item.icon === 'logo' && styles.logoContainer]}>
        {item.icon === 'logo' ? (
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        ) : (
          <LineIcon name={item.icon} size={72} />
        )}
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideBody}>{item.body}</Text>
    </View>
  );

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
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === activeIndex && styles.activeDot]}
            />
          ))}
        </View>

        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </Pressable>

        {!isLast && (
          <Pressable style={styles.skipBtn} onPress={onComplete}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_CARD },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconArea: { marginBottom: 32 },
  logoContainer: { backgroundColor: BG_PAGE, borderRadius: 20, padding: 16 },
  logo: { width: 160, height: 160, backgroundColor: 'transparent' },
  slideTitle: {
    fontSize: 28, fontWeight: '600', color: TEXT_PRIMARY,
    textAlign: 'center', marginBottom: 16, letterSpacing: -0.2,
  },
  slideBody: {
    fontSize: 16, fontWeight: '400', color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 24,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: 24, gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: BORDER_CARD,
  },
  activeDot: { backgroundColor: ACCENT_WARM, width: 24 },
  nextBtn: {
    backgroundColor: ACCENT_WARM, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 48, width: '100%', alignItems: 'center',
  },
  nextText: { color: BG_CARD, fontSize: 16, fontWeight: '600' },
  skipBtn: { marginTop: 16 },
  skipText: { color: TEXT_MUTED, fontSize: 14 },
});
