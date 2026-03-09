import {
  Appearance,
  DailyEntry,
  CreightonCode,
  FertilityClassification,
  Frequency,
} from './types';

const LUBRICATIVE_PROMOTABLE = new Set(['damp', 'shiny', 'wet']);

function getBaseCode(entry: DailyEntry): string {
  const sensation = entry.sensation ?? 'dry';
  const appearances = entry.appearances ?? [];
  const hasLubricative = appearances.includes('lubricative');

  if (hasLubricative && LUBRICATIVE_PROMOTABLE.has(sensation)) {
    switch (sensation) {
      case 'damp': return '10DL';
      case 'shiny': return '10SL';
      case 'wet': return '10WL';
    }
  }

  switch (sensation) {
    case 'stretchy': return '10';
    case 'tacky': return '8';
    case 'sticky': return '6';
    case 'wet': return '2W';
    case 'shiny': return '4';
    case 'damp': return '2';
    default: return '0';
  }
}

const APPEARANCE_SUFFIX_ORDER: Array<{ key: Appearance; code: string }> = [
  { key: 'brown', code: 'B' },
  { key: 'cloudy', code: 'C' },
  { key: 'cloudy_clear', code: 'C/K' },
  { key: 'gummy', code: 'G' },
  { key: 'clear', code: 'K' },
  { key: 'lubricative', code: 'L' },
  { key: 'pasty', code: 'P' },
  { key: 'red', code: 'R' },
  { key: 'yellow', code: 'Y' },
];

function getAppearanceSuffix(entry: DailyEntry, baseCode: string): string {
  const appearances = entry.appearances ?? [];
  if (appearances.length === 0 || (appearances.length === 1 && appearances[0] === 'none')) {
    return '';
  }

  const lubricativeAbsorbed =
    baseCode === '10DL' || baseCode === '10SL' || baseCode === '10WL';

  const parts: string[] = [];
  for (const { key, code } of APPEARANCE_SUFFIX_ORDER) {
    if (key === 'lubricative' && lubricativeAbsorbed) continue;
    if (appearances.includes(key)) parts.push(code);
  }
  return parts.join('');
}

function getFrequencySuffix(freq: Frequency | undefined): string {
  switch (freq) {
    case 1: return 'X1';
    case 2: return 'X2';
    case 3: return 'X3';
    case 'all_day': return 'AD';
    default: return '';
  }
}

function classifyBaseCode(baseCode: string): FertilityClassification {
  if (baseCode === '2' || baseCode === '2W' || baseCode === '4') return 'early_fertile';
  if (baseCode === '6' || baseCode === '8') return 'fertile';
  if (baseCode === '10' || baseCode === '10DL' || baseCode === '10SL' || baseCode === '10WL') return 'peak_type';
  return 'dry';
}

export function generateCreightonCode(entry: DailyEntry): CreightonCode {
  const baseCode = getBaseCode(entry);
  const appearanceSuffix = getAppearanceSuffix(entry, baseCode);
  const frequencySuffix = getFrequencySuffix(entry.frequency);
  const fullCode = `${baseCode}${appearanceSuffix}${frequencySuffix}`;
  const fertilityClassification = classifyBaseCode(baseCode);

  return { baseCode, appearanceSuffix, frequencySuffix, fullCode, fertilityClassification };
}

export function classifyFertility(entry: DailyEntry): FertilityClassification {
  return classifyBaseCode(getBaseCode(entry));
}
