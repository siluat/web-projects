import { checkContrast, suggestForeground, validateColors } from '../index';
import { parseBatchLine } from './parse-line';
import type {
  BatchLineResult,
  BatchOptions,
  BatchResult,
  BatchSuggestLineResult,
} from './types';

/**
 * Determine whether a ContrastResult passes the given level and size.
 */
function passesLevel(
  result: { normalText: string; largeText: string },
  level: 'AA' | 'AAA',
  size: 'normal' | 'large',
): boolean {
  const compliance = size === 'large' ? result.largeText : result.normalText;
  if (level === 'AA') {
    return compliance === 'AA' || compliance === 'AAA';
  }
  return compliance === 'AAA';
}

/**
 * Get the WCAG target ratio for a given level and size.
 */
function getTargetRatio(level: 'AA' | 'AAA', size: 'normal' | 'large'): number {
  const ratios = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  } as const;
  return ratios[level][size];
}

/**
 * Process batch lines in standard mode (no suggest).
 *
 * Each line is independently parsed and checked. Invalid lines produce
 * error entries; processing continues for all lines.
 */
export function processBatch(
  lines: string[],
  options: BatchOptions,
): BatchResult<BatchLineResult> {
  const results: BatchLineResult[] = [];
  let hasError = false;
  let hasFailure = false;

  for (const line of lines) {
    const parsed = parseBatchLine(line);

    if (parsed.kind === 'skip') {
      continue;
    }

    if (parsed.kind === 'error') {
      results.push({
        kind: 'error',
        foreground: '',
        background: '',
        message: parsed.message,
      });
      hasError = true;
      continue;
    }

    const errors = validateColors(parsed.foreground, parsed.background);
    if (errors.length > 0) {
      results.push({
        kind: 'error',
        foreground: parsed.foreground,
        background: parsed.background,
        message: errors.join('; '),
      });
      hasError = true;
      continue;
    }

    const result = checkContrast(parsed.foreground, parsed.background);
    results.push({
      kind: 'ok',
      foreground: parsed.foreground,
      background: parsed.background,
      result,
    });

    if (
      options.level !== null &&
      !passesLevel(result, options.level, options.size)
    ) {
      hasFailure = true;
    }
  }

  const exitCode = hasError ? 2 : hasFailure ? 1 : 0;
  return { results, exitCode };
}

/**
 * Process batch lines in suggest mode.
 *
 * For each pair, checks if it already passes the target level.
 * If not, suggests an adjusted foreground color.
 */
export function processBatchSuggest(
  lines: string[],
  options: BatchOptions & { level: 'AA' | 'AAA' },
): BatchResult<BatchSuggestLineResult> {
  const results: BatchSuggestLineResult[] = [];
  let hasError = false;
  let hasFailure = false;
  const targetRatio = getTargetRatio(options.level, options.size);

  for (const line of lines) {
    const parsed = parseBatchLine(line);

    if (parsed.kind === 'skip') {
      continue;
    }

    if (parsed.kind === 'error') {
      results.push({
        kind: 'error',
        foreground: '',
        background: '',
        message: parsed.message,
      });
      hasError = true;
      continue;
    }

    const errors = validateColors(parsed.foreground, parsed.background);
    if (errors.length > 0) {
      results.push({
        kind: 'error',
        foreground: parsed.foreground,
        background: parsed.background,
        message: errors.join('; '),
      });
      hasError = true;
      continue;
    }

    const original = checkContrast(parsed.foreground, parsed.background);

    if (passesLevel(original, options.level, options.size)) {
      results.push({
        kind: 'ok',
        foreground: parsed.foreground,
        background: parsed.background,
        original,
        alreadyPasses: true,
        suggested: null,
      });
      continue;
    }

    const suggestion = suggestForeground(
      parsed.foreground,
      parsed.background,
      targetRatio,
    );

    if (suggestion.suggested !== null && suggestion.result !== null) {
      results.push({
        kind: 'ok',
        foreground: parsed.foreground,
        background: parsed.background,
        original,
        alreadyPasses: false,
        suggested: {
          color: suggestion.suggested,
          ratio: suggestion.result.ratio,
          normalText: suggestion.result.normalText,
          largeText: suggestion.result.largeText,
        },
      });
    } else {
      results.push({
        kind: 'ok',
        foreground: parsed.foreground,
        background: parsed.background,
        original,
        alreadyPasses: false,
        suggested: null,
      });
      hasFailure = true;
    }
  }

  const exitCode = hasError ? 2 : hasFailure ? 1 : 0;
  return { results, exitCode };
}
