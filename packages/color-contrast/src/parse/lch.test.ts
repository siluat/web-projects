import { describe, expect, it } from 'bun:test';
import { parseLch } from './lch';

describe('parseLch', () => {
  describe('space-separated syntax', () => {
    it('parses lch(50 30 120)', () => {
      expect(parseLch('lch(50 30 120)')).toEqual({
        space: 'lch',
        l: 50,
        c: 30,
        h: 120,
        alpha: 1,
      });
    });

    it('parses lch with alpha number: lch(50 30 120 / 0.5)', () => {
      expect(parseLch('lch(50 30 120 / 0.5)')).toEqual({
        space: 'lch',
        l: 50,
        c: 30,
        h: 120,
        alpha: 0.5,
      });
    });

    it('parses lch with alpha percentage: lch(50 30 120 / 50%)', () => {
      expect(parseLch('lch(50 30 120 / 50%)')).toEqual({
        space: 'lch',
        l: 50,
        c: 30,
        h: 120,
        alpha: 0.5,
      });
    });

    it('parses lch(0 0 0) — black', () => {
      expect(parseLch('lch(0 0 0)')).toEqual({
        space: 'lch',
        l: 0,
        c: 0,
        h: 0,
        alpha: 1,
      });
    });
  });

  describe('percentage channels', () => {
    it('maps L 50% to 50', () => {
      expect(parseLch('lch(50% 0 0)')?.l).toBe(50);
    });

    it('maps L 100% to 100', () => {
      expect(parseLch('lch(100% 0 0)')?.l).toBe(100);
    });

    it('maps C 100% to 150', () => {
      expect(parseLch('lch(50 100% 0)')?.c).toBe(150);
    });

    it('maps C 50% to 75', () => {
      expect(parseLch('lch(50 50% 0)')?.c).toBe(75);
    });
  });

  describe('hue angle units', () => {
    it('parses deg unit: lch(50 30 120deg)', () => {
      expect(parseLch('lch(50 30 120deg)')?.h).toBe(120);
    });

    it('parses rad unit: lch(50 30 3.14159rad)', () => {
      expect(parseLch('lch(50 30 3.14159rad)')?.h).toBeCloseTo(180, 2);
    });

    it('parses grad unit: lch(50 30 400grad)', () => {
      expect(parseLch('lch(50 30 400grad)')?.h).toBe(0);
    });

    it('parses turn unit: lch(50 30 0.5turn)', () => {
      expect(parseLch('lch(50 30 0.5turn)')?.h).toBe(180);
    });
  });

  describe('hue wrapping', () => {
    it('wraps 370 to 10 degrees', () => {
      expect(parseLch('lch(50 30 370)')?.h).toBeCloseTo(10, 10);
    });

    it('wraps -10 to 350 degrees', () => {
      expect(parseLch('lch(50 30 -10)')?.h).toBeCloseTo(350, 10);
    });

    it('wraps 720 to 0 degrees', () => {
      expect(parseLch('lch(50 30 720)')?.h).toBe(0);
    });

    it('wraps 360 to 0 degrees', () => {
      expect(parseLch('lch(50 30 360)')?.h).toBe(0);
    });
  });

  describe('no clamping on L and C', () => {
    it('allows L above 100', () => {
      expect(parseLch('lch(150 30 0)')?.l).toBe(150);
    });

    it('allows L below 0', () => {
      expect(parseLch('lch(-10 30 0)')?.l).toBe(-10);
    });

    it('allows C beyond reference range', () => {
      expect(parseLch('lch(50 300 0)')?.c).toBe(300);
    });
  });

  describe('alpha clamping', () => {
    it('clamps alpha above 1', () => {
      expect(parseLch('lch(50 30 120 / 1.5)')?.alpha).toBe(1);
    });

    it('clamps alpha below 0', () => {
      expect(parseLch('lch(50 30 120 / -0.5)')?.alpha).toBe(0);
    });
  });

  describe('case insensitivity', () => {
    it('parses LCH(50 30 120)', () => {
      expect(parseLch('LCH(50 30 120)')?.l).toBe(50);
    });

    it('parses lch(50 30 120DEG)', () => {
      expect(parseLch('lch(50 30 120DEG)')?.h).toBe(120);
    });
  });

  describe('whitespace tolerance', () => {
    it('handles extra internal whitespace', () => {
      expect(parseLch('lch(  50  30  120  )')).toEqual({
        space: 'lch',
        l: 50,
        c: 30,
        h: 120,
        alpha: 1,
      });
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseLch('')).toBeNull();
    });

    it('returns null for non-lch function', () => {
      expect(parseLch('rgb(255, 0, 0)')).toBeNull();
    });

    it('returns null for insufficient arguments', () => {
      expect(parseLch('lch(50 30)')).toBeNull();
    });

    it('rejects comma syntax', () => {
      expect(parseLch('lch(50, 30, 120)')).toBeNull();
    });

    it('returns null for invalid tokens', () => {
      expect(parseLch('lch(abc 30 120)')).toBeNull();
    });

    it('returns null for empty function body', () => {
      expect(parseLch('lch()')).toBeNull();
    });

    it('returns null for invalid alpha', () => {
      expect(parseLch('lch(50 30 120 / abc)')).toBeNull();
    });
  });
});
