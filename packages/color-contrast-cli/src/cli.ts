#!/usr/bin/env node
import { checkContrast } from './index';
import type { ComplianceLevel, ContrastResult } from './types';

declare const __VERSION__: string | undefined;

const VERSION = typeof __VERSION__ === 'string' ? __VERSION__ : '(development)';

type ParseResult =
  | { kind: 'help' }
  | { kind: 'version' }
  | {
      kind: 'run';
      foreground: string;
      background: string;
      json: boolean;
      level: 'AA' | 'AAA' | null;
    };

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

function buildHelpText(): string {
  const lines = [
    `@siluat/color-contrast-cli v${VERSION}`,
    '',
    'Usage: ccr <foreground> <background> [options]',
    '',
    'Options:',
    '  --json               Output result as JSON',
    '  --level AA|AAA       Exit 0 if contrast passes the level, 1 if not',
    '  --help               Show this help message',
    '  --version            Show version number',
    '',
    'Supported color formats:',
    '  HEX           #rgb, #rrggbb, #rgba, #rrggbbaa',
    '  Named colors  red, navy, rebeccapurple, ...',
    '  RGB           rgb(255 0 0), rgba(255, 0, 0, 0.5)',
    '  HSL           hsl(120 100% 50%), hsla(120, 100%, 50%, 0.5)',
    '  HWB           hwb(0 0% 0%)',
    '  LAB           lab(50% 40 59.5)',
    '  LCH           lch(52.2% 72.2 50)',
    '  OKLAB         oklab(0.6 0.1 0.1)',
    '  OKLCH         oklch(60% 0.15 50)',
    '',
    'Examples:',
    "  ccr '#333' '#fff'",
    '  ccr black white --json',
    "  ccr 'rgb(0,0,0)' 'hsl(0 0% 100%)' --level AA",
    '',
  ];
  return lines.join('\n');
}

function parseArgs(argv: string[]): ParseResult {
  const positional: string[] = [];
  let json = false;
  let hasLevel = false;
  let levelValue: string | undefined;
  let help = false;
  let version = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--level') {
      hasLevel = true;
      i++;
      levelValue = argv[i];
    } else if (arg === '--help') {
      help = true;
    } else if (arg === '--version') {
      version = true;
    } else if (arg !== undefined) {
      positional.push(arg);
    }
  }

  if (help) {
    return { kind: 'help' };
  }

  if (version) {
    return { kind: 'version' };
  }

  let level: 'AA' | 'AAA' | null = null;
  if (hasLevel) {
    if (levelValue !== 'AA' && levelValue !== 'AAA') {
      throw new Error(
        `Invalid --level value: "${levelValue ?? ''}". Use AA or AAA`,
      );
    }
    level = levelValue;
  }

  if (json && level !== null) {
    throw new Error('--json and --level cannot be used together');
  }

  const [foreground, background] = positional;
  if (
    positional.length !== 2 ||
    foreground === undefined ||
    background === undefined
  ) {
    throw new Error("Try 'ccr --help' for more information.");
  }

  return { kind: 'run', foreground, background, json, level };
}

function main(): void {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    switch (parsed.kind) {
      case 'help':
        process.stdout.write(buildHelpText());
        return;
      case 'version':
        process.stdout.write(`${VERSION}\n`);
        return;
      case 'run': {
        const result = checkContrast(parsed.foreground, parsed.background);

        if (parsed.level !== null) {
          process.exit(passesLevel(result.normalText, parsed.level) ? 0 : 1);
        }

        if (parsed.json) {
          process.stdout.write(`${JSON.stringify(result)}\n`);
        } else {
          process.stdout.write(`${formatHumanReadable(result)}\n`);
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${message}\n`);
    process.exit(2);
  }
}

main();
