import { generateCreightonCode, classifyFertility } from '../src/creightonCode';

describe('generateCreightonCode', () => {
  it('dry / no appearances / once → 0X1', () => {
    const result = generateCreightonCode({
      sensation: 'dry',
      appearances: [],
      frequency: 1,
    });
    expect(result.baseCode).toBe('0');
    expect(result.appearanceSuffix).toBe('');
    expect(result.frequencySuffix).toBe('X1');
    expect(result.fullCode).toBe('0X1');
    expect(result.fertilityClassification).toBe('dry');
  });

  it('damp / cloudy / twice → 2CX2', () => {
    const result = generateCreightonCode({
      sensation: 'damp',
      appearances: ['cloudy'],
      frequency: 2,
    });
    expect(result.baseCode).toBe('2');
    expect(result.appearanceSuffix).toBe('C');
    expect(result.fullCode).toBe('2CX2');
    expect(result.fertilityClassification).toBe('early_fertile');
  });

  it('stretchy / clear / all_day → 10KAD', () => {
    const result = generateCreightonCode({
      sensation: 'stretchy',
      appearances: ['clear'],
      frequency: 'all_day',
    });
    expect(result.baseCode).toBe('10');
    expect(result.appearanceSuffix).toBe('K');
    expect(result.fullCode).toBe('10KAD');
    expect(result.fertilityClassification).toBe('peak_type');
  });

  it('wet / lubricative+clear / all_day → 10WLKAD (Lubricative promotes wet to 10WL, L absorbed)', () => {
    const result = generateCreightonCode({
      sensation: 'wet',
      appearances: ['lubricative', 'clear'],
      frequency: 'all_day',
    });
    expect(result.baseCode).toBe('10WL');
    expect(result.appearanceSuffix).toBe('K');
    expect(result.fullCode).toBe('10WLKAD');
    expect(result.fertilityClassification).toBe('peak_type');
  });

  it('damp / lubricative / once → 10DLX1 (L absorbed into base code)', () => {
    const result = generateCreightonCode({
      sensation: 'damp',
      appearances: ['lubricative'],
      frequency: 1,
    });
    expect(result.baseCode).toBe('10DL');
    expect(result.appearanceSuffix).toBe('');
    expect(result.fullCode).toBe('10DLX1');
    expect(result.fertilityClassification).toBe('peak_type');
  });

  it('shiny / lubricative+clear / twice → 10SLKX2', () => {
    const result = generateCreightonCode({
      sensation: 'shiny',
      appearances: ['lubricative', 'clear'],
      frequency: 2,
    });
    expect(result.baseCode).toBe('10SL');
    expect(result.appearanceSuffix).toBe('K');
    expect(result.fullCode).toBe('10SLKX2');
    expect(result.fertilityClassification).toBe('peak_type');
  });

  it('sticky / cloudy / once → 6CX1', () => {
    const result = generateCreightonCode({
      sensation: 'sticky',
      appearances: ['cloudy'],
      frequency: 1,
    });
    expect(result.baseCode).toBe('6');
    expect(result.appearanceSuffix).toBe('C');
    expect(result.fullCode).toBe('6CX1');
    expect(result.fertilityClassification).toBe('fertile');
  });

  it('tacky / cloudy / three times → 8CX3', () => {
    const result = generateCreightonCode({
      sensation: 'tacky',
      appearances: ['cloudy'],
      frequency: 3,
    });
    expect(result.baseCode).toBe('8');
    expect(result.appearanceSuffix).toBe('C');
    expect(result.fullCode).toBe('8CX3');
    expect(result.fertilityClassification).toBe('fertile');
  });

  it('wet / no appearances / twice → 2WX2', () => {
    const result = generateCreightonCode({
      sensation: 'wet',
      appearances: [],
      frequency: 2,
    });
    expect(result.baseCode).toBe('2W');
    expect(result.fullCode).toBe('2WX2');
    expect(result.fertilityClassification).toBe('early_fertile');
  });

  it('shiny / no appearances / once → 4X1', () => {
    const result = generateCreightonCode({
      sensation: 'shiny',
      appearances: [],
      frequency: 1,
    });
    expect(result.baseCode).toBe('4');
    expect(result.fullCode).toBe('4X1');
    expect(result.fertilityClassification).toBe('early_fertile');
  });

  it('defaults missing fields to dry / no appearances', () => {
    const result = generateCreightonCode({});
    expect(result.baseCode).toBe('0');
    expect(result.fullCode).toBe('0');
    expect(result.fertilityClassification).toBe('dry');
  });

  it('omits frequency suffix when frequency is undefined', () => {
    const result = generateCreightonCode({ sensation: 'damp', appearances: [] });
    expect(result.frequencySuffix).toBe('');
    expect(result.fullCode).toBe('2');
  });

  it('multi-select appearances are concatenated in Creighton order', () => {
    const result = generateCreightonCode({
      sensation: 'sticky',
      appearances: ['yellow', 'cloudy', 'gummy'],
      frequency: 1,
    });
    expect(result.appearanceSuffix).toBe('CGY');
    expect(result.fullCode).toBe('6CGYX1');
  });

  it('Lubricative stays in suffix when sensation is not promotable (e.g. stretchy)', () => {
    const result = generateCreightonCode({
      sensation: 'stretchy',
      appearances: ['lubricative', 'clear'],
      frequency: 1,
    });
    expect(result.baseCode).toBe('10');
    expect(result.appearanceSuffix).toBe('KL');
    expect(result.fullCode).toBe('10KLX1');
  });

  it('cloudy_clear appearance produces C/K suffix', () => {
    const result = generateCreightonCode({
      sensation: 'tacky',
      appearances: ['cloudy_clear'],
      frequency: 1,
    });
    expect(result.appearanceSuffix).toBe('C/K');
    expect(result.fullCode).toBe('8C/KX1');
  });

  it('appearance "none" produces no suffix', () => {
    const result = generateCreightonCode({
      sensation: 'damp',
      appearances: ['none'],
      frequency: 1,
    });
    expect(result.appearanceSuffix).toBe('');
    expect(result.fullCode).toBe('2X1');
  });
});

