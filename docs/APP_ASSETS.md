# App image and icon assets

This document describes where app images (icon, splash, in-app logo) live and how to update them.

## Single asset: `icon-1024.png`

Well Within uses **one image** for all of the following:

| Use | Location | Notes |
|-----|----------|--------|
| **App icon** | Home screen, App Store | 1024×1024 PNG; no transparency (store requirement). |
| **Splash screen** | Shown at launch | Same file; configured in `app.json` / `app.config.js` with `splash.image` and `splash.backgroundColor` (#F6F3EF). |
| **In-app logo** | Onboarding slide 1, Calendar header | Same file; cream background matches app theme so it blends. |

**Path:** `apps/mobile/assets/icon-1024.png`

**Design:** Stylized rose on a cream background (#F6F3EF) to match the app’s `BG_PAGE` / splash color. Opaque (no transparency) so it works as the store icon and renders consistently everywhere.

## How to update the image

1. Replace `apps/mobile/assets/icon-1024.png` with your new 1024×1024 PNG (rose on cream).
2. Reload the app to see changes in onboarding and Calendar. For the **home screen icon** to update, create a new dev build (e.g. `npx eas build --platform ios --profile development` from `apps/mobile`) or a new production build.

## Config references

- **App icon:** `app.json` → `expo.icon`, `app.config.js` → `expo.icon`
- **Splash:** `app.json` → `expo.splash`, `app.config.js` → `expo.splash` (image + `backgroundColor: '#F6F3EF'`)
- **In-app:** `OnboardingScreen.tsx` and `CalendarScreen.tsx` use `require('../../assets/icon-1024.png')`; the logo is wrapped in a cream container (`BG_PAGE`) for consistency.

## Other assets in `apps/mobile/assets/`

- **logo.png** — Optional; previously used as a transparent in-app logo. Kept for reference; the app currently uses only `icon-1024.png` for the logo.
- **logo-cream.png** — Optional; previously used as in-app logo on cream. No longer referenced; the app uses `icon-1024.png` everywhere.
