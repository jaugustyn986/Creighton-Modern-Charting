import { useCallback, useEffect, useState } from 'react';
import { recalculateCycle, CycleResult, DailyEntry } from 'core-rules-engine';
import {
  getAllEntries,
  saveDailyEntry,
  deleteEntry,
  entriesToSortedArray,
  type StoredEntries,
} from '../services/storageV2';
import { useSync } from '../context/SyncProvider';

interface CycleData {
  entries: StoredEntries;
  sortedEntries: DailyEntry[];
  result: CycleResult;
  loading: boolean;
  save: (date: string, entry: DailyEntry) => Promise<void>;
  remove: (date: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY_RESULT: CycleResult = {
  peakCandidateIndex: null,
  peakIndex: null,
  peakConfirmed: false,
  fertileStartIndex: null,
  fertileStartReason: null,
  fertileEndIndex: null,
  phaseLabels: [],
  mucusRanks: [],
  mucusDerivedByDay: [],
  bleedingClassByDay: [],
  brownBleedingContextByDay: [],
  dataComplete: true,
  interpretationWarnings: [],
  primaryDayClassByDay: [],
};

export function useCycleData(): CycleData {
  const sync = useSync();
  const [entries, setEntries] = useState<StoredEntries>({});
  const [result, setResult] = useState<CycleResult>(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);

  const recompute = useCallback((stored: StoredEntries) => {
    const sorted = entriesToSortedArray(stored);
    const cycleResult = recalculateCycle(sorted);
    setEntries(stored);
    setResult(cycleResult);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const stored = await getAllEntries();
    recompute(stored);
    setLoading(false);
  }, [recompute]);

  const save = useCallback(async (date: string, entry: DailyEntry) => {
    await saveDailyEntry(date, entry);
    const stored = await getAllEntries();
    recompute(stored);
    if (sync?.syncNow) void sync.syncNow();
  }, [recompute, sync]);

  const remove = useCallback(async (date: string) => {
    await deleteEntry(date);
    const stored = await getAllEntries();
    recompute(stored);
    if (sync?.syncNow) void sync.syncNow();
  }, [recompute, sync]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sortedEntries = entriesToSortedArray(entries);

  return { entries, sortedEntries, result, loading, save, remove, refresh };
}

