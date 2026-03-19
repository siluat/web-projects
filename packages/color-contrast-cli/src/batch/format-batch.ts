import type { ComplianceLevel, ContrastResult } from '../types';
import type { BatchLineResult, BatchSuggestLineResult } from './types';

function formatCompliancePair(result: ContrastResult): string {
  return `${formatLevel(result.normalText)} / ${formatLevel(result.largeText)}`;
}

function formatLevel(level: ComplianceLevel): string {
  return level === 'Fail' ? 'Fail' : level;
}

/**
 * Format batch results as human-readable one-line summaries.
 *
 * Example: `#000 #fff → 21:1 AAA / AAA`
 */
export function formatBatchHuman(results: BatchLineResult[]): string {
  const lines: string[] = [];
  for (const entry of results) {
    if (entry.kind === 'error') {
      const label =
        entry.foreground && entry.background
          ? `${entry.foreground} ${entry.background}`
          : 'parse error';
      lines.push(`${label} → Error: ${entry.message}`);
    } else {
      lines.push(
        `${entry.foreground} ${entry.background} → ${entry.result.ratio}:1 ${formatCompliancePair(entry.result)}`,
      );
    }
  }
  return lines.join('\n');
}

/**
 * Format batch results as a JSON array.
 */
export function formatBatchJson(results: BatchLineResult[]): string {
  const items = results.map((entry) => {
    if (entry.kind === 'error') {
      return {
        foreground: entry.foreground,
        background: entry.background,
        error: entry.message,
      };
    }
    return {
      foreground: entry.foreground,
      background: entry.background,
      ratio: entry.result.ratio,
      normalText: entry.result.normalText,
      largeText: entry.result.largeText,
    };
  });
  return JSON.stringify(items);
}

/**
 * Format batch suggest results as human-readable summaries.
 *
 * Passing pairs: `#333 #fff → Already passes AA`
 * Suggested pairs: `#777 #fff → Suggested: #767676 4.54:1 (AA)`
 */
export function formatBatchSuggestHuman(
  results: BatchSuggestLineResult[],
  level: 'AA' | 'AAA',
  size: 'normal' | 'large',
): string {
  const lines: string[] = [];
  for (const entry of results) {
    if (entry.kind === 'error') {
      const label =
        entry.foreground && entry.background
          ? `${entry.foreground} ${entry.background}`
          : 'parse error';
      lines.push(`${label} → Error: ${entry.message}`);
    } else if (entry.suggested !== null) {
      const compliance =
        size === 'large'
          ? entry.suggested.largeText
          : entry.suggested.normalText;
      lines.push(
        `${entry.foreground} ${entry.background} → Suggested: ${entry.suggested.color} ${entry.suggested.ratio}:1 (${compliance})`,
      );
    } else if (entry.alreadyPasses) {
      lines.push(
        `${entry.foreground} ${entry.background} → Already passes ${level}`,
      );
    } else {
      lines.push(
        `${entry.foreground} ${entry.background} → No suggestion available`,
      );
    }
  }
  return lines.join('\n');
}

/**
 * Format batch suggest results as a JSON array.
 */
export function formatBatchSuggestJson(
  results: BatchSuggestLineResult[],
): string {
  const items = results.map((entry) => {
    if (entry.kind === 'error') {
      return {
        foreground: entry.foreground,
        background: entry.background,
        error: entry.message,
      };
    }
    return {
      foreground: entry.foreground,
      background: entry.background,
      original: {
        ratio: entry.original.ratio,
        normalText: entry.original.normalText,
        largeText: entry.original.largeText,
      },
      suggested: entry.suggested
        ? {
            color: entry.suggested.color,
            ratio: entry.suggested.ratio,
            normalText: entry.suggested.normalText,
            largeText: entry.suggested.largeText,
          }
        : null,
    };
  });
  return JSON.stringify(items);
}
