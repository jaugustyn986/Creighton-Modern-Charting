export type BleedingType = 'heavy' | 'moderate' | 'light' | 'spotting' | 'none' | 'brown';
export type Sensation = 'dry' | 'damp' | 'wet' | 'shiny' | 'sticky' | 'tacky' | 'stretchy';
export type Appearance = 'none' | 'brown' | 'cloudy' | 'cloudy_clear' | 'gummy' | 'clear' | 'lubricative' | 'pasty' | 'red' | 'yellow';
export type Frequency = 1 | 2 | 3 | 'all_day';
export type FertilityClassification = 'dry' | 'early_fertile' | 'fertile' | 'peak_type';

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
  appearances: Appearance[];
}

export interface DailyEntry {
  date?: string;
  bleeding?: BleedingType;
  sensation?: Sensation;
  appearances?: Appearance[];
  intercourse?: boolean;
  notes?: string;
  frequency?: Frequency;
  missing?: boolean;
  observations?: Observation[];
  /** Test/fixture only -- bypasses sensation/appearance rank calculation. */
  mucusRankOverride?: number;
}

export interface CreightonCode {
  baseCode: string;
  appearanceSuffix: string;
  frequencySuffix: string;
  fullCode: string;
  fertilityClassification: FertilityClassification;
}

export interface CycleResult {
  peakIndex: number | null;
  fertileStartIndex: number | null;
  fertileEndIndex: number | null;
  phaseLabels: PhaseLabel[];
  mucusRanks: Array<number | null>;
}
