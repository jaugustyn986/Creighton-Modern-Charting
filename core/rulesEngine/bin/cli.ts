#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { recalculateCycle } from '../src/recalc';
import { DailyEntry, PhaseLabel } from '../src/types';

interface FixturePayload {
  entries: Array<DailyEntry | null>;
  expected?: {
    peakIndex: number | null;
    fertileStartIndex: number | null;
    fertileEndIndex: number | null;
    phaseLabels: PhaseLabel[];
  };
}

function readFlag(argv: string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag);
  if (idx === -1) return undefined;
  return argv[idx + 1];
}

function main(): void {
  try {
    const fixturePath = readFlag(process.argv, '--fixture');
    if (!fixturePath) {
      process.stderr.write('Usage: node ./dist/bin/cli.js --fixture <path> [--verify]\n');
      process.exit(1);
    }

    const verify = process.argv.includes('--verify');
    const absolute = path.resolve(process.cwd(), fixturePath);
    const payload: FixturePayload = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    const result = recalculateCycle(payload.entries);

    const output = {
      peakIndex: result.peakIndex,
      fertileStartIndex: result.fertileStartIndex,
      fertileEndIndex: result.fertileEndIndex,
      phaseLabels: result.phaseLabels,
      mucusRanks: result.mucusRanks,
    };

    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

    if (verify) {
      if (!payload.expected) {
        process.stderr.write(`SKIP: ${fixturePath} has no "expected" block\n`);
        return;
      }

      const mismatches: string[] = [];
      const exp = payload.expected;

      if (result.peakIndex !== exp.peakIndex)
        mismatches.push(`peakIndex: expected ${exp.peakIndex}, got ${result.peakIndex}`);
      if (result.fertileStartIndex !== exp.fertileStartIndex)
        mismatches.push(`fertileStartIndex: expected ${exp.fertileStartIndex}, got ${result.fertileStartIndex}`);
      if (result.fertileEndIndex !== exp.fertileEndIndex)
        mismatches.push(`fertileEndIndex: expected ${exp.fertileEndIndex}, got ${result.fertileEndIndex}`);
      if (JSON.stringify(result.phaseLabels) !== JSON.stringify(exp.phaseLabels))
        mismatches.push(`phaseLabels: expected ${JSON.stringify(exp.phaseLabels)}, got ${JSON.stringify(result.phaseLabels)}`);

      if (mismatches.length > 0) {
        process.stderr.write(`FAIL: ${fixturePath}\n`);
        mismatches.forEach((m) => process.stderr.write(`  ${m}\n`));
        process.exit(1);
      } else {
        process.stderr.write(`PASS: ${fixturePath}\n`);
      }
    }
  } catch (err) {
    process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}

main();
