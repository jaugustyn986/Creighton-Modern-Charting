import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyEntry } from '../../../../core/rulesEngine/src/types';

const ENTRIES_KEY = 'holistic_cycle_entries';

export interface StoredEntries {
  [date: string]: DailyEntry;
}

async function readAll(): Promise<StoredEntries> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as StoredEntries;
}

async function writeAll(entries: StoredEntries): Promise<void> {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function saveDailyEntry(date: string, entry: DailyEntry): Promise<void> {
  const all = await readAll();
  all[date] = { ...entry, date };
  await writeAll(all);
}

export async function getDailyEntry(date: string): Promise<DailyEntry | null> {
  const all = await readAll();
  return all[date] ?? null;
}

export async function getAllEntries(): Promise<StoredEntries> {
  return readAll();
}

export async function deleteEntry(date: string): Promise<void> {
  const all = await readAll();
  delete all[date];
  await writeAll(all);
}

export function entriesToSortedArray(stored: StoredEntries): DailyEntry[] {
  return Object.keys(stored)
    .sort()
    .map((key) => stored[key]);
}
