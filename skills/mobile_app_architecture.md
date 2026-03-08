# Mobile App Architecture

The mobile application uses:

React Native
Expo
TypeScript

Architecture principles:

UI should remain thin.

All fertility logic must live in the rules engine.

Screens should only:

- display data
- collect user input
- trigger recalculation

Primary screens:

Calendar Screen — multi-cycle aware, uses useCycleHistory for per-cycle rendering
Daily Entry Screen — observation form with keyboard-avoiding notes
Cycle History Screen — summary stats, pattern insights, peak-aligned overlay, cycle cards
Cycle Detail Screen — per-cycle mucus chart, fertile timeline, daily log
Help Screen — charting guide, calendar color key, onboarding replay
Onboarding Screen — 4-slide first-launch flow

Key hooks:

useCycleData — single-cycle entries/result, save, delete, refresh
useCycleHistory — multi-cycle slices, summary stats, insights

Shared theme:

All colors live in apps/mobile/src/theme/colors.ts.
Components must import from this file — no hardcoded hex values.

Navigation

Stack navigation is preferred for MVP.
Routes: Calendar, DailyEntry, Help, CycleHistory, CycleDetail, Onboarding.

State management

Local state is acceptable for MVP.
AsyncStorage for persistence.

Avoid heavy frameworks such as Redux unless necessary.
