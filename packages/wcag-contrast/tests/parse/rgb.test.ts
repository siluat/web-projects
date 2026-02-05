import { describe, expect, it } from 'vitest';
import { parseRgb } from '../../src/parse/rgb';

describe('parseRgb', () => {
  describe('comma syntax', () => {
    it('should parse rgb(255, 128, 0)', () => {
      expect(parseRgb('rgb(255, 128, 0)')).toEqual({ r: 255, g: 128, b: 0 });
    });

    it('should parse rgb(0, 0, 0)', () => {
      expect(parseRgb('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse rgb(255, 255, 255)', () => {
      expect(parseRgb('rgb(255, 255, 255)')).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
    });

    it('should parse rgba(255, 128, 0, 0.5)', () => {
      expect(parseRgb('rgba(255, 128, 0, 0.5)')).toEqual({
        r: 255,
        g: 128,
        b: 0,
        a: 0.5,
      });
    });

    it('should parse rgba with alpha 0', () => {
      expect(parseRgb('rgba(255, 0, 0, 0)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0,
      });
    });

    it('should parse rgba with alpha 1', () => {
      expect(parseRgb('rgba(255, 0, 0, 1)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      });
    });
  });

  describe('space syntax', () => {
    it('should parse rgb(255 128 0)', () => {
      expect(parseRgb('rgb(255 128 0)')).toEqual({ r: 255, g: 128, b: 0 });
    });

    it('should parse rgb(255 128 0 / 0.5)', () => {
      expect(parseRgb('rgb(255 128 0 / 0.5)')).toEqual({
        r: 255,
        g: 128,
        b: 0,
        a: 0.5,
      });
    });

    it('should parse rgb(255 128 0 / 50%)', () => {
      expect(parseRgb('rgb(255 128 0 / 50%)')).toEqual({
        r: 255,
        g: 128,
        b: 0,
        a: 0.5,
      });
    });
  });

  describe('percentage values', () => {
    it('should parse rgb(100%, 50%, 0%)', () => {
      expect(parseRgb('rgb(100%, 50%, 0%)')).toEqual({ r: 255, g: 128, b: 0 });
    });

    it('should parse rgb(0%, 0%, 0%)', () => {
      expect(parseRgb('rgb(0%, 0%, 0%)')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse rgb(100%, 100%, 100%)', () => {
      expect(parseRgb('rgb(100%, 100%, 100%)')).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
    });

    it('should parse rgba with percentage alpha', () => {
      expect(parseRgb('rgba(100%, 0%, 0%, 50%)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0.5,
      });
    });
  });

  describe('value clamping', () => {
    it('should clamp values over 255', () => {
      expect(parseRgb('rgb(300, 400, 500)')).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
    });

    it('should clamp negative values to 0', () => {
      expect(parseRgb('rgb(-10, -20, -30)')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should clamp alpha over 1', () => {
      expect(parseRgb('rgba(255, 0, 0, 1.5)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      });
    });

    it('should clamp negative alpha to 0', () => {
      expect(parseRgb('rgba(255, 0, 0, -0.5)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0,
      });
    });

    it('should clamp percentage over 100%', () => {
      expect(parseRgb('rgb(150%, 200%, 300%)')).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
    });
  });

  describe('case insensitivity', () => {
    it('should parse RGB(...)', () => {
      expect(parseRgb('RGB(255, 128, 0)')).toEqual({ r: 255, g: 128, b: 0 });
    });

    it('should parse RGBA(...)', () => {
      expect(parseRgb('RGBA(255, 128, 0, 0.5)')).toEqual({
        r: 255,
        g: 128,
        b: 0,
        a: 0.5,
      });
    });
  });

  describe('invalid inputs', () => {
    it('should return null for non-rgb format', () => {
      expect(parseRgb('#fff')).toBeNull();
      expect(parseRgb('hsl(0, 100%, 50%)')).toBeNull();
      expect(parseRgb('red')).toBeNull();
    });

    it('should return null for wrong number of values', () => {
      expect(parseRgb('rgb(255, 128)')).toBeNull();
      expect(parseRgb('rgb(255, 128, 0, 0.5, 1)')).toBeNull();
    });

    it('should return null for mixed percentage and number', () => {
      expect(parseRgb('rgb(255, 50%, 0)')).toBeNull();
    });

    it('should return null for invalid values', () => {
      expect(parseRgb('rgb(abc, def, ghi)')).toBeNull();
    });

    it('should return null for empty input', () => {
      expect(parseRgb('')).toBeNull();
      expect(parseRgb('rgb()')).toBeNull();
    });
  });

  describe('whitespace handling', () => {
    it('should handle extra whitespace', () => {
      expect(parseRgb('  rgb( 255 , 128 , 0 )  ')).toEqual({
        r: 255,
        g: 128,
        b: 0,
      });
    });

    it('should handle multiple spaces in space syntax', () => {
      expect(parseRgb('rgb(255   128   0)')).toEqual({ r: 255, g: 128, b: 0 });
    });
  });
});
