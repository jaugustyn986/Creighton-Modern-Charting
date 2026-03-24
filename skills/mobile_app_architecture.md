# Mobile App Architecture

The mobile application uses:

React Native
Expo
TypeScript

Architecture principles:

UI should remain thin.

All fertility logic must live in the rules engine (`core-rules-engine` workspace package). Import in app code with `from 'core-rules-engine'`.

Screens should only:

- display data
- collect user input
- trigger recalculation

Primary screens:

Calendar Screen — multi-cycle aware, uses useCycleHistory for per-cycle rendering. Includes SegmentedToggle to switch between Calendar and Cycle History tabs inline. PeakAlignedOverlay lists **completed** cycles with confirmed peak only, peak-aligned.
Daily Entry Screen — observation form with keyboard-avoiding notes
Cycle Detail Screen — per-cycle mucus chart, fertile timeline, daily log. Custom header with Export button for PDF generation.
Settings Screen — privacy info, JSON export, clear all data, app version
Help Screen — charting guide, visual calendar color key with actual swatches, onboarding replay
Onboarding Screen — 4-slide first-launch flow

Key hooks:

useCycleData — single-cycle entries/result, save, delete, refresh
useCycleHistory — multi-cycle slices, summary stats, insights

Shared theme:

All colors live in apps/mobile/src/theme/colors.ts.
Components must import from this file — no hardcoded hex values.

Navigation

Stack navigation is preferred for MVP.
Routes: Calendar, DailyEntry, Help, CycleHistory, CycleDetail, Settings, Onboarding.

State management

Local state is acceptable for MVP.
Persistence: `apps/mobile/src/services/storageV2.ts` (versioned envelope + migration from legacy keys). Do not reintroduce a parallel storage layer.

Avoid heavy frameworks such as Redux unless necessary.

Additional dependencies

expo-print — HTML-to-PDF generation for cycle export (stats + day-by-day table only; Daily Mucus Pattern chart is in-app only, not in PDF)
expo-sharing — native share sheet for PDF and JSON export
expo-constants — read app version from app.json
expo-file-system — write temp files for JSON export
