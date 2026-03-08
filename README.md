# modern-creighton

![CI](https://github.com/OWNER/modern-creighton/actions/workflows/ci.yml/badge.svg)

Mission: Build a privacy-first, deterministic Creighton TTC app.

## Setup
```bash
npm install
```

## Run tests
```bash
npm test
npm run test:coverage
```

## Run lint/typecheck
```bash
npm run lint
npm run typecheck
```

## Run CLI demo
```bash
npm run build --workspace core-rules-engine
node ./core/rulesEngine/dist/bin/cli.js --fixture core/rulesEngine/fixtures/simple-peak.json
```

## Run mobile demo (Expo)
```bash
npm run start:mobile
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/prd.md](docs/prd.md) | Product Requirements Document — features, specs, implementation log |
| [docs/RULES_ENGINE_SPEC.md](docs/RULES_ENGINE_SPEC.md) | Rules engine source of truth — ranking, peak detection, multi-cycle layer |
| [docs/CREIGHTON.md](docs/CREIGHTON.md) | Creighton Method reference — recording codes, sticker colors, compliance |
| [docs/mockups.md](docs/mockups.md) | Text wireframes and screenshot references |

## App screens

- **Calendar** — monthly grid with Creighton-aligned colors (red=bleeding, green=dry, blue dot=peak-type, yellow=post-peak). Multi-cycle aware.
- **Daily Entry** — observation form (sensation, appearance, quantity, bleeding, intercourse, notes)
- **Cycle History** — summary stats, pattern insights, peak-aligned overlay, cycle cards
- **Cycle Detail** — per-cycle mucus chart, fertile timeline, daily log
- **Help** — charting guide, calendar color key, onboarding replay
- **Onboarding** — 4-slide first-launch flow

## Notes
- Multiple observations per day are supported; daily rank is max observation rank.
- Multi-cycle engine (`core/rulesEngine/src/multiCycle.ts`) splits entries into individual cycles and computes aggregate stats/insights.
- All UI colors are centralized in `apps/mobile/src/theme/colors.ts`.
- Intercourse is marked with a rose emoji (🌹) across the app.
- RevenueCat and Supabase integration are scaffolded as placeholders only.
- TODO: Manual override for trained users.


## Troubleshooting
- If Bash shows `syntax error near unexpected token '('`, do **not** paste shell and PowerShell variants on one line. Use one command only:
  - Git Bash: `npm run clean`
  - PowerShell: `Remove-Item -Recurse -Force node_modules,package-lock.json`
- If `npm install` fails part-way and later commands report `Cannot find module .../jest|eslint|typescript`, rerun from a clean state:
  1. `npm run clean`
  2. `npm install`
  3. `npm run verify:core`
- If you still see `src/fertileWindow.ts(...): TS2531`, ensure your branch includes the null-safe implementation in `core/rulesEngine/src/fertileWindow.ts` and pull latest before reinstalling.
