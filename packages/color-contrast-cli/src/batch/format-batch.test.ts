import { describe, expect, it } from 'bun:test';
import {
  formatBatchHuman,
  formatBatchJson,
  formatBatchSuggestHuman,
  formatBatchSuggestJson,
} from './format-batch';
import type { BatchLineResult, BatchSuggestLineResult } from './types';

describe('formatBatchHuman', () => {
  it('formats successful results as one-line summaries', () => {
    const results: BatchLineResult[] = [
      {
        kind: 'ok',
        foreground: '#000',
        background: '#fff',
        result: { ratio: 21, normalText: 'AAA', largeText: 'AAA' },
      },
      {
        kind: 'ok',
        foreground: '#666',
        background: '#999',
        result: { ratio: 2.16, normalText: 'Fail', largeText: 'Fail' },
      },
    ];
    const output = formatBatchHuman(results);
    expect(output).toBe(
      '#000 #fff → 21:1 AAA / AAA\n#666 #999 → 2.16:1 Fail / Fail',
    );
  });

  it('formats error entries', () => {
    const results: BatchLineResult[] = [
      {
        kind: 'error',
        foreground: 'invalid',
        background: '#fff',
        message: 'Invalid color: "invalid"',
      },
    ];
    const output = formatBatchHuman(results);
    expect(output).toBe('invalid #fff → Error: Invalid color: "invalid"');
  });

  it('formats parse error entries without foreground/background', () => {
    const results: BatchLineResult[] = [
      {
        kind: 'error',
        foreground: '',
        background: '',
        message: 'Cannot split into two colors: "single"',
      },
    ];
    const output = formatBatchHuman(results);
    expect(output).toContain('parse error → Error:');
  });
});

describe('formatBatchJson', () => {
  it('formats results as JSON array', () => {
    const results: BatchLineResult[] = [
      {
        kind: 'ok',
        foreground: '#000',
        background: '#fff',
        result: { ratio: 21, normalText: 'AAA', largeText: 'AAA' },
      },
    ];
    const output = formatBatchJson(results);
    const parsed = JSON.parse(output);
    expect(parsed).toEqual([
      {
        foreground: '#000',
        background: '#fff',
        ratio: 21,
        normalText: 'AAA',
        largeText: 'AAA',
      },
    ]);
  });

  it('includes error entries in JSON array', () => {
    const results: BatchLineResult[] = [
      {
        kind: 'error',
        foreground: 'invalid',
        background: '#fff',
        message: 'Invalid color: "invalid"',
      },
    ];
    const output = formatBatchJson(results);
    const parsed = JSON.parse(output);
    expect(parsed[0]).toEqual({
      foreground: 'invalid',
      background: '#fff',
      error: 'Invalid color: "invalid"',
    });
  });
});

describe('formatBatchSuggestHuman', () => {
  it('formats already-passing pairs', () => {
    const results: BatchSuggestLineResult[] = [
      {
        kind: 'ok',
        foreground: '#333',
        background: '#fff',
        original: { ratio: 12.63, normalText: 'AAA', largeText: 'AAA' },
        suggested: null,
      },
    ];
    const output = formatBatchSuggestHuman(results, 'AA');
    expect(output).toBe('#333 #fff → Already passes AA');
  });

  it('formats suggested pairs', () => {
    const results: BatchSuggestLineResult[] = [
      {
        kind: 'ok',
        foreground: '#777',
        background: '#fff',
        original: { ratio: 4.48, normalText: 'Fail', largeText: 'AA' },
        suggested: {
          color: '#767676',
          ratio: 4.54,
          normalText: 'AA',
          largeText: 'AAA',
        },
      },
    ];
    const output = formatBatchSuggestHuman(results, 'AA');
    expect(output).toBe('#777 #fff → Suggested: #767676 4.54:1 (AA)');
  });
});

describe('formatBatchSuggestJson', () => {
  it('formats suggest results as JSON array', () => {
    const results: BatchSuggestLineResult[] = [
      {
        kind: 'ok',
        foreground: '#333',
        background: '#fff',
        original: { ratio: 12.63, normalText: 'AAA', largeText: 'AAA' },
        suggested: null,
      },
      {
        kind: 'ok',
        foreground: '#777',
        background: '#fff',
        original: { ratio: 4.48, normalText: 'Fail', largeText: 'AA' },
        suggested: {
          color: '#767676',
          ratio: 4.54,
          normalText: 'AA',
          largeText: 'AAA',
        },
      },
    ];
    const output = formatBatchSuggestJson(results);
    const parsed = JSON.parse(output);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].suggested).toBeNull();
    expect(parsed[1].suggested.color).toBe('#767676');
  });
});
