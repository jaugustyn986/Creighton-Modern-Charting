import { useCallback, useEffect, useState } from 'react';
import { recalculateCycle } from '../../../../core/rulesEngine/src/recalc';
import { CycleResult, DailyEntry } from '../../../../core/rulesEngine/src/types';
import {
  getAllEntries,
  saveDailyEntry,
  deleteEntry,
  entriesToSortedArray,
  StoredEntries,
} from '../services/storage';

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
  peakIndex: null,
  fertileStartIndex: null,
  fertileEndIndex: null,
  phaseLabels: [],
  mucusRanks: [],
};

export function useCycleData(): CycleData {
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
  }, [recompute]);

  const remove = useCallback(async (date: string) => {
    await deleteEntry(date);
    const stored = await getAllEntries();
    recompute(stored);
  }, [recompute]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sortedEntries = entriesToSortedArray(entries);

  return { entries, sortedEntries, result, loading, save, remove, refresh };
}
