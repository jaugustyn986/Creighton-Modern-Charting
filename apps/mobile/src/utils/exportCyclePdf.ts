import { CycleSlice } from '../../../../core/rulesEngine/src/multiCycle';
import { generateCreightonCode } from '../../../../core/rulesEngine/src/creightonCode';
import { PhaseLabel } from '../../../../core/rulesEngine/src/types';

const PHASE_DISPLAY: Record<PhaseLabel, string> = {
  dry: 'Dry',
  fertile_open: 'Fertile',
  peak_confirmed: 'Peak',
  p_plus_1: 'P+1',
  p_plus_2: 'P+2',
  p_plus_3: 'P+3',
  post_peak: 'Post-Peak',
  fertile_unconfirmed_peak: 'Fertile (unconf.)',
  missing: 'Missing',
  previous_cycle: 'Prev Cycle',
};

const C_DRY = '#dcfce7';
const C_POST_PEAK = '#fef08a';
const C_PEAK = '#D6D3CF';
const C_FERTILE = '#16a34a';

function barColor(rank: number | null, phase: PhaseLabel): string {
  if (rank === null) return C_DRY;
  if (phase === 'p_plus_1' || phase === 'p_plus_2' || phase === 'p_plus_3') return C_POST_PEAK;
  if (rank >= 3) return C_PEAK;
  if (rank >= 1) return C_FERTILE;
  return C_DRY;
}

function phaseBg(phase: PhaseLabel): string {
  switch (phase) {
    case 'peak_confirmed': return '#E8E6E3';
    case 'p_plus_1': case 'p_plus_2': case 'p_plus_3': return '#fef9c3';
    case 'fertile_open': case 'fertile_unconfirmed_peak': return '#dcfce7';
    default: return '#ffffff';
  }
}

const MAX_RANK = 3;
const MAX_BAR_H = 90;

export function buildCyclePdfHtml(cycle: CycleSlice, includeIntercourse: boolean): string {
  const fertileStart = cycle.result.fertileStartIndex !== null
    ? `Day ${cycle.result.fertileStartIndex + 1}`
    : '--';
  const fertileEnd = cycle.result.fertileEndIndex !== null
    ? `Day ${cycle.result.fertileEndIndex + 1}`
    : '--';
  const peakDay = cycle.peakDay !== null ? `Day ${cycle.peakDay}` : '--';
  const luteal = cycle.lutealPhase !== null ? `${cycle.lutealPhase} days` : '--';

  const chartBars = cycle.result.mucusRanks
    .map((rank, i) => {
      const h = rank !== null ? Math.max((rank / MAX_RANK) * MAX_BAR_H, 4) : 0;
      const color = barColor(rank, cycle.result.phaseLabels[i]);
      const isPeak = cycle.result.peakIndex === i;
      const border = isPeak ? 'border:2px solid #4A4541;' : '';
      const marker = includeIntercourse && cycle.entries[i]?.intercourse ? '🌹' : '';
      return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:12px;">
        <span style="font-size:8px;margin-bottom:2px;">${marker}</span>
        <div style="width:100%;height:${h}px;background:${color};border-radius:3px;${border}"></div>
        <span style="font-size:7px;color:#A09A94;margin-top:2px;">${i + 1}</span>
      </div>`;
    })
    .join('');

  const intercourseHeader = includeIntercourse ? '<th style="padding:6px 8px;text-align:center;">I/C</th>' : '';

  const tableRows = cycle.entries
    .map((entry, i) => {
      const phase = cycle.result.phaseLabels[i];
      const bg = phaseBg(phase);
      const rank = cycle.result.mucusRanks[i];
      const freq = entry.frequency
        ? (entry.frequency === 'all_day' ? 'AD' : `x${entry.frequency}`)
        : '';
      const appearanceList = entry.appearances?.filter((a) => a !== 'none').join(', ') ?? '';
      const code = generateCreightonCode(entry).fullCode;
      const ic = includeIntercourse
        ? `<td style="padding:6px 8px;text-align:center;">${entry.intercourse ? '🌹' : ''}</td>`
        : '';
      return `<tr style="background:${bg};">
        <td style="padding:6px 8px;font-weight:600;">${i + 1}</td>
        <td style="padding:6px 8px;">${entry.date ?? ''}</td>
        <td style="padding:6px 8px;">${entry.bleeding && entry.bleeding !== 'none' ? entry.bleeding : ''}</td>
        <td style="padding:6px 8px;">${entry.sensation ?? ''}</td>
        <td style="padding:6px 8px;">${appearanceList}</td>
        <td style="padding:6px 8px;text-align:center;">${freq}</td>
        <td style="padding:6px 8px;text-align:center;">${rank ?? ''}</td>
        <td style="padding:6px 8px;">${code}</td>
        <td style="padding:6px 8px;">${PHASE_DISPLAY[phase] ?? phase}</td>
        ${ic}
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #3F3A36; }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
    .subtitle { color: #6F6A65; font-size: 13px; margin-bottom: 20px; }
    .stats { display: flex; gap: 12px; margin-bottom: 20px; }
    .stat { flex: 1; background: #F6F3EF; border: 1px solid #E7E2DE; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-value { font-size: 20px; font-weight: 600; }
    .stat-label { font-size: 10px; color: #6F6A65; margin-top: 4px; }
    .chart { display: flex; gap: 2px; align-items: flex-end; margin-bottom: 20px; padding: 8px; background: #F6F3EF; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #F5F3F1; padding: 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #E7E2DE; }
    td { border-bottom: 1px solid #F5F3F1; }
    .footer { margin-top: 20px; font-size: 10px; color: #A09A94; text-align: center; }
  </style>
</head>
<body>
  <h1>Cycle ${cycle.cycleNumber}</h1>
  <div class="subtitle">${cycle.startDate} – ${cycle.endDate} · ${cycle.length} days</div>

  <div class="stats">
    <div class="stat"><div class="stat-value">${cycle.length}d</div><div class="stat-label">Length</div></div>
    <div class="stat"><div class="stat-value">${peakDay}</div><div class="stat-label">Peak Day</div></div>
    <div class="stat"><div class="stat-value">${fertileStart}–${fertileEnd}</div><div class="stat-label">Fertile Window</div></div>
    <div class="stat"><div class="stat-value">${luteal}</div><div class="stat-label">Luteal Phase</div></div>
  </div>

  <h2 style="font-size:14px;margin-bottom:8px;">Daily Mucus Pattern</h2>
  <div class="chart">${chartBars}</div>

  <h2 style="font-size:14px;margin-bottom:8px;">Day-by-Day Observations</h2>
  <table>
    <thead>
      <tr>
        <th style="padding:6px 8px;">Day</th>
        <th style="padding:6px 8px;">Date</th>
        <th style="padding:6px 8px;">Bleeding</th>
        <th style="padding:6px 8px;">Sensation</th>
        <th style="padding:6px 8px;">Appearance</th>
        <th style="padding:6px 8px;text-align:center;">Freq</th>
        <th style="padding:6px 8px;text-align:center;">Rank</th>
        <th style="padding:6px 8px;">Code</th>
        <th style="padding:6px 8px;">Phase</th>
        ${intercourseHeader}
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="footer">Generated by Well Within · ${new Date().toLocaleDateString()}</div>
</body>
</html>`;
}
