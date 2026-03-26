import { describe, expect, it } from 'bun:test';
import { parseOklch } from './oklch';

describe('parseOklch', () => {
  describe('space-separated syntax', () => {
    it('parses oklch(0.6 0.15 50)', () => {
      expect(parseOklch('oklch(0.6 0.15 50)')).toEqual({
        space: 'oklch',
        l: 0.6,
        c: 0.15,
        h: 50,
        alpha: 1,
      });
    });

    it('parses oklch with alpha number: oklch(0.6 0.15 50 / 0.5)', () => {
      expect(parseOklch('oklch(0.6 0.15 50 / 0.5)')).toEqual({
        space: 'oklch',
        l: 0.6,
        c: 0.15,
        h: 50,
        alpha: 0.5,
      });
    });

    it('parses oklch with alpha percentage: oklch(0.6 0.15 50 / 50%)', () => {
      expect(parseOklch('oklch(0.6 0.15 50 / 50%)')).toEqual({
        space: 'oklch',
        l: 0.6,
        c: 0.15,
        h: 50,
        alpha: 0.5,
      });
    });

    it('parses oklch(0 0 0) — black', () => {
      expect(parseOklch('oklch(0 0 0)')).toEqual({
        space: 'oklch',
        l: 0,
        c: 0,
        h: 0,
        alpha: 1,
      });
    });
  });

  describe('percentage channels', () => {
    it('maps L 50% to 0.5', () => {
      expect(parseOklch('oklch(50% 0 0)')?.l).toBe(0.5);
    });

    it('maps L 100% to 1', () => {
      expect(parseOklch('oklch(100% 0 0)')?.l).toBe(1);
    });

    it('maps C 100% to 0.4', () => {
      expect(parseOklch('oklch(0.5 100% 0)')?.c).toBeCloseTo(0.4, 10);
    });

    it('maps C 50% to 0.2', () => {
      expect(parseOklch('oklch(0.5 50% 0)')?.c).toBeCloseTo(0.2, 10);
    });
  });

  describe('hue angle units', () => {
    it('parses deg unit: oklch(0.6 0.15 120deg)', () => {
      expect(parseOklch('oklch(0.6 0.15 120deg)')?.h).toBe(120);
    });

    it('parses rad unit: oklch(0.6 0.15 3.14159rad)', () => {
      expect(parseOklch('oklch(0.6 0.15 3.14159rad)')?.h).toBeCloseTo(180, 2);
    });

    it('parses grad unit: oklch(0.6 0.15 400grad)', () => {
      expect(parseOklch('oklch(0.6 0.15 400grad)')?.h).toBe(0);
    });

    it('parses turn unit: oklch(0.6 0.15 0.5turn)', () => {
      expect(parseOklch('oklch(0.6 0.15 0.5turn)')?.h).toBe(180);
    });
  });

  describe('hue wrapping', () => {
    it('wraps 370 to 10 degrees', () => {
      expect(parseOklch('oklch(0.6 0.15 370)')?.h).toBeCloseTo(10, 10);
    });

    it('wraps -10 to 350 degrees', () => {
      expect(parseOklch('oklch(0.6 0.15 -10)')?.h).toBeCloseTo(350, 10);
    });

    it('wraps 720 to 0 degrees', () => {
      expect(parseOklch('oklch(0.6 0.15 720)')?.h).toBe(0);
    });

    it('wraps 360 to 0 degrees', () => {
      expect(parseOklch('oklch(0.6 0.15 360)')?.h).toBe(0);
    });
  });

  describe('no clamping on L and C', () => {
    it('allows L above 1', () => {
      expect(parseOklch('oklch(1.5 0.15 50)')?.l).toBe(1.5);
    });

    it('allows L below 0', () => {
      expect(parseOklch('oklch(-0.1 0.15 50)')?.l).toBe(-0.1);
    });

    it('allows C beyond reference range', () => {
      expect(parseOklch('oklch(0.5 0.8 50)')?.c).toBe(0.8);
    });
  });

  describe('alpha clamping', () => {
    it('clamps alpha above 1', () => {
      expect(parseOklch('oklch(0.6 0.15 50 / 1.5)')?.alpha).toBe(1);
    });

    it('clamps alpha below 0', () => {
      expect(parseOklch('oklch(0.6 0.15 50 / -0.5)')?.alpha).toBe(0);
    });
  });

  describe('case insensitivity', () => {
    it('parses OKLCH(0.6 0.15 50)', () => {
      expect(parseOklch('OKLCH(0.6 0.15 50)')?.l).toBe(0.6);
    });

    it('parses oklch(0.6 0.15 120DEG)', () => {
      expect(parseOklch('oklch(0.6 0.15 120DEG)')?.h).toBe(120);
    });
  });

  describe('whitespace tolerance', () => {
    it('handles extra internal whitespace', () => {
      expect(parseOklch('oklch(  0.6  0.15  50  )')).toEqual({
        space: 'oklch',
        l: 0.6,
        c: 0.15,
        h: 50,
        alpha: 1,
      });
    });

    it('handles whitespace around slash', () => {
      expect(parseOklch('oklch(0.6 0.15 50  /  0.5)')).toEqual({
        space: 'oklch',
        l: 0.6,
        c: 0.15,
        h: 50,
        alpha: 0.5,
      });
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseOklch('')).toBeNull();
    });

    it('returns null for non-oklch function', () => {
      expect(parseOklch('rgb(255, 0, 0)')).toBeNull();
    });

    it('returns null for insufficient arguments', () => {
      expect(parseOklch('oklch(0.6 0.15)')).toBeNull();
    });

    it('rejects comma syntax', () => {
      expect(parseOklch('oklch(0.6, 0.15, 50)')).toBeNull();
    });

    it('returns null for invalid tokens', () => {
      expect(parseOklch('oklch(abc 0.15 50)')).toBeNull();
    });

    it('returns null for empty function body', () => {
      expect(parseOklch('oklch()')).toBeNull();
    });

    it('returns null for invalid alpha', () => {
      expect(parseOklch('oklch(0.6 0.15 50 / abc)')).toBeNull();
    });
  });
});
