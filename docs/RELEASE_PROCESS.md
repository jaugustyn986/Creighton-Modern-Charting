# Release Process: Cursor → Local Test → TestFlight → App Store

This document describes the end-to-end process for changing the app, testing it, shipping to TestFlight, and eventually releasing to the App Store. Use it to understand what’s quick and what needs extra steps or time.

**Manual, on-demand only.** None of these steps run automatically. Making a change locally does **not** trigger a build or push to TestFlight. You (or an agent, when you ask) run each step when you decide to — e.g. “test locally,” “push to TestFlight,” “submit for App Review.” Treat this as the rules to follow and reference when you’re ready to do a step, not an automatic pipeline.

---

## 1. Make change in Cursor

- Edit code in the repo (e.g. in `apps/mobile/` or `core/rulesEngine/`).
- Run tests and lint as usual: `npm test`, `npm run lint`, `npm run typecheck`.
- No special process here; standard development.

---

## 2. Test locally with Expo

**Goal:** See your changes on a device or simulator before building for TestFlight.

| Step | Command / action |
|------|-------------------|
| Start dev server | `npm run start:mobile` |
| Run on device | On Windows: use a physical iPhone with **Expo Go** (or a dev build). iOS Simulator is macOS-only. |
| Iterate | Save code; app reloads. No need to rebuild for most UI/logic changes. |

**When to use:** After any change you want to verify before pushing to TestFlight. Fast feedback loop (seconds to reload).

**Docs:** README “Run mobile demo (Expo)” and “iOS TestFlight workflow” step 1.

---

## 3. Push to TestFlight

**Goal:** Get a build to internal (or external) testers via App Store Connect.

| Step | Command / action | Time / notes |
|------|-------------------|--------------|
| Preflight (optional but recommended) | `npm run mobile:preflight:release` | 1–2 min; catches config issues. |
| Build | `npm run mobile:build:ios:testflight` | **10–25 min** (runs on EAS; you can leave it). Uses `--non-interactive`. |
| Submit | `npm run mobile:submit:ios:production` | **1–3 min**; uses `--latest --non-interactive`. Requires `.p8` in `apps/mobile/credentials/` and `eas.json` submit config. |
| Apple processing | — | **5–10 min**; Apple emails when the build is ready. |
| Add testers | [App Store Connect → TestFlight](https://appstoreconnect.apple.com/apps/6760519448/testflight/ios) | Add internal testers; they install via TestFlight app. |

**Quick vs not:**

- **Quick / simple:** Code-only or config-only change (no new permissions, no store metadata changes). Run build → submit → wait for processing → add testers. No extra Apple steps.
- **Check first:** If you changed permissions, privacy wording, or health-related copy, skim `docs/TESTFLIGHT_READINESS_CHECKLIST.md` (especially §3 Permissions, §4 Privacy, §7 Health claims) before building.
- **First time or big change:** Do a quick manual smoke test (onboarding → daily entry → calendar → settings) and run preflight so the first TestFlight build of a release is smooth.

**Docs:** README “iOS TestFlight workflow”; `skills/expo_release_commands.md`; `docs/TESTFLIGHT_READINESS_CHECKLIST.md`.

---

## 4. Get to production (App Store)

**Goal:** Ship the app to the public App Store.

**What’s different from TestFlight:**

- **Metadata and compliance:** App Store listing needs a **public privacy policy URL**, **support URL**, **screenshots** (per device size), and **App Store Connect privacy details / export compliance** filled out. See checklist §2 (screenshots), §4 (privacy), §8 (support), §10–11.
- **Review:** You submit the build for **App Review**. Apple reviews the app and metadata (often **24–48 hours**, sometimes longer). No separate “approval” step for TestFlight internal testing; external TestFlight (Beta App Review) is one optional step before full store release.
- **Version / build:** Use a **new version** (e.g. 1.0.0 → 1.0.1) or at least a new build number for each store submission.

**Quick vs takes longer:**

- **Quick / simple:** You’ve already done TestFlight, metadata is complete (privacy policy URL, support URL, screenshots, privacy labels), and you’re not changing anything that triggers extra review. Submit for review → wait 1–2 days.
- **Takes longer / needs something from Apple or you:**
  - **First App Store release:** Need all metadata (privacy policy, support, screenshots, descriptions, keywords). Plan time to prepare and possibly fix review feedback.
  - **New permissions or sensitive behavior:** May need justification or longer review.
  - **Health/medical claims:** Must match guidelines (no prediction, diagnosis, treatment claims). See checklist §7 and `skills/app_store_release_best_practices.md`.
  - **Rejection:** If Apple rejects, they send reasons; you fix and resubmit. Each resubmit is a new review cycle (again ~24–48 hr typically).

**Docs:** `docs/TESTFLIGHT_READINESS_CHECKLIST.md` (§10–15, §2 screenshots, §4 privacy, §8 support); `skills/app_store_release_best_practices.md`.

---

## Summary table

| Stage | Typical time | Blockers / “takes longer” |
|-------|----------------|----------------------------|
| **1. Change in Cursor** | Minutes | — |
| **2. Test locally (Expo)** | Seconds to reload | Need device or simulator (Windows: physical iPhone + Expo Go). |
| **3. TestFlight** | Build 10–25 min + submit ~2 min + Apple 5–10 min | First time: preflight + smoke test. Permissions/privacy/health copy: check checklist. |
| **4. App Store** | Review ~24–48 hr after submit | Privacy policy URL, support URL, screenshots, privacy labels. Rejections → fix and resubmit. |

---

## Reference

| Doc | Use when |
|-----|----------|
| [README.md](../README.md) | Setup, local Expo, TestFlight commands. |
| [docs/TESTFLIGHT_READINESS_CHECKLIST.md](TESTFLIGHT_READINESS_CHECKLIST.md) | Auditing before TestFlight/App Store; what’s done vs blocked. |
| [skills/expo_release_commands.md](../skills/expo_release_commands.md) | Exact EAS build/submit steps and this project’s config. |
| [skills/app_store_release_best_practices.md](../skills/app_store_release_best_practices.md) | Apple’s expectations; metadata, privacy, health claims. |
