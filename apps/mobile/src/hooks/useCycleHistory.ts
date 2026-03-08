import { useCallback, useEffect, useState } from 'react';
import {
  CycleSlice,
  CycleSummary,
  splitIntoCycles,
  computeCycleSummary,
  generateInsights,
} from '../../../../core/rulesEngine/src/multiCycle';
import { getAllEntries, entriesToSortedArray } from '../services/storage';

interface CycleHistoryData {
  cycles: CycleSlice[];
  summary: CycleSummary;
  insights: string[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const EMPTY_SUMMARY: CycleSummary = {
  cyclesTracked: 0,
  avgLength: null,
  shortestLength: null,
  longestLength: null,
  avgPeakDay: null,
  avgLutealPhase: null,
};

export function useCycleHistory(): CycleHistoryData {
  const [cycles, setCycles] = useState<CycleSlice[]>([]);
  const [summary, setSummary] = useState<CycleSummary>(EMPTY_SUMMARY);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const stored = await getAllEntries();
    const sorted = entriesToSortedArray(stored);
    const slices = splitIntoCycles(sorted);
    setCycles(slices);
    setSummary(computeCycleSummary(slices));
    setInsights(generateInsights(slices));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cycles, summary, insights, loading, refresh };
}
