import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, DailyEntry, Frequency, Sensation } from '../../../../core/rulesEngine/src/types';

const ENTRIES_KEY = 'holistic_cycle_entries';
const MIGRATION_KEY = 'holistic_cycle_migration_v3';

export interface StoredEntries {
  [date: string]: DailyEntry;
}

const SENSATION_RANK: Record<string, number> = {
  dry: 0, damp: 1, shiny: 1, wet: 2, sticky: 1, tacky: 2, stretchy: 3, slippery: 3,
};

function migrateEntry(entry: DailyEntry): DailyEntry {
  const migrated = { ...entry };
  const raw = entry as Record<string, unknown>;

  // --- v2 migration (appearance:'stretchy' → stretch:'stretchy') ---
  if (raw.appearance === 'stretchy') {
    delete (migrated as Record<string, unknown>).appearance;
    if (!raw.stretch) (raw as Record<string, unknown>).stretch = 'stretchy';
  }

  // --- v2 migration (timesObserved → frequency) ---
  if (raw.timesObserved !== undefined && migrated.frequency === undefined) {
    migrated.frequency = raw.timesObserved as Frequency;
    delete (migrated as Record<string, unknown>).timesObserved;
  }
  delete (migrated as Record<string, unknown>).quantity;

  // --- v3 migration: slippery → wet + lubricative ---
  if (raw.sensation === 'slippery') {
    migrated.sensation = 'wet' as Sensation;
    const apps: Appearance[] = Array.isArray(migrated.appearances) ? [...migrated.appearances] : [];
    if (!apps.includes('lubricative')) apps.push('lubricative');
    migrated.appearances = apps;
  }

  // --- v3 migration: stretch → sensation (pick most fertile) ---
  const stretchVal = raw.stretch as string | undefined;
  if (stretchVal && stretchVal !== 'none') {
    const stretchAsSensation = stretchVal as Sensation;
    const currentSensationRank = SENSATION_RANK[migrated.sensation ?? 'dry'] ?? 0;
    const stretchSensationRank = SENSATION_RANK[stretchAsSensation] ?? 0;
    if (stretchSensationRank > currentSensationRank) {
      migrated.sensation = stretchAsSensation;
    }
  }
  delete (migrated as Record<string, unknown>).stretch;

  // --- v3 migration: appearance (single) → appearances (array) ---
  if (!Array.isArray(migrated.appearances)) {
    const oldAppearance = raw.appearance as string | undefined;
    if (oldAppearance && oldAppearance !== 'none') {
      migrated.appearances = [oldAppearance as Appearance];
    } else {
      migrated.appearances = undefined;
    }
  }
  delete (migrated as Record<string, unknown>).appearance;

  return migrated;
}

async function runMigrationIfNeeded(entries: StoredEntries): Promise<StoredEntries> {
  const done = await AsyncStorage.getItem(MIGRATION_KEY);
  if (done === 'true') return entries;

  let changed = false;
  const migrated: StoredEntries = {};
  for (const [date, entry] of Object.entries(entries)) {
    const m = migrateEntry(entry);
    migrated[date] = m;
    if (m !== entry) changed = true;
  }

  if (changed) {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(migrated));
  }
  await AsyncStorage.setItem(MIGRATION_KEY, 'true');
  return migrated;
}

async function readAll(): Promise<StoredEntries> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!raw) return {};
  const entries = JSON.parse(raw) as StoredEntries;
  return runMigrationIfNeeded(entries);
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

export async function clearAllEntries(): Promise<void> {
  await AsyncStorage.removeItem(ENTRIES_KEY);
}

export function entriesToSortedArray(stored: StoredEntries): DailyEntry[] {
  return Object.keys(stored)
    .sort()
    .map((key) => stored[key]);
}
