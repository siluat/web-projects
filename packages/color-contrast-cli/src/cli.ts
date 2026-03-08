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
      size: 'normal' | 'large';
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
  result: ContrastResult,
  level: 'AA' | 'AAA',
  size: 'normal' | 'large',
): boolean {
  const compliance = size === 'large' ? result.largeText : result.normalText;
  if (level === 'AA') {
    return compliance === 'AA' || compliance === 'AAA';
  }
  return compliance === 'AAA';
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
    '  --size normal|large  Text size for --level check (default: normal)',
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
    "  ccr '#777' '#fff' --level AA --size large",
    "  ccr '#333' '#fff' --level AA --json",
    '',
  ];
  return lines.join('\n');
}

function parseArgs(argv: string[]): ParseResult {
  const positional: string[] = [];
  let json = false;
  let hasLevel = false;
  let levelValue: string | undefined;
  let hasSize = false;
  let sizeValue: string | undefined;
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
    } else if (arg === '--size') {
      hasSize = true;
      i++;
      sizeValue = argv[i];
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

  let size: 'normal' | 'large' = 'normal';
  if (hasSize) {
    if (sizeValue !== 'normal' && sizeValue !== 'large') {
      throw new Error(
        `Invalid --size value: "${sizeValue ?? ''}". Use normal or large`,
      );
    }
    if (!hasLevel) {
      throw new Error(
        "--size requires --level. Try 'ccr --help' for more information.",
      );
    }
    size = sizeValue;
  }

  const [foreground, background] = positional;
  if (positional.length === 0 || foreground === undefined) {
    throw new Error(
      'Missing foreground and background colors. Usage: ccr <foreground> <background>',
    );
  }
  if (positional.length === 1 || background === undefined) {
    throw new Error(
      'Missing background color. Usage: ccr <foreground> <background>',
    );
  }
  if (positional.length > 2) {
    throw new Error(
      `Expected 2 color arguments, got ${positional.length}. Try 'ccr --help' for more information.`,
    );
  }

  return { kind: 'run', foreground, background, json, level, size };
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

        if (parsed.json) {
          process.stdout.write(`${JSON.stringify(result)}\n`);
        } else if (parsed.level === null) {
          process.stdout.write(`${formatHumanReadable(result)}\n`);
        }

        if (parsed.level !== null) {
          process.exitCode = passesLevel(result, parsed.level, parsed.size)
            ? 0
            : 1;
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