describe('classifyFertility', () => {
  it('returns dry for dry sensation', () => {
    expect(classifyFertility({ sensation: 'dry', appearances: [] })).toBe('dry');
  });

  it('returns early_fertile for damp, wet, shiny', () => {
    expect(classifyFertility({ sensation: 'damp', appearances: [] })).toBe('early_fertile');
    expect(classifyFertility({ sensation: 'wet', appearances: [] })).toBe('early_fertile');
    expect(classifyFertility({ sensation: 'shiny', appearances: [] })).toBe('early_fertile');
  });

  it('returns fertile for sticky or tacky', () => {
    expect(classifyFertility({ sensation: 'sticky', appearances: [] })).toBe('fertile');
    expect(classifyFertility({ sensation: 'tacky', appearances: [] })).toBe('fertile');
  });

  it('returns peak_type for stretchy', () => {
    expect(classifyFertility({ sensation: 'stretchy', appearances: [] })).toBe('peak_type');
  });

  it('returns peak_type for Lubricative-promoted sensations', () => {
    expect(classifyFertility({ sensation: 'damp', appearances: ['lubricative'] })).toBe('peak_type');
    expect(classifyFertility({ sensation: 'shiny', appearances: ['lubricative'] })).toBe('peak_type');
    expect(classifyFertility({ sensation: 'wet', appearances: ['lubricative'] })).toBe('peak_type');
  });
});

describe('generateCreightonCode edge cases', () => {
  it('handles unknown sensation gracefully (defaults to dry)', () => {
    const result = generateCreightonCode({ sensation: 'unknown' as never });
    expect(result.baseCode).toBe('0');
    expect(result.fertilityClassification).toBe('dry');
  });

  it('empty appearances array treated same as no appearances', () => {
    const result = generateCreightonCode({ sensation: 'damp', appearances: [] });
    expect(result.appearanceSuffix).toBe('');
  });
});
