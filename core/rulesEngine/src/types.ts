export type BleedingType = 'heavy' | 'moderate' | 'light' | 'spotting' | 'none' | 'brown';
export type Sensation = 'dry' | 'damp' | 'wet' | 'slippery';
export type Appearance = 'none' | 'cloudy' | 'clear' | 'stretchy';
export type Quantity = 'none' | 'low' | 'medium' | 'high';

export type PhaseLabel =
  | 'dry'
  | 'fertile_open'
  | 'peak_confirmed'
  | 'p_plus_1'
  | 'p_plus_2'
  | 'p_plus_3'
  | 'post_peak'
  | 'fertile_unconfirmed_peak'
  | 'missing'
  | 'previous_cycle';

export interface Observation {
  sensation: Sensation;
  appearance: Appearance;
  quantity?: Quantity;
}

export interface DailyEntry {
  date?: string;
  bleeding?: BleedingType;
  sensation?: Sensation;
  appearance?: Appearance;
  quantity?: Quantity;
  intercourse?: boolean;
  notes?: string;
  missing?: boolean;
  observations?: Observation[];
  /** Test/fixture only -- bypasses sensation/appearance rank calculation. */
  mucusRankOverride?: number;
}

export interface CycleResult {
  peakIndex: number | null;
  fertileStartIndex: number | null;
  fertileEndIndex: number | null;
  phaseLabels: PhaseLabel[];
  mucusRanks: Array<number | null>;
}
