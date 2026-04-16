# TestFlight Readiness Checklist

This document tracks release readiness for Well Within iOS TestFlight distribution.

For the full path **make change → test locally (Expo) → TestFlight → App Store** and when each step is quick vs takes longer, see [RELEASE_PROCESS.md](RELEASE_PROCESS.md).

Agents must **audit the repository before modifying code** and update this file with findings.

Use these requirement tags:
- `[INT-BLOCKER]` required for internal TestFlight distribution
- `[EXT-REQ]` required for external TestFlight distribution
- `[STORE-REQ]` required for App Store submission
- `[POLISH]` not required for initial internal TestFlight release

---

# 1. Build Readiness

## Build Configuration

- [ ] `[INT-BLOCKER]` iOS build succeeds in release mode
- [x] `[INT-BLOCKER]` Expo / EAS build configuration verified
- [x] `[INT-BLOCKER]` `eas.json` includes `production` profile with auto-increment
- [x] `[INT-BLOCKER]` bundle identifier is configured
- [x] `[INT-BLOCKER]` version number exists
- [x] `[INT-BLOCKER]` build number strategy is configured (manual or auto-increment)

Expected baseline:

Version: 1.0.0
Build: 1

## Project Configuration

- [x] `[INT-BLOCKER]` `app.config.js` exists (single config source; app.json removed)
- [x] `[INT-BLOCKER]` app name is correct
- [x] `[INT-BLOCKER]` app slug is correct
- [x] `[INT-BLOCKER]` iOS bundle identifier is defined
- [x] `[INT-BLOCKER]` icon asset path is valid
- [x] `[INT-BLOCKER]` splash asset path is valid

---

# 2. Required Assets

## App Icon

- [x] `[INT-BLOCKER]` icon asset exists and resolves from Expo config (`apps/mobile/assets/icon-1024.png`)
- [x] `[STORE-REQ]` 1024x1024 marketing icon exists
- [x] `[STORE-REQ]` marketing icon has no transparency (rose on cream background)
- [x] `[POLISH]` icon visually matches final branding (rose on cream; see `docs/APP_ASSETS.md`)

## Splash Screen

- [x] `[INT-BLOCKER]` splash screen configured (uses same `icon-1024.png`; see `docs/APP_ASSETS.md`)
- [x] `[INT-BLOCKER]` splash image exists
- [x] `[STORE-REQ]` no placeholder graphics

## Screenshots (App Store)

These are not required for internal TestFlight, but should be prepared early.

- [ ] `[STORE-REQ]` iPhone 6.7" screenshots
- [ ] `[STORE-REQ]` iPhone 6.5" screenshots
- [ ] `[POLISH]` screenshots demonstrate onboarding, charting, history, and daily entry

---

# 3. Permissions Audit

The app must not request permissions it does not use.

Audit `Info.plist`, `app.json` / `app.config.*`, and Expo plugins:

- [x] `[INT-BLOCKER]` notifications permission present only if used
- [x] `[INT-BLOCKER]` camera permission present only if used
- [x] `[INT-BLOCKER]` photos permission present only if used
- [x] `[INT-BLOCKER]` location permission present only if used
- [x] `[INT-BLOCKER]` HealthKit permission present only if used

---

# 4. Privacy Requirements

Because the app handles reproductive health data, privacy transparency is required.

## Privacy Policy and Labels

- [x] `[INT-BLOCKER]` in-app privacy explanation exists and is accurate
- [ ] `[EXT-REQ]` App Store Connect privacy details are configured accurately
- [ ] `[STORE-REQ]` publicly accessible privacy policy URL exists
- [ ] `[STORE-REQ]` privacy policy URL is added to App Store metadata

Example in-app wording:

> Well Within stores your charting data locally on your device.  
> We do not sell or share personal health data.

---

# 5. Data Control

Users must be able to delete locally stored data.

Recommended location: `Settings -> Clear All Data`

