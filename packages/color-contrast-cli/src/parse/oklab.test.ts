import { describe, expect, it } from 'bun:test';
import { parseOklab } from './oklab';

describe('parseOklab', () => {
  describe('space-separated syntax', () => {
    it('parses oklab(0.5 0.1 -0.1)', () => {
      expect(parseOklab('oklab(0.5 0.1 -0.1)')).toEqual({
        space: 'oklab',
        l: 0.5,
        a: 0.1,
        b: -0.1,
        alpha: 1,
      });
    });

    it('parses oklab with alpha number: oklab(0.5 0.1 -0.1 / 0.5)', () => {
      expect(parseOklab('oklab(0.5 0.1 -0.1 / 0.5)')).toEqual({
        space: 'oklab',
        l: 0.5,
        a: 0.1,
        b: -0.1,
        alpha: 0.5,
      });
    });

    it('parses oklab with alpha percentage: oklab(0.5 0.1 -0.1 / 50%)', () => {
      expect(parseOklab('oklab(0.5 0.1 -0.1 / 50%)')).toEqual({
        space: 'oklab',
        l: 0.5,
        a: 0.1,
        b: -0.1,
        alpha: 0.5,
      });
    });

    it('parses oklab(0 0 0) — black', () => {
      expect(parseOklab('oklab(0 0 0)')).toEqual({
        space: 'oklab',
        l: 0,
        a: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses oklab(1 0 0) — white', () => {
      expect(parseOklab('oklab(1 0 0)')).toEqual({
        space: 'oklab',
        l: 1,
        a: 0,
        b: 0,
        alpha: 1,
      });
    });
  });

  describe('percentage channels', () => {
    it('maps L 50% to 0.5', () => {
      expect(parseOklab('oklab(50% 0 0)')?.l).toBe(0.5);
    });

    it('maps L 100% to 1', () => {
      expect(parseOklab('oklab(100% 0 0)')?.l).toBe(1);
    });

    it('maps a 100% to 0.4', () => {
      expect(parseOklab('oklab(0.5 100% 0)')?.a).toBeCloseTo(0.4, 10);
    });

    it('maps a -100% to -0.4', () => {
      expect(parseOklab('oklab(0.5 -100% 0)')?.a).toBeCloseTo(-0.4, 10);
    });

    it('maps b 50% to 0.2', () => {
      expect(parseOklab('oklab(0.5 0 50%)')?.b).toBeCloseTo(0.2, 10);
    });

    it('maps b -50% to -0.2', () => {
      expect(parseOklab('oklab(0.5 0 -50%)')?.b).toBeCloseTo(-0.2, 10);
    });

    it('maps all channels as percentages', () => {
      const result = parseOklab('oklab(50% 50% -50%)');
      expect(result?.l).toBe(0.5);
      expect(result?.a).toBeCloseTo(0.2, 10);
      expect(result?.b).toBeCloseTo(-0.2, 10);
    });
  });

  describe('no clamping on channels', () => {
    it('allows L above 1', () => {
      expect(parseOklab('oklab(1.5 0 0)')?.l).toBe(1.5);
    });

    it('allows L below 0', () => {
      expect(parseOklab('oklab(-0.1 0 0)')?.l).toBe(-0.1);
    });

    it('allows a beyond reference range', () => {
      expect(parseOklab('oklab(0.5 0.8 0)')?.a).toBe(0.8);
    });

    it('allows b beyond reference range', () => {
      expect(parseOklab('oklab(0.5 0 -0.8)')?.b).toBe(-0.8);
    });
  });

  describe('alpha clamping', () => {
    it('clamps alpha above 1', () => {
      expect(parseOklab('oklab(0.5 0 0 / 1.5)')?.alpha).toBe(1);
    });

    it('clamps alpha below 0', () => {
      expect(parseOklab('oklab(0.5 0 0 / -0.5)')?.alpha).toBe(0);
    });
  });

  describe('case insensitivity', () => {
    it('parses OKLAB(0.5 0.1 -0.1)', () => {
      expect(parseOklab('OKLAB(0.5 0.1 -0.1)')?.l).toBe(0.5);
    });

    it('parses Oklab(0.5 0.1 -0.1)', () => {
      expect(parseOklab('Oklab(0.5 0.1 -0.1)')?.l).toBe(0.5);
    });
  });

  describe('whitespace tolerance', () => {
    it('handles extra internal whitespace', () => {
      expect(parseOklab('oklab(  0.5  0.1  -0.1  )')).toEqual({
        space: 'oklab',
        l: 0.5,
        a: 0.1,
        b: -0.1,
        alpha: 1,
      });
    });

    it('handles whitespace around slash', () => {
      expect(parseOklab('oklab(0.5 0.1 -0.1  /  0.5)')).toEqual({
        space: 'oklab',
        l: 0.5,
        a: 0.1,
        b: -0.1,
        alpha: 0.5,
      });
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseOklab('')).toBeNull();
    });

    it('returns null for non-oklab function', () => {
      expect(parseOklab('rgb(255, 0, 0)')).toBeNull();
    });

    it('returns null for insufficient arguments', () => {
      expect(parseOklab('oklab(0.5 0.1)')).toBeNull();
    });

    it('rejects comma syntax', () => {
      expect(parseOklab('oklab(0.5, 0.1, -0.1)')).toBeNull();
    });

    it('returns null for invalid tokens', () => {
      expect(parseOklab('oklab(abc 0 0)')).toBeNull();
    });

    it('returns null for empty function body', () => {
      expect(parseOklab('oklab()')).toBeNull();
    });

    it('returns null for invalid alpha', () => {
      expect(parseOklab('oklab(0.5 0 0 / abc)')).toBeNull();
    });
  });
});
