import { describe, expect, it } from 'bun:test';
import { parseLab } from './lab';

describe('parseLab', () => {
  describe('space-separated syntax', () => {
    it('parses lab(50 25 -25)', () => {
      expect(parseLab('lab(50 25 -25)')).toEqual({
        space: 'lab',
        l: 50,
        a: 25,
        b: -25,
        alpha: 1,
      });
    });

    it('parses lab with alpha number: lab(50 25 -25 / 0.5)', () => {
      expect(parseLab('lab(50 25 -25 / 0.5)')).toEqual({
        space: 'lab',
        l: 50,
        a: 25,
        b: -25,
        alpha: 0.5,
      });
    });

    it('parses lab with alpha percentage: lab(50 25 -25 / 50%)', () => {
      expect(parseLab('lab(50 25 -25 / 50%)')).toEqual({
        space: 'lab',
        l: 50,
        a: 25,
        b: -25,
        alpha: 0.5,
      });
    });

    it('parses lab(0 0 0) — black', () => {
      expect(parseLab('lab(0 0 0)')).toEqual({
        space: 'lab',
        l: 0,
        a: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses lab(100 0 0) — white', () => {
      expect(parseLab('lab(100 0 0)')).toEqual({
        space: 'lab',
        l: 100,
        a: 0,
        b: 0,
        alpha: 1,
      });
    });
  });

  describe('percentage channels', () => {
    it('maps L 50% to 50', () => {
      expect(parseLab('lab(50% 0 0)')?.l).toBe(50);
    });

    it('maps L 100% to 100', () => {
      expect(parseLab('lab(100% 0 0)')?.l).toBe(100);
    });

    it('maps a 100% to 125', () => {
      expect(parseLab('lab(50 100% 0)')?.a).toBe(125);
    });

    it('maps a -100% to -125', () => {
      expect(parseLab('lab(50 -100% 0)')?.a).toBe(-125);
    });

    it('maps b 50% to 62.5', () => {
      expect(parseLab('lab(50 0 50%)')?.b).toBe(62.5);
    });

    it('maps b -50% to -62.5', () => {
      expect(parseLab('lab(50 0 -50%)')?.b).toBe(-62.5);
    });

    it('maps all channels as percentages', () => {
      expect(parseLab('lab(50% 50% -50%)')).toEqual({
        space: 'lab',
        l: 50,
        a: 62.5,
        b: -62.5,
        alpha: 1,
      });
    });
  });

  describe('no clamping on channels', () => {
    it('allows L above 100', () => {
      expect(parseLab('lab(150 0 0)')?.l).toBe(150);
    });

    it('allows L below 0', () => {
      expect(parseLab('lab(-10 0 0)')?.l).toBe(-10);
    });

    it('allows a beyond reference range', () => {
      expect(parseLab('lab(50 200 0)')?.a).toBe(200);
    });

    it('allows b beyond reference range', () => {
      expect(parseLab('lab(50 0 -200)')?.b).toBe(-200);
    });
  });

  describe('alpha clamping', () => {
    it('clamps alpha above 1', () => {
      expect(parseLab('lab(50 0 0 / 1.5)')?.alpha).toBe(1);
    });

    it('clamps alpha below 0', () => {
      expect(parseLab('lab(50 0 0 / -0.5)')?.alpha).toBe(0);
    });
  });

  describe('case insensitivity', () => {
    it('parses LAB(50 25 -25)', () => {
      expect(parseLab('LAB(50 25 -25)')).toEqual({
        space: 'lab',
        l: 50,
        a: 25,
        b: -25,
        alpha: 1,
      });
    });

    it('parses Lab(50 25 -25)', () => {
      expect(parseLab('Lab(50 25 -25)')?.l).toBe(50);
    });
  });

  describe('whitespace tolerance', () => {
    it('handles extra internal whitespace', () => {
      expect(parseLab('lab(  50  25  -25  )')).toEqual({
        space: 'lab',
        l: 50,
        a: 25,
        b: -25,
        alpha: 1,
      });
    });

    it('handles whitespace around slash', () => {
      expect(parseLab('lab(50 25 -25  /  0.5)')).toEqual({
        space: 'lab',
        l: 50,
        a: 25,
        b: -25,
        alpha: 0.5,
      });
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseLab('')).toBeNull();
    });

    it('returns null for non-lab function', () => {
      expect(parseLab('rgb(255, 0, 0)')).toBeNull();
    });

    it('returns null for insufficient arguments', () => {
      expect(parseLab('lab(50 25)')).toBeNull();
    });

    it('returns null for too many arguments', () => {
      expect(parseLab('lab(50 25 -25 10)')).toBeNull();
    });

    it('rejects comma syntax', () => {
      expect(parseLab('lab(50, 25, -25)')).toBeNull();
    });

    it('returns null for invalid tokens', () => {
      expect(parseLab('lab(abc 0 0)')).toBeNull();
    });

    it('returns null for empty function body', () => {
      expect(parseLab('lab()')).toBeNull();
    });

    it('returns null for invalid alpha', () => {
      expect(parseLab('lab(50 0 0 / abc)')).toBeNull();
    });
  });
});
