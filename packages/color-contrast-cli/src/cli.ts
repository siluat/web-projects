#!/usr/bin/env node
import { checkContrast } from './index';
import type { ComplianceLevel, ContrastResult } from './types';

const USAGE = 'Usage: ccr <foreground> <background> [--json] [--level AA|AAA]';

function formatLevel(level: ComplianceLevel): string {
  return level === 'Fail' ? 'Fail \u2717' : `${level} \u2713`;
}

function formatHumanReadable(result: ContrastResult): string {
  const lines = [
    `Contrast ratio: ${result.ratio}:1`,
    `Normal text: ${formatLevel(result.normalText)}`,
    `Large text:  ${formatLevel(result.largeText)}`,
  ];
  return lines.join('\n');
}

function passesLevel(
  normalText: ComplianceLevel,
  level: 'AA' | 'AAA',
): boolean {
  if (level === 'AA') {
    return normalText === 'AA' || normalText === 'AAA';
  }
  return normalText === 'AAA';
}

function parseArgs(argv: string[]): {
  foreground: string;
  background: string;
  json: boolean;
  level: 'AA' | 'AAA' | null;
} {
  const args: string[] = [];
  let json = false;
  let level: 'AA' | 'AAA' | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--level') {
      i++;
      const value = argv[i];
      if (value !== 'AA' && value !== 'AAA') {
        throw new Error(
          `Invalid --level value: "${value ?? ''}". Use AA or AAA`,
        );
      }
      level = value;
    } else if (arg !== undefined) {
      args.push(arg);
    }
  }

  if (json && level !== null) {
    throw new Error('--json and --level cannot be used together');
  }

  const [foreground, background] = args;
  if (
    args.length !== 2 ||
    foreground === undefined ||
    background === undefined
  ) {
    throw new Error(USAGE);
  }

  return { foreground, background, json, level };
}

function main(): void {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    const result = checkContrast(parsed.foreground, parsed.background);

    if (parsed.level !== null) {
      process.exit(passesLevel(result.normalText, parsed.level) ? 0 : 1);
    }

    if (parsed.json) {
      process.stdout.write(`${JSON.stringify(result)}\n`);
    } else {
      process.stdout.write(`${formatHumanReadable(result)}\n`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${message}\n`);
    process.exit(2);
  }
}

main();
