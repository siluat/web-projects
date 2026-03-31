/**
 * Doctest: verifies Library API documentation examples match actual behavior.
 *
 * Reads the MDX file as the single source of truth, extracts TypeScript code
 * blocks, and tests every expression that has a `// expected` comment.
 *
 * When the API changes, these tests fail — signaling that the docs need updating.
 *
 * NOTE: If a new public function is added to the library AND documented,
 * it must also be added to API_SCOPE below.
 */
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  checkContrast,
  checkContrastVerbose,
  contrastRatio,
  parseColor,
  parseColorDetailed,
  parseHex,
  srgbToOklch,
  suggestForeground,
  validateColors,
} from './index';

const DOCS_MDX_PATH = resolve(
  import.meta.dir,
  '../../../apps/color-contrast-docs/content/docs/reference/library-api.mdx',
);

// ── Extraction ──────────────────────────────────────────────

interface DocTestCase {
  setup: string[];
  expression: string;
  expectedText: string;
  hasWildcard: boolean;
  blockIndex: number;
}

function extractTypeScriptBlocks(mdx: string): string[] {
  const blocks: string[] = [];
  const re = /```typescript\n([\s\S]*?)```/g;
  for (const match of mdx.matchAll(re)) {
    const captured = match[1]?.trim();
    if (captured) blocks.push(captured);
  }
  return blocks;
}

/**
 * Parse code blocks into testable cases.
 *
 * A test case is an expression line followed by one or more `//` comment lines
 * that describe the expected output. Lines without following comments are
 * treated as setup (variable declarations needed by later expressions).
 *
 * Import lines, empty lines, and standalone comments are skipped.
 */
function extractDocTests(blocks: string[]): DocTestCase[] {
  const cases: DocTestCase[] = [];

  for (const [bi, block] of blocks.entries()) {
    const lines = block.split('\n');
    const setup: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line === undefined) {
        i++;
        continue;
      }
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('import ')) {
        i++;
        continue;
      }

      // Standalone comment (not an assertion after an expression)
      if (trimmed.startsWith('//')) {
        i++;
        continue;
      }

      // Count following comment lines
      let j = i + 1;
      while (j < lines.length) {
        const lineJ = lines[j];
        if (!lineJ?.trim().startsWith('//')) break;
        j++;
      }

      if (j === i + 1) {
        // No comments follow — setup line
        setup.push(trimmed);
        i++;
        continue;
      }

      // Expression with assertion comment(s)
      const expression = trimmed.replace(/;$/, '');
      const expectedText = lines
        .slice(i + 1, j)
        .map((l) => l.trim().replace(/^\/\/\s?/, ''))
        .join('\n');

      cases.push({
        setup: [...setup],
        expression,
        expectedText,
        hasWildcard: expectedText.includes('...'),
        blockIndex: bi,
      });

      i = j;
    }
  }

  return cases;
}

// ── Evaluation ──────────────────────────────────────────────

/** All public runtime exports — used as the scope for evaluating doc examples. */
const API_SCOPE: Record<string, unknown> = {
  contrastRatio,
  checkContrast,
  checkContrastVerbose,
  suggestForeground,
  validateColors,
  parseColor,
  parseColorDetailed,
  parseHex,
  srgbToOklch,
};

/** Strip TypeScript-only syntax (non-null assertions) for plain JS evaluation. */
function stripTS(code: string): string {
  return code.replace(/!\s*([;,)\]}])/g, '$1').replace(/!$/g, '');
}

function evaluate(setup: string[], expression: string): unknown {
  const names = Object.keys(API_SCOPE);
  const values = Object.values(API_SCOPE);

  const cleanSetup = setup.map((s) => {
    const clean = stripTS(s);
    return clean.endsWith(';') ? clean : `${clean};`;
  });

  // Variable declaration: evaluate and return the declared variable
  const declMatch = /^(?:const|let)\s+(\w+)\s*=/.exec(expression);
  if (declMatch) {
    const varName = declMatch[1];
    const cleanExpr = stripTS(expression);
    const stmt = cleanExpr.endsWith(';') ? cleanExpr : `${cleanExpr};`;
    const body = [...cleanSetup, stmt, `return ${varName};`].join('\n');
    return new Function(...names, body)(...values);
  }

  // Plain expression: return its value
  const cleanExpr = stripTS(expression);
  const body = [...cleanSetup, `return ${cleanExpr};`].join('\n');
  return new Function(...names, body)(...values);
}

// ── Serialization ───────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Serialize a value to the same format used in MDX comment assertions. */
function serialize(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    const escaped = value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/'/g, "\\'");
    return `'${escaped}'`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[${value.map(serialize).join(', ')}]`;
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
      .map(([k, v]) => `${k}: ${serialize(v)}`)
      .join(', ');
    return `{ ${entries} }`;
  }
  return String(value);
}

// ── Comparison ──────────────────────────────────────────────

/** Collapse whitespace and normalize bracket spacing for consistent comparison. */
function normalize(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/\[ /g, '[')
    .replace(/ \]/g, ']')
    .trim();
}

/**
 * Match actual text against expected pattern where `...` acts as a wildcard.
 *
 * The expected text is split by `...`, and each resulting segment must appear
 * in order within the actual text. This handles both truncated numbers
 * (e.g., `0.5019...`) and omitted values (e.g., `r: ...`).
 */
function matchWithWildcards(actual: string, expected: string): boolean {
  const a = normalize(actual);
  const e = normalize(expected);
  const segments = e.split('...');
  let pos = 0;

  for (const segment of segments) {
    if (!segment) continue;
    const idx = a.indexOf(segment, pos);
    if (idx === -1) return false;
    pos = idx + segment.length;
  }

  return true;
}

// ── Test suite ──────────────────────────────────────────────

const mdx = readFileSync(DOCS_MDX_PATH, 'utf8');
const blocks = extractTypeScriptBlocks(mdx);
const docTests = extractDocTests(blocks);

describe('Library API documentation examples', () => {
  test('MDX contains testable examples', () => {
    expect(docTests.length).toBeGreaterThan(0);
  });

  for (const tc of docTests) {
    const label =
      tc.expression.length > 60
        ? `${tc.expression.slice(0, 57)}...`
        : tc.expression;

    test(`block ${tc.blockIndex}: ${label}`, () => {
      const actual = evaluate(tc.setup, tc.expression);

      if (tc.hasWildcard) {
        const serialized = serialize(actual);
        if (!matchWithWildcards(serialized, tc.expectedText)) {
          throw new Error(
            'Documentation example mismatch:\n' +
              `  Expression: ${tc.expression}\n` +
              `  Expected:   ${normalize(tc.expectedText)}\n` +
              `  Actual:     ${normalize(serialized)}`,
          );
        }
      } else {
        const expectedValue = new Function(`return (${tc.expectedText});`)();
        expect(actual).toEqual(expectedValue);
      }
    });
  }
});
