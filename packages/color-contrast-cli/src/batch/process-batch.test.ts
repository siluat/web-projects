import { describe, expect, it } from 'bun:test';
import { processBatch, processBatchSuggest } from './process-batch';

describe('processBatch', () => {
  it('processes multiple valid pairs', () => {
    const lines = ['#000 #fff', '#333 #ccc'];
    const result = processBatch(lines, {
      level: null,
      size: 'normal',
      suggest: false,
    });
    expect(result.results).toHaveLength(2);
    expect(result.results[0]?.kind).toBe('ok');
    expect(result.results[1]?.kind).toBe('ok');
    expect(result.exitCode).toBe(0);
  });

  it('skips blank lines and comments', () => {
    const lines = ['#000 #fff', '', '// comment', '#333 #ccc'];
    const result = processBatch(lines, {
      level: null,
      size: 'normal',
      suggest: false,
    });
    expect(result.results).toHaveLength(2);
  });

  it('records errors for invalid colors and continues', () => {
    const lines = ['#000 #fff', 'invalid color', '#333 #ccc'];
    const result = processBatch(lines, {
      level: null,
      size: 'normal',
      suggest: false,
    });
    expect(result.results).toHaveLength(3);
    expect(result.results[0]?.kind).toBe('ok');
    expect(result.results[1]?.kind).toBe('error');
    expect(result.results[2]?.kind).toBe('ok');
    expect(result.exitCode).toBe(2);
  });

  it('returns correct contrast values', () => {
    const lines = ['#000 #fff'];
    const result = processBatch(lines, {
      level: null,
      size: 'normal',
      suggest: false,
    });
    const first = result.results[0];
    expect(first?.kind).toBe('ok');
    if (first?.kind === 'ok') {
      expect(first.result.ratio).toBe(21);
      expect(first.result.normalText).toBe('AAA');
      expect(first.result.largeText).toBe('AAA');
    }
  });

  describe('with --level', () => {
    it('exit 0 when all pairs pass', () => {
      const lines = ['#000 #fff', '#333 #ccc'];
      const result = processBatch(lines, {
        level: 'AA',
        size: 'normal',
        suggest: false,
      });
      expect(result.exitCode).toBe(0);
    });

    it('exit 1 when any pair fails', () => {
      const lines = ['#000 #fff', '#999 #fff'];
      const result = processBatch(lines, {
        level: 'AA',
        size: 'normal',
        suggest: false,
      });
      expect(result.exitCode).toBe(1);
    });

    it('exit 2 takes priority over exit 1', () => {
      const lines = ['invalid color', '#999 #fff'];
      const result = processBatch(lines, {
        level: 'AA',
        size: 'normal',
        suggest: false,
      });
      expect(result.exitCode).toBe(2);
    });
  });

  it('returns empty results for empty input', () => {
    const result = processBatch([], {
      level: null,
      size: 'normal',
      suggest: false,
    });
    expect(result.results).toHaveLength(0);
    expect(result.exitCode).toBe(0);
  });

  it('handles functional color syntax', () => {
    const lines = ['rgb(255, 0, 0) white'];
    const result = processBatch(lines, {
      level: null,
      size: 'normal',
      suggest: false,
    });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.kind).toBe('ok');
  });
});

describe('processBatchSuggest', () => {
  it('marks already-passing pairs with alreadyPasses: true', () => {
    const lines = ['#000 #fff'];
    const result = processBatchSuggest(lines, {
      level: 'AA',
      size: 'normal',
      suggest: true,
    });
    expect(result.results).toHaveLength(1);
    const first = result.results[0];
    expect(first?.kind).toBe('ok');
    if (first?.kind === 'ok') {
      expect(first.alreadyPasses).toBe(true);
      expect(first.suggested).toBeNull();
    }
  });

  it('suggests foreground for failing pairs', () => {
    const lines = ['#777 #fff'];
    const result = processBatchSuggest(lines, {
      level: 'AA',
      size: 'normal',
      suggest: true,
    });
    expect(result.results).toHaveLength(1);
    const first = result.results[0];
    expect(first?.kind).toBe('ok');
    if (first?.kind === 'ok') {
      expect(first.alreadyPasses).toBe(false);
      expect(first.suggested).not.toBeNull();
      expect(first.suggested?.color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('sets alreadyPasses: false when suggestion is impossible', () => {
    const lines = ['#808080 #808080'];
    const result = processBatchSuggest(lines, {
      level: 'AAA',
      size: 'normal',
      suggest: true,
    });
    const first = result.results[0];
    expect(first?.kind).toBe('ok');
    if (first?.kind === 'ok') {
      expect(first.alreadyPasses).toBe(false);
      expect(first.suggested).toBeNull();
    }
    expect(result.exitCode).toBe(1);
  });

  it('records errors for invalid colors', () => {
    const lines = ['invalid #fff'];
    const result = processBatchSuggest(lines, {
      level: 'AA',
      size: 'normal',
      suggest: true,
    });
    expect(result.results[0]?.kind).toBe('error');
    expect(result.exitCode).toBe(2);
  });

  it('processes mixed passing and failing pairs', () => {
    const lines = ['#000 #fff', '#999 #fff'];
    const result = processBatchSuggest(lines, {
      level: 'AA',
      size: 'normal',
      suggest: true,
    });
    expect(result.results).toHaveLength(2);
    const first = result.results[0];
    const second = result.results[1];
    if (first?.kind === 'ok') {
      expect(first.suggested).toBeNull();
    }
    if (second?.kind === 'ok') {
      expect(second.suggested).not.toBeNull();
    }
  });
});
