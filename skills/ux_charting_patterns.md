# UX Patterns for Fertility Charting

Daily charting must be fast and frictionless.

Users must be able to log observations in under 15 seconds.

Preferred UX patterns:

Calendar-based entry
Single-page observation form
Minimal required inputs

Observation entry must support:

date selection
sensation
appearance
quantity
bleeding

The UI must clearly highlight:

fertile window
peak day
post-peak days

Calendar colors follow the Creighton sticker system:

Red = bleeding
Green = dry
Green + green dot = non-peak mucus (rank 1-2)
White + blue dot = peak-type mucus (rank 3)
White + blue dot + blue border = confirmed peak day
Yellow = post-peak (P+1 through P+3)
Black border = today
Rose emoji = intercourse

Indicator dots are based on mucus rank regardless of phase label.
All colors are centralized in apps/mobile/src/theme/colors.ts.

Multi-cycle views:

Cycle History screen shows aggregate stats, pattern insights, peak-aligned overlay, and cycle cards.
Cycle Detail screen shows per-cycle mucus chart, fertile timeline, and daily log.

Charts must be simple and readable.

Avoid complex graphs for MVP.