- [x] `[INT-BLOCKER]` clear data option exists
- [x] `[INT-BLOCKER]` clear data confirmation prompt exists
- [x] `[INT-BLOCKER]` clearing data resets stored app state

---

# 6. App Stability

Reviewer smoke flow:
1. install app
2. complete onboarding
3. log a daily observation
4. navigate primary screens
5. open settings

- [ ] `[INT-BLOCKER]` onboarding works
- [ ] `[INT-BLOCKER]` daily entry saves observations
- [ ] `[INT-BLOCKER]` calendar renders correctly
- [ ] `[INT-BLOCKER]` cycle history loads
- [ ] `[INT-BLOCKER]` settings screen loads
- [ ] `[INT-BLOCKER]` no crashes in smoke flow

Audit note (2026-03-12): Code paths for the smoke flow were audited. Onboarding, Calendar (with Daily Entry modal), Cycle History, Cycle Detail, and Settings are wired in `AppNavigator`; loading and empty states are handled. Manual run still required to confirm no crashes.

---

# 7. Health Claim Compliance

The app is a tracking and educational tool, not a medical device.

Review onboarding copy, App Store text, settings text, and help text.

Verify the app does **not** claim:
- diagnosis
- treatment
- prediction of ovulation
- guaranteed conception timing

Acceptable framing:
- track observations
- understand your cycle
- fertility awareness education

- [ ] `[INT-BLOCKER]` no disallowed health claims in app UI copy
- [ ] `[STORE-REQ]` no disallowed health claims in App Store metadata

Audit note (2026-03-12): User-facing copy was audited (OnboardingScreen, StatusBanner, EntryForm, HelpScreen, Settings). No diagnosis, treatment, or guaranteed conception claims found. Phrases such as "Ovulation likely occurred within the last 1–2 days" are retrospective (post–peak day), not prediction of future ovulation; "your chances are highest" in Help is educational. Manual review of App Store metadata still required when submitting.

---

# 8. Support and Contact

Apple expects users to have a support path.

Recommended location: `Settings -> Support`

- [ ] `[EXT-REQ]` support email exists
- [ ] `[EXT-REQ]` support screen or support link exists
- [ ] `[STORE-REQ]` support URL exists for App Store metadata

---

# 9. TestFlight Distribution

## Internal Testing

- [x] `[INT-BLOCKER]` build uploaded to App Store Connect
- [ ] `[INT-BLOCKER]` build processed by Apple (typically 5–10 min; check email)
- [ ] `[INT-BLOCKER]` internal testers added
- [ ] `[INT-BLOCKER]` internal testers can install build

TestFlight build management: https://appstoreconnect.apple.com/apps/6760519448/testflight/ios

Notes:
- This release path uses TestFlight/App Store Connect distribution.
- Submit is non-interactive when `eas.json` has `ascAppId`, `ascApiKeyPath`, `ascApiKeyId`, and `ascApiKeyIssuerId` set and the `.p8` key is in `apps/mobile/credentials/`.
- Do not require `eas device:create` unless direct internal device installs are explicitly requested later.

## External Testing (optional)

- [ ] `[EXT-REQ]` Beta App Review approved
- [ ] `[EXT-REQ]` external tester group created
- [ ] `[EXT-REQ]` invite link or tester emails configured
- [ ] `[EXT-REQ]` TestFlight "What to Test" and contact metadata complete

---

# 10. Release Blockers (Populate During Audit)

- First production TestFlight upload succeeded; build is processed by Apple. Record build number/ID in App Store Connect when processing completes if needed for tracking.
- BLOCKER: publicly accessible privacy policy URL is not yet configured in release metadata (required for external TestFlight / App Store).
- BLOCKER: App Store Connect privacy details/export compliance answers are not yet recorded for this app.

---

# 11. Non-UX Changes Required (Populate During Audit)

