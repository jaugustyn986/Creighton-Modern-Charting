import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native';

interface Props {
  onComplete: () => void;
}

interface Slide {
  id: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Welcome to Holistic Cycle',
    body: 'This app helps you track daily fertility observations and understand your fertile window while trying to conceive.',
  },
  {
    id: '2',
    title: 'What to Observe',
    body: 'Each time you use the bathroom, note the sensation at the vulva and any visible mucus on the tissue. These two observations are all you need.',
  },
  {
    id: '3',
    title: 'When to Observe',
    body: 'Check before and after toileting throughout the day. Make a final check at bedtime. At the end of the day, record the most fertile sign you observed — not just the most recent.',
  },
  {
    id: '4',
    title: 'Start Charting',
    body: 'Your cycle starts on the first day of bleeding. Tap the + Entry button to log your first observation. Let\'s begin!',
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

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideTitle: {
    fontSize: 26, fontWeight: '700', color: '#1e293b',
    textAlign: 'center', marginBottom: 16,
  },
  slideBody: {
    fontSize: 16, color: '#475569', textAlign: 'center', lineHeight: 24,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: 24, gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0',
  },
  activeDot: { backgroundColor: '#f43f5e', width: 24 },
  nextBtn: {
    backgroundColor: '#f43f5e', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 48,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { marginTop: 12 },
  skipText: { color: '#94a3b8', fontSize: 14 },
});
