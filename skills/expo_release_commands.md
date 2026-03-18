# Expo iOS Release Commands

This document defines the correct procedures for building and submitting the Well Within mobile app to Apple TestFlight using Expo and EAS.

It is intended to be referenced by engineering agents and developers during release preparation and deployment.

For the full process (make change in Cursor → test locally with Expo → push to TestFlight → get to App Store) and when each step is quick vs needs more from Apple, see **docs/RELEASE_PROCESS.md**.

Agents should follow this document when executing release tasks.

---

# 1. Release Workflow Overview

The standard iOS TestFlight workflow is:

1. Validate repository configuration
2. Verify Expo app configuration
3. Increment build number if necessary
4. Run an EAS iOS build
5. Submit build to App Store Connect
6. Confirm TestFlight processing
7. Enable internal testing

This workflow should always follow a **release readiness audit** before executing.

For this project, use the **production build profile only** for TestFlight.

**This project:** `eas.json` includes `ascAppId`, `ascApiKeyPath`, `ascApiKeyId`, and `ascApiKeyIssuerId`. With the App Store Connect API key (`.p8`) placed in `apps/mobile/credentials/`, submit runs **non-interactively** (no Apple ID login prompt). TestFlight build management: https://appstoreconnect.apple.com/apps/6760519448/testflight/ios

---

# 2. Required Environment Setup

Ensure the following tools are available:

node
npm or yarn
Expo CLI via `npx expo`
EAS CLI via `npx eas` (or global `eas-cli`)

Verify local commands:

npx expo --version
npx eas --version

If EAS CLI is not available:

npm install -g eas-cli


---

# 3. Login to Expo

Before running builds, confirm authentication:


npx eas login


Verify the correct Expo account is active.

---

# 4. Validate Project Configuration

Before building, verify the following files exist and are valid:


app.json or app.config.*
package.json
eas.json


Important fields to confirm:

### App name


expo.name


### App slug


expo.slug


### iOS bundle identifier


expo.ios.bundleIdentifier


Example:


com.wellwithin.app


### App icon


expo.icon


### Splash screen


expo.splash


---

# 5. Validate iOS Configuration

Check that iOS configuration is complete.

Required fields:


ios.bundleIdentifier
ios.buildNumber


Example:


"ios": {
"bundleIdentifier": "com.wellwithin.app",
"buildNumber": "1"
}


---

# 6. Build Number Management

Apple requires each uploaded build to have a new build number.

If using EAS auto-increment, verify:


eas.json


Example:


{
"build": {
"production": {
"ios": {
"autoIncrement": true
}
}
}
}


If not using auto-increment, manually update:


ios.buildNumber


in `app.json`.

---

# 7. Running an iOS Build

Use the production profile for TestFlight:
npx eas build --platform ios --profile production


This will:

• upload project to Expo build servers  
• compile the iOS binary  
• generate an `.ipa` file

Build time varies by queue and machine availability.

---

# 8. Submitting to TestFlight

After build completion, submit using the same profile intent.

npx eas submit --platform ios --profile production --latest --non-interactive

This uploads the latest build to App Store Connect. For scripted/CI runs, use `--latest --non-interactive` so no prompts appear.

Required values:


Apple ID
App Store Connect App ID
Bundle Identifier


Agents should verify the correct app is selected.

If this is the first submission path, verify App Store Connect metadata prerequisites:

- privacy details ("nutrition labels")
- export compliance / encryption answers
- support URL and privacy policy URL
- "What to Test" and tester contact for external beta

Important:
- Do not require `eas device:create` for this workflow.
- Device registration is only needed for direct internal/ad hoc device installs, which are out of scope unless explicitly requested.

---

# 9. App Store Connect Processing

After submission:

1. Apple processes the build
2. Build appears in App Store Connect
3. Build becomes available in TestFlight

Processing time varies and may take longer during peak periods.


---

# 10. Internal TestFlight Distribution

Internal testers can install builds immediately.

Steps:

1. Open App Store Connect
2. Navigate to TestFlight
3. Select the build
4. Add internal testers

Internal testing requires **no review from Apple**.

---

# 11. External TestFlight Distribution

External testers require Beta App Review.

Steps:

1. Create tester group
2. Add testers or public link
3. Submit build for Beta Review

Approval time varies and may take longer.


---

# 12. Verifying TestFlight Build

After processing, verify:

• app installs correctly  
• onboarding completes  
• charting works  
• navigation works  
• settings screen loads  
• no crashes occur

This mirrors Apple reviewer behavior.

---

# 13. Common Build Failures

Agents should check for the following issues:

### Missing bundle identifier


ios.bundleIdentifier missing


### Invalid icon

Icon must be:


1024x1024
no transparency


### Version conflicts

Build number must increase for every upload.

### Unused permissions

Remove permissions not used by the app.

---

# 14. Updating TestFlight Builds

To release an updated build:

1. commit code changes
2. run new build


npx eas build --platform ios --profile production


3. submit new build


npx eas submit --platform ios --profile production


4. testers update via TestFlight app

Each build expires after:


90 days


---

# 15. Release Safety Rules

Before uploading any build ensure:

• build succeeds in release mode  
• no debug code is active  
• no placeholder assets exist  
• privacy explanation exists  
• no medical claims appear in UI text  

The goal is a stable and compliant TestFlight build.

---

# 16. Recommended Release Sequence

For Well Within:

### Phase 1

Internal TestFlight release.

Focus on:

• stability
• charting flow
• rules engine accuracy

### Phase 2

External TestFlight.

Focus on:

• onboarding clarity
• UX improvements
• bug fixes

### Phase 3

Full App Store submission.

---

# 17. Agent Execution Rules

When executing builds, agents must:

1. audit repo readiness
2. confirm versioning
3. confirm privacy compliance
4. run `eas build --platform ios --profile production`
5. submit `eas submit --platform ios --profile production`
6. report results

Agents must not modify product UX unless required for compliance or build success.

---

# 18. Minimal Release Goal

The purpose of the TestFlight build is:


validate stability
collect early feedback
identify usability issues


The TestFlight release should prioritize **stability over feature completeness**.

Agents preparing builds must reference:
- skills/app_store_release_best_practices.md
- docs/TESTFLIGHT_READINESS_CHECKLIST.md
- skills/expo_release_commands.md