- First EAS build and submit to TestFlight completed successfully. For future releases: **`npm run mobile:release:testflight`** (preflight + build + submit), or stepwise `mobile:build:ios:testflight` then `mobile:submit:ios:production` (non-interactive when `.p8` is in `apps/mobile/credentials/` and `eas.json` has `ascAppId` + API key fields).
- Configure privacy policy URL and support URL values for App Store Connect metadata (before external TestFlight or App Store).
- Complete App Store Connect privacy details and export compliance questionnaire.
- Run **`npm run mobile:preflight:release`** before building (fast `expo config` check). Optionally run **`npm run mobile:preflight:release:with-doctor`**; treat **expo-doctor** failures from flaky Expo API or Metro hints as **advisory** unless they indicate a real misconfiguration.

---

# 12. UX Changes Required (Populate During Audit)

- Add a support contact surface in-app (`Settings -> Support`) before external TestFlight/App Store submission.

---

# 13. Optional Improvements (Not required for internal TestFlight)

- add local diagnostics export for easier bug reports
- improve onboarding illustrations
- add chart export improvements

---

# 14. Current Release Status (Update Every Audit)

Build Status: EAS build **uploaded**; **submit** was started with `--id` for this build — **confirm** on the [submission details](https://expo.dev/accounts/jaugustyn986/projects/modern-creighton/submissions/6a7b4250-d68c-4bb9-9db3-e91b54582af8) page that status is **Finished** (then check TestFlight for processing).  
Version: **0.2.0** · iOS build number: **14** (remote auto-increment)  
EAS Build ID: `4ed6b654-a1c5-49e1-93da-9bdda243d465` — [Expo build](https://expo.dev/accounts/jaugustyn986/projects/modern-creighton/builds/4ed6b654-a1c5-49e1-93da-9bdda243d465)  
EAS Submission ID: `6a7b4250-d68c-4bb9-9db3-e91b54582af8` — [Submission details](https://expo.dev/accounts/jaugustyn986/projects/modern-creighton/submissions/6a7b4250-d68c-4bb9-9db3-e91b54582af8)  
TestFlight: After Apple processing (often 5–15 min), build **14** should appear in [App Store Connect → TestFlight](https://appstoreconnect.apple.com/apps/6760519448/testflight/ios).  
Internal Testing: Add or confirm internal testers when the build shows as **Ready to Test**.

TestFlight: https://appstoreconnect.apple.com/apps/6760519448/testflight/ios

Last Audit Date: 2026-04-16  
Audited By: Cursor Agent

Release notes (this push): magic-link auth callback hardening across query/fragment/code/token_hash callback formats; deep-link + Supabase setup docs clarified for dev/TestFlight/production redirect URLs.

Release notes (next push — magic-link session landing): switched Supabase client session storage from the `expo-sqlite/localStorage` shim to `AsyncStorage` (Supabase's official React Native recommendation) so magic-link sessions persist reliably across app relaunches. Moved deep-link URL handling into `AuthProvider` (fixes a race where the callback fired before `onAuthStateChange` was subscribed). Surfaced any auth-callback failure as a calm banner on the sign-in screen instead of failing silently. Diagnostics before this change: Supabase auth logs confirm magic-link verify returns 303 and server-side `login (implicit)` succeeds — the gap was entirely in app-side session application/persistence.

Commands used (from `apps/mobile`): `npx eas build --platform ios --profile production --non-interactive --no-wait`, then `npx eas submit --platform ios --profile production --non-interactive --id <build-id>`. Preflight: `npm run mobile:preflight:release` hit **expo-doctor** failures (Expo API timeout + Metro warnings); **`npx expo config --type public`** was used as a successful config gate before building.

---

# 15. Release Decision

Before building for TestFlight:

- [ ] no `[INT-BLOCKER]` items remain open
- [ ] iOS build succeeds with intended profile
- [ ] privacy and claims checks pass
- [ ] reviewer smoke flow passes without crashes
