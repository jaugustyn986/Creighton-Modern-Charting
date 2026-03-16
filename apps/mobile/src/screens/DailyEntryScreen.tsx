import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { EntryForm } from '../components/EntryForm';
import { DailyEntry } from '../../../../core/rulesEngine/src/types';
import { getDailyEntry, saveDailyEntry, deleteEntry } from '../services/storageV2';

type ScreenRoute = RouteProp<RootStackParamList, 'DailyEntry'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'DailyEntry'>;

export function DailyEntryScreen(): JSX.Element {
  const route = useRoute<ScreenRoute>();
  const navigation = useNavigation<Nav>();
  const { date } = route.params;

  const [existing, setExisting] = useState<DailyEntry | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getDailyEntry(date).then((entry) => {
      setExisting(entry);
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
      date={date}
      onSave={handleSave}
      onCancel={() => navigation.goBack()}
      onDelete={existing ? handleDelete : undefined}
    />
  );
}
