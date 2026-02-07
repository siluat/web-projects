import { describe, expect, it } from 'vitest';
import { parseColor } from '../parse.js';

describe('parseColor', () => {
  describe('HEX parsing', () => {
    it('parses #fff', () => {
      expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('parses #ffffff', () => {
      expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('parses #FFF (case-insensitive)', () => {
      expect(parseColor('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('parses #FFFFFF (case-insensitive)', () => {
      expect(parseColor('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('parses #000', () => {
      expect(parseColor('#000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('parses #000000', () => {
      expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('HEX + Alpha', () => {
    it('parses #fff8', () => {
      const result = parseColor('#fff8');
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
      expect(result.a).toBeCloseTo(0x88 / 255);
    });

    it('parses #ffffff80', () => {
      const result = parseColor('#ffffff80');
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
      expect(result.a).toBeCloseTo(128 / 255);
    });
  });

  describe('RGB function', () => {
    it('parses rgb(255, 255, 255)', () => {
      expect(parseColor('rgb(255, 255, 255)')).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
    });

    it('parses rgb(0, 0, 0)', () => {
      expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('RGBA function', () => {
    it('parses rgba(255, 255, 255, 0.5)', () => {
      expect(parseColor('rgba(255, 255, 255, 0.5)')).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.5,
      });
    });
  });

  describe('Named colors', () => {
    it('parses white', () => {
      expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('parses black', () => {
      expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('parses red', () => {
      expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('parses rebeccapurple', () => {
      expect(parseColor('rebeccapurple')).toEqual({
        r: 102,
        g: 51,
        b: 153,
      });
    });
  });

  describe('Errors', () => {
    it('throws on empty string', () => {
      expect(() => parseColor('')).toThrow('Unsupported color format');
    });

    it('throws on invalid format', () => {
      expect(() => parseColor('not-a-color')).toThrow(
        'Unsupported color format',
      );
    });
  });
});
