# Mockups and Text Wireframes

## Timeline card (mobile)
[ CD14 ] Green background (fertile)
Sensation: Wet
Appearance: Clear
Quantity: Medium
Banner: "High fertility signs"

Peak is only highlighted after P+3 confirmed.

## Daily Entry screen
- Bleeding: dropdown (heavy/moderate/light/spotting/brown/none)
- Sensation: radio (dry/damp/wet/slippery)
- Appearance: radio (none/cloudy/clear/stretchy)
- Quantity: dropdown (none/low/medium/high)
- Intercourse: toggle (yes/no)
- Notes: text
- Save validates ESQ combos (e.g., no slippery + dry mismatch)

## Understanding Your Chart

Place screenshot images in `docs/images/` with the filenames below so they render here and live in version control.

![Understanding Your Chart](images/understanding-your-chart-overview.png)

![Mucus Types Overview](images/understanding-your-chart-mucus-types.png)

![Dry Type 0 Details](images/understanding-your-chart-type-0-dry.png)

![Peak Day Explanation](images/understanding-your-chart-peak-day.png)

![Trying to Conceive Guidance](images/understanding-your-chart-trying-to-conceive.png)

![Calendar Color Guide](images/understanding-your-chart-calendar-colors.png)

![Status Messages](images/understanding-your-chart-status-messages.png)

## Calendar and New Entry (Calendar View)

![Calendar vs Timeline Toggle](images/calendar-timeline-toggle.png)

![New Entry Modal - Step 1](images/calendar-new-entry-step-1.png)

![New Entry Modal - Step 2](images/calendar-new-entry-step-2.png)

![New Entry Modal - Step 3](images/calendar-new-entry-step-3.png)

## Onboarding (first launch)

Place screenshots in `docs/images/` with the filenames below to match the in-app onboarding slides.

| Slide | Title | Body |
|-------|-------|------|
| 1 | Welcome to Holistic Cycle | This app helps you track daily fertility observations and understand your fertile window while trying to conceive. |
| 2 | What to Observe | Each time you use the bathroom, note the sensation at the vulva and any visible mucus on the tissue. These two observations are all you need. |
| 3 | When to Observe | Check before and after toileting throughout the day. Make a final check at bedtime. At the end of the day, record the most fertile sign you observed — not just the most recent. |
| 4 | Start Charting | Your cycle starts on the first day of bleeding. Tap the + Entry button to log your first observation. Let's begin! |

![Onboarding slide 1](images/onboarding-slide-1.png)
![Onboarding slide 2](images/onboarding-slide-2.png)
![Onboarding slide 3](images/onboarding-slide-3.png)
![Onboarding slide 4](images/onboarding-slide-4.png)

## Cycle History

**Cycle History screen** — accessible from the "View Cycle History" link on the Calendar screen.

Layout (top to bottom):

1. **Header** — "Cycle History" title + back arrow
2. **Cycle Summary Panel** — 2×2 grid of stat cards:
   - Cycles Tracked | Avg Length (days)
   - Avg Peak Day | Avg Luteal Phase (days)
3. **Pattern Insights** — Bullet list of computed insights (e.g., "Peak day has ranged from day 12–16"). Empty state: "Track at least 2 complete cycles to see pattern insights."
4. **Peak-Aligned Overlay** — Horizontal rows of colored cells (one row per cycle), aligned at peak day (column 0). Colors match the calendar grid (green=dry, red=bleeding, blue dot=peak, yellow=post-peak). Empty state: "Complete a cycle with a confirmed peak to see the overlay."
5. **Cycle Cards** — Scrollable list of cards (newest first). Each card shows: cycle number, start date, length, peak day, luteal phase, and status badge (Complete / In Progress / No Peak). Tapping a card navigates to Cycle Detail.

## Cycle Detail

**Cycle Detail screen** — shown after tapping a cycle card or overlay row.

Layout (top to bottom):

1. **Header** — "Cycle N" title + back arrow
2. **Stats Row** — Three cards: Length (days), Peak Day (cycle day), Fertile End (day number or "--")
3. **Daily Mucus Pattern** — Bar chart (adapted MucusChart). Bar colors match the calendar theme. Rose emoji (🌹) appears above bars for intercourse days.
4. **Fertile Window Timeline** — Vertical timeline with three milestones:
   - 🟢 Fertile Start (Day N)
   - 🔵 Peak Day (Day N)
   - 🟡 Fertile End / P+3 (Day N)
   - Total fertile days shown at bottom.
5. **Daily Log** — Scrollable list of every day. Each row: cycle-day circle (colored by phase), date, observation summary, phase badge, 🌹 if intercourse.

## App Overview

![Full App Overview](images/app-overview.png)
