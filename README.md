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

## Rules engine source of truth
See [docs/RULES_ENGINE_SPEC.md](docs/RULES_ENGINE_SPEC.md).

## Notes
- Multiple observations per day are supported; daily rank is max observation rank.
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
