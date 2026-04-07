import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Pressable, Text } from 'react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { EntryForm } from '../components/EntryForm';
import { DailyEntry } from 'core-rules-engine';
import { getDailyEntry, saveDailyEntry, deleteEntry } from '../services/storageV2';
import { TEXT_SECONDARY } from '../theme/colors';

type ScreenRoute = RouteProp<RootStackParamList, 'DailyEntry'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'DailyEntry'>;

function previousDateString(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DailyEntryScreen(): JSX.Element {
  const route = useRoute<ScreenRoute>();
  const navigation = useNavigation<Nav>();
  const { date } = route.params;

  const [existing, setExisting] = useState<DailyEntry | null>(null);
  const [previousDayEntry, setPreviousDayEntry] = useState<DailyEntry | null>(null);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ paddingHorizontal: 4, paddingVertical: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: TEXT_SECONDARY }}>Cancel</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    Promise.all([
      getDailyEntry(date),
      getDailyEntry(previousDateString(date)),
    ]).then(([entry, prevEntry]) => {
      setExisting(entry);
      setPreviousDayEntry(prevEntry);
      setLoaded(true);
    });
  }, [date]);

  const handleSave = useCallback(async (entry: DailyEntry) => {
    await saveDailyEntry(date, entry);
    navigation.goBack();
  }, [date, navigation]);

  const handleDelete = useCallback(async () => {
    await deleteEntry(date);
    navigation.goBack();
  }, [date, navigation]);

  if (!loaded) return <></>;

  return (
    <EntryForm
      initialEntry={existing}
      previousDayEntry={previousDayEntry}
      date={date}
      onSave={handleSave}
      onDelete={existing ? handleDelete : undefined}
    />
  );
}
