/**
 * Parse a single batch input line into a foreground/background color pair.
 *
 * Splitting strategy:
 * - If a tab character exists, split on the first tab at parenthesis depth 0
 * - Otherwise, split on the first space at parenthesis depth 0
 *
 * Returns `{ kind: 'skip' }` for blank lines and comment lines (starting with //).
 * Returns `{ kind: 'error', message }` when the line cannot be split into two parts.
 */

export type ParseLineResult =
  | { kind: 'pair'; foreground: string; background: string }
  | { kind: 'skip' }
  | { kind: 'error'; message: string };

export function parseBatchLine(line: string): ParseLineResult {
  const trimmed = line.trim();

  if (trimmed === '' || trimmed.startsWith('//')) {
    return { kind: 'skip' };
  }

  // Tab-separated: split on first tab at parenthesis depth 0
  const tabIndex = findSplitIndex(trimmed, '\t');
  if (tabIndex !== -1) {
    const foreground = trimmed.slice(0, tabIndex).trim();
    const background = trimmed.slice(tabIndex + 1).trim();
    if (foreground === '' || background === '') {
      return { kind: 'error', message: `Cannot parse line: "${line.trim()}"` };
    }
    return { kind: 'pair', foreground, background };
  }

  // Space-separated: split on first space at parenthesis depth 0
  const splitIndex = findSplitIndex(trimmed, ' ');
  if (splitIndex === -1) {
    return {
      kind: 'error',
      message: `Cannot split into two colors: "${trimmed}"`,
    };
  }

  const foreground = trimmed.slice(0, splitIndex);
  const background = trimmed.slice(splitIndex + 1).trim();
  return { kind: 'pair', foreground, background };
}

/**
 * Find the index of the first delimiter at parenthesis depth 0.
 * Returns -1 if no valid split point is found.
 */
function findSplitIndex(input: string, delimiter: string): number {
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charAt(i);
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    } else if (ch === delimiter && depth === 0) {
      return i;
    }
  }
  return -1;
}
