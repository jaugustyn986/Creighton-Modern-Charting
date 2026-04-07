# App image and icon assets

This document describes where app images (icon, splash, in-app logo) live and how to update them.

## Single asset: `icon-1024.png`

Well Within uses **one image** for all of the following:

| Use | Location | Notes |
|-----|----------|--------|
| **App icon** | Home screen, App Store | 1024×1024 PNG; no transparency (store requirement). |
| **Splash screen** | Shown at launch | Same file; configured in `app.json` / `app.config.js` with `splash.image` and `splash.backgroundColor` (#F6F3EF). |
| **In-app logo** | Onboarding screen 1 (identity slide), Calendar header | Same file; cream background matches app theme so it blends. |

**Path:** `apps/mobile/assets/icon-1024.png`

**Design:** Stylized rose on a cream background (#F6F3EF) to match the app’s `BG_PAGE` / splash color. Opaque (no transparency) so it works as the store icon and renders consistently everywhere.

## How to update the image

1. Replace `apps/mobile/assets/icon-1024.png` with your new 1024×1024 PNG (rose on cream).
2. Reload the app to see changes in onboarding and Calendar. For the **home screen icon** to update, create a new dev build (e.g. `npx eas build --platform ios --profile development` from `apps/mobile`) or a new production build.

## Config references

- **App icon:** `app.json` → `expo.icon`, `app.config.js` → `expo.icon`
- **Splash:** `app.json` → `expo.splash`, `app.config.js` → `expo.splash` (image + `backgroundColor: '#F6F3EF'`)
- **In-app:** `OnboardingScreen.tsx` and `CalendarScreen.tsx` use `require('../../assets/icon-1024.png')`; the logo is rendered on the onboarding identity screen (screen 1) inside a centered rounded container with a soft shadow, and in the Calendar header.

## Other assets in `apps/mobile/assets/`

- **logo.png** — Optional; previously used as a transparent in-app logo. Kept for reference; the app currently uses only `icon-1024.png` for the logo.
- **logo-cream.png** — Optional; previously used as in-app logo on cream. No longer referenced; the app uses `icon-1024.png` everywhere.

## Onboarding screenshot assets

The onboarding flow (screens 2–7) uses real app UI crops as imagery. These live in `apps/mobile/assets/` and are referenced directly from `OnboardingScreen.tsx`.

| File | Screen | What it shows |
|------|--------|---------------|
| `onboarding-calendar-uncertainty.png` | 2 — Problem | Calendar, early cycle (Tracking, Day 7), moderate confidence — supports uncertainty messaging |
| `onboarding-status-banner.png` | 4 — Value | Calendar + StatusBanner showing Post-peak / Peak confirmed state — demonstrates the app's payoff |
| `onboarding-entry-modal.png` | 5 — Behavior | Daily entry modal with observation fields visible |
| `onboarding-history.png` | 6 — Depth | Cycle History tab — Cycle Summary stats, Your Patterns, Peak-Aligned Overlay |
| `onboarding-calendar-cta.png` | 7 — CTA | Empty calendar ("Your cycle will appear here") — welcoming, actionable state |

**To update an onboarding image:** Replace the corresponding PNG in `apps/mobile/assets/` with the new crop. Recommended: capture from iOS simulator at natural device resolution and crop to focus on the key UI area. No rebuild required — Metro hot-reloads image changes during development.
