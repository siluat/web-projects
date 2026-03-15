#!/usr/bin/env node
import { srgbToOklch } from './convert';
import {
  checkContrast,
  checkContrastVerbose,
  suggestForeground,
  validateColors,
} from './index';
import { parseHex } from './parse/hex';
import type {
  ColorTrace,
  ComplianceLevel,
  ContrastResult,
  OKLCHColor,
  SRGBColor,
  VerboseResult,
} from './types';

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
      verbose: boolean;
      suggest: boolean;
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

function getTargetRatio(level: 'AA' | 'AAA', size: 'normal' | 'large'): number {
  const ratios = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  } as const;
  return ratios[level][size];
}

/**
 * Format an sRGB color as rgb(R, G, B) or rgba(R, G, B, alpha).
 */
function formatSrgbAsRgb(color: SRGBColor): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  if (color.alpha < 1) {
    return `rgba(${r}, ${g}, ${b}, ${formatNumber(color.alpha)})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Format a number with up to 4 decimal places, removing trailing zeros.
 */
function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(parseFloat(n.toFixed(4)));
}

/**
 * Display parsed values based on the color format.
 */
function formatParsedValues(trace: ColorTrace): string {
  const { parsed, format } = trace;
  const alpha = parsed.alpha < 1 ? `, alpha=${formatNumber(parsed.alpha)}` : '';

  switch (format) {
    case 'hex':
      return `${formatSrgbAsRgb(trace.srgb)}`;
    case 'named':
      return `${formatSrgbAsRgb(trace.srgb)}`;
    case 'rgb': {
      if (parsed.space !== 'srgb') break;
      const r = Math.round(parsed.r * 255);
      const g = Math.round(parsed.g * 255);
      const b = Math.round(parsed.b * 255);
      return `R=${r}, G=${g}, B=${b}${alpha}`;
    }
    case 'hsl': {
      if (parsed.space !== 'hsl') break;
      const h = formatNumber(parsed.h * 360);
      const s = formatNumber(parsed.s * 100);
      const l = formatNumber(parsed.l * 100);
      return `H=${h}, S=${s}%, L=${l}%${alpha}`;
    }
    case 'hwb': {
      if (parsed.space !== 'hwb') break;
      const h = formatNumber(parsed.h * 360);
      const w = formatNumber(parsed.w * 100);
      const b = formatNumber(parsed.b * 100);
      return `H=${h}, W=${w}%, B=${b}%${alpha}`;
    }
    case 'lab': {
      if (parsed.space !== 'lab') break;
      const l = formatNumber(parsed.l);
      const a = formatNumber(parsed.a);
      const b = formatNumber(parsed.b);
      return `L=${l}, a=${a}, b=${b}${alpha}`;
    }
    case 'lch': {
      if (parsed.space !== 'lch') break;
      const l = formatNumber(parsed.l);
      const c = formatNumber(parsed.c);
      const h = formatNumber(parsed.h);
      return `L=${l}, C=${c}, H=${h}${alpha}`;
    }
    case 'oklab': {
      if (parsed.space !== 'oklab') break;
      const l = formatNumber(parsed.l);
      const a = formatNumber(parsed.a);
      const b = formatNumber(parsed.b);
      return `L=${l}, a=${a}, b=${b}${alpha}`;
    }
    case 'oklch': {
      if (parsed.space !== 'oklch') break;
      const l = formatNumber(parsed.l);
      const c = formatNumber(parsed.c);
      const h = formatNumber(parsed.h);
      return `L=${l}, C=${c}, H=${h}${alpha}`;
    }
  }
  // Fallback (should not reach here with valid data)
  return formatSrgbAsRgb(trace.srgb);
}

/**
 * Return conversion step description, or null if already sRGB-native.
 */
function formatConversionStep(trace: ColorTrace): string | null {
  switch (trace.format) {
    case 'hex':
    case 'named':
    case 'rgb':
      return null;
    case 'hsl':
    case 'hwb':
      return `Converted to sRGB: ${formatSrgbAsRgb(trace.srgb)}`;
    case 'lab':
    case 'lch':
    case 'oklab':
    case 'oklch':
      return `Gamut mapped to sRGB: ${formatSrgbAsRgb(trace.srgb)}`;
  }
}

/**
 * Format the full verbose output text.
 */
function formatVerbose(verbose: VerboseResult): string {
  const lines: string[] = [];

  // Foreground section
  const fgFormatLabel = verbose.foreground.format.toUpperCase();
  lines.push(`Foreground: ${verbose.foreground.input}`);
  lines.push(
    `  -> Parsed as ${fgFormatLabel}: ${formatParsedValues(verbose.foreground)}`,
  );
  const fgConversion = formatConversionStep(verbose.foreground);
  if (fgConversion !== null) {
    lines.push(`  -> ${fgConversion}`);
  }

  // Background section
  const bgFormatLabel = verbose.background.format.toUpperCase();
  lines.push(`Background: ${verbose.background.input}`);
  lines.push(
    `  -> Parsed as ${bgFormatLabel}: ${formatParsedValues(verbose.background)}`,
  );
  const bgConversion = formatConversionStep(verbose.background);
  if (bgConversion !== null) {
    lines.push(`  -> ${bgConversion}`);
  }

  // Alpha compositing
  if (verbose.alphaComposited) {
    lines.push('Alpha compositing: applied');
  } else {
    lines.push('Alpha compositing: not needed (both opaque)');
  }

  // Luminance
  const fgLum = formatNumber(Math.round(verbose.fgLuminance * 10000) / 10000);
  const bgLum = formatNumber(Math.round(verbose.bgLuminance * 10000) / 10000);
  lines.push(`Relative luminance: fg=${fgLum}, bg=${bgLum}`);

  // Contrast result
  lines.push(`Contrast ratio: ${verbose.result.ratio}:1`);
  lines.push(`Normal text: ${formatLevel(verbose.result.normalText)}`);
  lines.push(`Large text:  ${formatLevel(verbose.result.largeText)}`);

  return lines.join('\n');
}

/**
 * Format an OkLCH color as a trace string for verbose output.
 * Shows alpha only when < 1, consistent with existing verbose patterns.
 */
function formatOklchTrace(oklch: OKLCHColor): string {
  const l = formatNumber(oklch.l);
  const c = formatNumber(oklch.c);
  const h = formatNumber(oklch.h);
  const alpha = oklch.alpha < 1 ? `, alpha=${formatNumber(oklch.alpha)}` : '';
  return `L=${l}, C=${c}, H=${h}${alpha}`;
}

/**
 * Format the suggest + verbose output.
 * Appends suggestion details (OkLCH trace, direction, suggested color) to the verbose trace.
 */
function formatSuggestVerbose(
  verbose: VerboseResult,
  suggestion: {
    suggested: string;
    ratio: number;
    compliance: ComplianceLevel;
    originalOklch: OKLCHColor;
    suggestedOklch: OKLCHColor;
    direction: 'darker' | 'lighter';
  },
): string {
  const lines: string[] = [formatVerbose(verbose)];
  lines.push('Suggestion:');
  lines.push(`  Original OkLCH: ${formatOklchTrace(suggestion.originalOklch)}`);
  lines.push(
    `  Suggested OkLCH: ${formatOklchTrace(suggestion.suggestedOklch)}`,
  );
  lines.push(`  Direction: ${suggestion.direction}`);
  lines.push(`  Suggested foreground: ${suggestion.suggested}`);
  lines.push(
    `  Contrast ratio: ${suggestion.ratio}:1 (${suggestion.compliance})`,
  );
  return lines.join('\n');
}

function buildHelpText(): string {
  const lines = [
    `@siluat/color-contrast-cli v${VERSION}`,
    '',
    'Usage: ccr <foreground> <background> [options]',
    '',
    'Options:',
    '  --json               Output result as JSON',
    '  --verbose            Show detailed conversion trace',
    '  --level AA|AAA       Exit 0 if contrast passes the level, 1 if not',
    '  --size normal|large  Text size for --level check (default: normal)',
    '  --suggest            Suggest a foreground color that meets --level',
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
    "  ccr '#777' '#fff' --suggest --level AA",
    "  ccr 'oklch(60% 0.15 50)' white --verbose",
    '',
  ];
  return lines.join('\n');
}

function parseArgs(argv: string[]): ParseResult {
  const positional: string[] = [];
  let json = false;
  let verbose = false;
  let suggest = false;
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
    } else if (arg === '--verbose') {
      verbose = true;
    } else if (arg === '--suggest') {
      suggest = true;
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

  if (suggest && !hasLevel) {
    throw new Error(
      "--suggest requires --level. Try 'ccr --help' for more information.",
    );
  }

  if (verbose && json) {
    throw new Error('--verbose and --json cannot be combined.');
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

  return {
    kind: 'run',
    foreground,
    background,
    json,
    verbose,
    suggest,
    level,
    size,
  };
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
        const errors = validateColors(parsed.foreground, parsed.background);
        if (errors.length > 0) {
          for (const error of errors) {
            process.stderr.write(`Error: ${error}\n`);
          }
          process.exitCode = 2;
          return;
        }

        if (parsed.suggest && parsed.level !== null) {
          const targetRatio = getTargetRatio(parsed.level, parsed.size);

          if (parsed.verbose) {
            const verbose = checkContrastVerbose(
              parsed.foreground,
              parsed.background,
            );

            if (passesLevel(verbose.result, parsed.level, parsed.size)) {
              process.stdout.write(
                `${formatVerbose(verbose)}\nAlready passes ${parsed.level} for ${parsed.size} text.\n`,
              );
              return;
            }

            const suggestion = suggestForeground(
              parsed.foreground,
              parsed.background,
              targetRatio,
            );

            if (suggestion.suggested !== null && suggestion.result !== null) {
              const compliance =
                parsed.size === 'large'
                  ? suggestion.result.largeText
                  : suggestion.result.normalText;
              const originalOklch = srgbToOklch(verbose.foreground.srgb);
              const suggestedSrgb = parseHex(suggestion.suggested);
              if (suggestedSrgb !== null) {
                const suggestedOklch = srgbToOklch(suggestedSrgb);
                const direction =
                  suggestedOklch.l < originalOklch.l ? 'darker' : 'lighter';
                process.stdout.write(
                  `${formatSuggestVerbose(verbose, {
                    suggested: suggestion.suggested,
                    ratio: suggestion.result.ratio,
                    compliance,
                    originalOklch,
                    suggestedOklch,
                    direction,
                  })}\n`,
                );
              } else {
                process.stdout.write(
                  `${formatVerbose(verbose)}\nSuggested foreground: ${suggestion.suggested}\nContrast ratio: ${suggestion.result.ratio}:1 (${compliance})\n`,
                );
              }
              return;
            }

            process.stdout.write(
              `${formatVerbose(verbose)}\nNo suggestion available.\nThe target cannot be met by adjusting foreground lightness alone.\n`,
            );
            process.exitCode = 1;
            return;
          }

          const original = checkContrast(parsed.foreground, parsed.background);

          if (passesLevel(original, parsed.level, parsed.size)) {
            if (parsed.json) {
              process.stdout.write(
                `${JSON.stringify({ original, suggested: null })}\n`,
              );
            } else {
              process.stdout.write(
                `Contrast ratio: ${original.ratio}:1\nAlready passes ${parsed.level} for ${parsed.size} text.\n`,
              );
            }
            return;
          }

          const suggestion = suggestForeground(
            parsed.foreground,
            parsed.background,
            targetRatio,
          );

          if (suggestion.suggested !== null && suggestion.result !== null) {
            if (parsed.json) {
              process.stdout.write(
                `${JSON.stringify({
                  original,
                  suggested: {
                    color: suggestion.suggested,
                    ratio: suggestion.result.ratio,
                    normalText: suggestion.result.normalText,
                    largeText: suggestion.result.largeText,
                  },
                })}\n`,
              );
            } else {
              const compliance =
                parsed.size === 'large'
                  ? suggestion.result.largeText
                  : suggestion.result.normalText;
              process.stdout.write(
                `Suggested foreground: ${suggestion.suggested}\nContrast ratio: ${suggestion.result.ratio}:1 (${compliance})\n`,
              );
            }
            return;
          }

          if (parsed.json) {
            process.stdout.write(
              `${JSON.stringify({ original, suggested: null })}\n`,
            );
          } else {
            process.stdout.write(
              'No suggestion available.\nThe target cannot be met by adjusting foreground lightness alone.\n',
            );
          }
          process.exitCode = 1;
          return;
        }

        if (parsed.verbose) {
          const verbose = checkContrastVerbose(
            parsed.foreground,
            parsed.background,
          );
          process.stdout.write(`${formatVerbose(verbose)}\n`);

          if (parsed.level !== null) {
            process.exitCode = passesLevel(
              verbose.result,
              parsed.level,
              parsed.size,
            )
              ? 0
              : 1;
          }
          return;
        }

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
