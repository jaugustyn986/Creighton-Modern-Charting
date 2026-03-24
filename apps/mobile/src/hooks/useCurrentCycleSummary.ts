import { useMemo } from 'react';
import {
  buildCurrentCycleSummary,
  CurrentCycleSummary,
  CycleSlice,
  recalculateCycle,
} from 'core-rules-engine';

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const EMPTY_RESULT = recalculateCycle([]);

/**
 * Calendar header summary: last cycle slice only, same source as multi-cycle grid.
 */
export function useCurrentCycleSummaryFromCycles(
  cycles: CycleSlice[],
): CurrentCycleSummary {
  return useMemo(() => {
    const today = todayString();
    if (cycles.length === 0) {
      return buildCurrentCycleSummary({
        entries: [],
        result: EMPTY_RESULT,
        status: 'no_peak',
        todayIndex: null,
        calendarAsOfDate: today,
      });
    }
    const slice = cycles[cycles.length - 1];
    const todayIdx = slice.entries.findIndex((e) => e.date === today);
    return buildCurrentCycleSummary({
      entries: slice.entries,
      result: slice.result,
      status: slice.status,
      todayIndex: todayIdx >= 0 ? todayIdx : null,
      calendarAsOfDate: today,
    });
  }, [cycles]);
}
