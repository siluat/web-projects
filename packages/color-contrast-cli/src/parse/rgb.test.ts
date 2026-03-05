import { describe, expect, it } from 'bun:test';
import { parseHex } from './hex';
import { parseRgb } from './rgb';

describe('parseRgb', () => {
  describe('space-separated syntax', () => {
    it('parses rgb(255 0 0)', () => {
      expect(parseRgb('rgb(255 0 0)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses rgb with alpha number: rgb(255 0 0 / 0.5)', () => {
      expect(parseRgb('rgb(255 0 0 / 0.5)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0.5,
      });
    });

    it('parses rgb with alpha percentage: rgb(255 0 0 / 50%)', () => {
      expect(parseRgb('rgb(255 0 0 / 50%)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0.5,
      });
    });
  });

  describe('comma-separated syntax', () => {
    it('parses rgb(255, 0, 0)', () => {
      expect(parseRgb('rgb(255, 0, 0)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses rgb with alpha number: rgb(255, 0, 0, 0.5)', () => {
      expect(parseRgb('rgb(255, 0, 0, 0.5)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0.5,
      });
    });
  });

  describe('percentage channels', () => {
    it('parses rgb(100% 0% 0%)', () => {
      expect(parseRgb('rgb(100% 0% 0%)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses rgb(100%, 0%, 0%)', () => {
      expect(parseRgb('rgb(100%, 0%, 0%)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses percentage channels with alpha: rgb(100% 0% 0% / 50%)', () => {
      expect(parseRgb('rgb(100% 0% 0% / 50%)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0.5,
      });
    });
  });

  describe('rgba() alias', () => {
    it('parses rgba(255, 0, 0, 0.5)', () => {
      expect(parseRgb('rgba(255, 0, 0, 0.5)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0.5,
      });
    });

    it('parses rgba(255 0 0 / 0.5)', () => {
      expect(parseRgb('rgba(255 0 0 / 0.5)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0.5,
      });
    });
  });

  describe('out-of-range clamping', () => {
    it('clamps channel values above 255', () => {
      expect(parseRgb('rgb(300 0 0)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('clamps channel values below 0', () => {
      expect(parseRgb('rgb(-10 0 0)')).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('clamps percentage channels above 100%', () => {
      expect(parseRgb('rgb(150% 0% 0%)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('clamps alpha above 1', () => {
      expect(parseRgb('rgb(255 0 0 / 1.5)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('clamps alpha below 0', () => {
      expect(parseRgb('rgb(255 0 0 / -0.5)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0,
      });
    });
  });

  describe('case insensitivity', () => {
    it('parses RGB(255, 0, 0)', () => {
      expect(parseRgb('RGB(255, 0, 0)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses Rgb(255, 0, 0)', () => {
      expect(parseRgb('Rgb(255, 0, 0)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });
  });

  describe('whitespace tolerance', () => {
    it('handles extra internal whitespace', () => {
      expect(parseRgb('rgb(  255  0  0  )')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('handles whitespace around commas', () => {
      expect(parseRgb('rgb( 255 , 0 , 0 )')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('handles whitespace around slash', () => {
      expect(parseRgb('rgb(255 0 0  /  0.5)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0.5,
      });
    });
  });

  describe('edge cases', () => {
    it('parses fractional channel values like 127.5', () => {
      expect(parseRgb('rgb(127.5 0 0)')).toEqual({
        space: 'srgb',
        r: 127.5 / 255,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses shorthand decimal .5', () => {
      expect(parseRgb('rgb(255 0 0 / .5)')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 0.5,
      });
    });

    it('parses rgb(0 0 0) as black', () => {
      expect(parseRgb('rgb(0 0 0)')).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('normalizes mid-range values correctly', () => {
      expect(parseRgb('rgb(128 64 32)')).toEqual({
        space: 'srgb',
        r: 128 / 255,
        g: 64 / 255,
        b: 32 / 255,
        alpha: 1,
      });
    });

    it('normalizes mid-range percentage values correctly', () => {
      expect(parseRgb('rgb(50% 25% 75%)')).toEqual({
        space: 'srgb',
        r: 0.5,
        g: 0.25,
        b: 0.75,
        alpha: 1,
      });
    });
  });

  describe('equivalence with hex parser', () => {
    it('rgb(255, 0, 0) equals #ff0000', () => {
      expect(parseRgb('rgb(255, 0, 0)')).toEqual(parseHex('#ff0000'));
    });

    it('rgb(0 0 0) equals #000000', () => {
      expect(parseRgb('rgb(0 0 0)')).toEqual(parseHex('#000000'));
    });

    it('rgb(255 255 255) equals #ffffff', () => {
      expect(parseRgb('rgb(255 255 255)')).toEqual(parseHex('#ffffff'));
    });

    it('rgba(0, 0, 0, 0) equals #00000000', () => {
      expect(parseRgb('rgba(0, 0, 0, 0)')).toEqual(parseHex('#00000000'));
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseRgb('')).toBeNull();
    });

    it('returns null for non-rgb function', () => {
      expect(parseRgb('hsl(0, 100%, 50%)')).toBeNull();
    });

    it('returns null for insufficient arguments', () => {
      expect(parseRgb('rgb(255 0)')).toBeNull();
    });

    it('returns null for too many arguments', () => {
      expect(parseRgb('rgb(255 0 0 0 0)')).toBeNull();
    });

    it('returns null for mixed number and percentage channels', () => {
      expect(parseRgb('rgb(255 0% 0)')).toBeNull();
    });

    it('returns null for mixed syntax (comma + slash)', () => {
      expect(parseRgb('rgb(255, 0, 0 / 0.5)')).toBeNull();
    });

    it('returns null for invalid tokens', () => {
      expect(parseRgb('rgb(abc 0 0)')).toBeNull();
    });

    it('returns null for empty function body', () => {
      expect(parseRgb('rgb()')).toBeNull();
    });

    it('returns null for hex string', () => {
      expect(parseRgb('#ff0000')).toBeNull();
    });

    it('returns null for invalid alpha in comma syntax', () => {
      expect(parseRgb('rgb(255, 0, 0, abc)')).toBeNull();
    });

    it('returns null for invalid alpha in space syntax', () => {
      expect(parseRgb('rgb(255 0 0 / abc)')).toBeNull();
    });
  });
});
