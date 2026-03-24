# Mockups and Text Wireframes

## Timeline card (mobile)
[ CD14 ] Green background (fertile)
Sensation: Wet
Appearance: Clear
Quantity: Medium
Banner: "High fertility signs"

Peak is only highlighted after P+3 confirmed.

## Daily Entry screen
- Modal: Cancel in header (top right, secondary). Sticky bottom primary action: "Save Entry". Scrollable form with bottom padding so content does not sit under the sticky button. Delete Entry (if editing) appears above the sticky footer.
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

![Sensation and appearance](images/understanding-your-chart-sensation-appearance.png)

![Example dry day](images/understanding-your-chart-example-dry.png)

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
| 1 | Welcome to Well Within | This app helps you track daily fertility observations and understand your fertile window while trying to conceive. |
| 2 | What to Observe | Each time you use the bathroom, note the sensation and any visible mucus on the tissue. These two observations are all you need. |
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
4. **Peak-Aligned Overlay** — Horizontal rows of colored cells (one row per **completed** cycle with confirmed peak), aligned at peak day (column **P**). Colors match the calendar grid (green=dry, red=bleeding, blue dot=peak, yellow=post-peak). Empty state: complete a cycle with a confirmed peak to see the overlay.
5. **Cycle Cards** — Scrollable list of cards (newest first). Each card shows: cycle number, start date, length, peak day, luteal phase, and status badge (Complete / In Progress / No Peak). Tapping a card navigates to Cycle Detail. *(Engine: `splitIntoCycles` merges a leading stretch of non–heavy/moderate days into the first period cycle so cards do not include a spurious 1-day “cycle” before real flow.)*

## Cycle Detail

**Cycle Detail screen** — shown after tapping a cycle card or overlay row.

Layout (top to bottom):

1. **Header** — "Cycle N" title + back arrow
2. **Stats Row** — Three cards: Length (days), Peak Day (cycle day), Fertile End (day number or "--")
3. **Daily Mucus Pattern** — Bar chart (adapted MucusChart). Bar colors match the calendar theme. Rose emoji (🌹) appears above bars for intercourse days. (In-app only; not included in exported PDF.)
4. **Fertile Window Timeline** — Vertical timeline with three milestones:
   - 🟢 Fertile Start (Day N)
   - 🔵 Peak Day (Day N)
   - 🟡 Fertile End / P+3 (Day N)
   - Total fertile days shown at bottom.
5. **Daily Log** — Scrollable list of every day. Each row: cycle-day circle (colored by phase), date, observation summary, phase badge, 🌹 if intercourse.

## Calendar Screen (with Tab Toggle)

Top bar: "Well Within" title (left), "+ Entry" button + gear icon (right).

Below top bar: **Segmented pill toggle** with two tabs:
- **Calendar** (active: green fill, white text; calendar icon)
- **Cycle History** (inactive: white fill, gray text; clock icon)

When "Calendar" is active: StatusBanner + CalendarGrid + TodayEntryCard + Help link.
When "Cycle History" is active: CycleSummaryPanel + PatternInsights + PeakAlignedOverlay + CycleCards.

## Cycle Detail (with Export)

Custom header: back arrow (left), "Cycle N" title (center, bold), "Export" button (right, blue pill).

Export taps opens a modal: "Include intercourse markers?" with Yes / No / Cancel options. Generates PDF (cycle stats + day-by-day observation table; Daily Mucus Pattern chart is in-app only) and opens iOS share sheet.

## Settings

Layout (top to bottom):

1. **Privacy card** — "How your data works" heading:
   - Your chart data stays on this device unless you choose to back it up by signing in. If you enable backup, your data is securely sent and stored in the cloud to help restore it on a new device.
   - The app uses your observations to calculate cycle patterns
   - No third-party ad tracking is used
   - You can clear or export your data at any time
2. **Data Management card**:
   - "Export Data" row — exports JSON via share sheet
   - "Clear All Data" row (red text, pink background) — opens confirmation modal
3. **Clear All Data modal** — "Are you sure? This cannot be undone." with Cancel (outlined) + Confirm (red filled) buttons
4. **App Version** footer — "App Version 0.1.0"

## App Overview

![Full App Overview](images/app-overview.png)
