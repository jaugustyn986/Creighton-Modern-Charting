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

Calendar Screen
Daily Entry Screen
Cycle Chart Screen

Navigation

Stack navigation is preferred for MVP.

State management

Local state is acceptable for MVP.

Avoid heavy frameworks such as Redux unless necessary.
