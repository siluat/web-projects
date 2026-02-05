import { describe, expect, it } from 'vitest';
import { parseHsl } from '../../src/parse/hsl';

describe('parseHsl', () => {
  describe('comma syntax', () => {
    it('should parse hsl(0, 100%, 50%) to red', () => {
      const result = parseHsl('hsl(0, 100%, 50%)');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
    });

    it('should parse hsl(120, 100%, 50%) to green', () => {
      const result = parseHsl('hsl(120, 100%, 50%)');
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(0);
    });

    it('should parse hsl(240, 100%, 50%) to blue', () => {
      const result = parseHsl('hsl(240, 100%, 50%)');
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(255);
    });

    it('should parse hsl(0, 0%, 0%) to black', () => {
      expect(parseHsl('hsl(0, 0%, 0%)')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse hsl(0, 0%, 100%) to white', () => {
      expect(parseHsl('hsl(0, 0%, 100%)')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse hsla(0, 100%, 50%, 0.5) with alpha', () => {
      const result = parseHsl('hsla(0, 100%, 50%, 0.5)');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
      expect(result?.a).toBe(0.5);
    });
  });

  describe('space syntax', () => {
    it('should parse hsl(180 50% 50%)', () => {
      const result = parseHsl('hsl(180 50% 50%)');
      expect(result).not.toBeNull();
      expect(result?.r).toBe(64);
      expect(result?.g).toBe(191);
      expect(result?.b).toBe(191);
    });

    it('should parse hsl(180 50% 50% / 0.5)', () => {
      const result = parseHsl('hsl(180 50% 50% / 0.5)');
      expect(result?.a).toBe(0.5);
    });

    it('should parse hsl(180 50% 50% / 50%)', () => {
      const result = parseHsl('hsl(180 50% 50% / 50%)');
      expect(result?.a).toBe(0.5);
    });
  });

  describe('hue units', () => {
    it('should parse hsl(180deg 50% 50%)', () => {
      const result = parseHsl('hsl(180deg 50% 50%)');
      expect(result?.r).toBe(64);
      expect(result?.g).toBe(191);
      expect(result?.b).toBe(191);
    });

    it('should parse hsl(0.5turn 100% 50%) to cyan', () => {
      const result = parseHsl('hsl(0.5turn 100% 50%)');
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(255);
    });

    it('should parse hsl(3.14159rad 100% 50%) approximately to cyan', () => {
      const result = parseHsl('hsl(3.14159rad 100% 50%)');
      // 3.14159 rad ≈ 180 deg
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(255);
    });

    it('should parse hsl(200grad 100% 50%)', () => {
      const result = parseHsl('hsl(200grad 100% 50%)');
      // 200 grad = 180 deg
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(255);
    });
  });

  describe('hue normalization', () => {
    it('should normalize hue > 360', () => {
      const result = parseHsl('hsl(720, 100%, 50%)');
      // 720 mod 360 = 0 (red)
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
    });

    it('should normalize negative hue', () => {
      const result = parseHsl('hsl(-120, 100%, 50%)');
      // -120 + 360 = 240 (blue)
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(255);
    });
  });

  describe('value clamping', () => {
    it('should clamp saturation over 100%', () => {
      const result = parseHsl('hsl(0, 150%, 50%)');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
    });

    it('should clamp lightness over 100%', () => {
      const result = parseHsl('hsl(0, 100%, 150%)');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(255);
    });

    it('should clamp negative saturation to 0', () => {
      const result = parseHsl('hsl(0, -50%, 50%)');
      // 0% saturation = gray
      expect(result?.r).toBe(128);
      expect(result?.g).toBe(128);
      expect(result?.b).toBe(128);
    });
  });

  describe('case insensitivity', () => {
    it('should parse HSL(...)', () => {
      const result = parseHsl('HSL(0, 100%, 50%)');
      expect(result?.r).toBe(255);
    });

    it('should parse HSLA(...)', () => {
      const result = parseHsl('HSLA(0, 100%, 50%, 0.5)');
      expect(result?.a).toBe(0.5);
    });
  });

  describe('invalid inputs', () => {
    it('should return null for non-hsl format', () => {
      expect(parseHsl('#fff')).toBeNull();
      expect(parseHsl('rgb(255, 0, 0)')).toBeNull();
      expect(parseHsl('red')).toBeNull();
    });

    it('should return null for missing percentage on saturation', () => {
      expect(parseHsl('hsl(0, 100, 50%)')).toBeNull();
    });

    it('should return null for missing percentage on lightness', () => {
      expect(parseHsl('hsl(0, 100%, 50)')).toBeNull();
    });

    it('should return null for wrong number of values', () => {
      expect(parseHsl('hsl(0, 100%)')).toBeNull();
      expect(parseHsl('hsl(0, 100%, 50%, 0.5, 1)')).toBeNull();
    });

    it('should return null for invalid values', () => {
      expect(parseHsl('hsl(abc, def%, ghi%)')).toBeNull();
    });

    it('should return null for empty input', () => {
      expect(parseHsl('')).toBeNull();
      expect(parseHsl('hsl()')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle hsl(60, 100%, 50%) - yellow', () => {
      const result = parseHsl('hsl(60, 100%, 50%)');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(0);
    });

    it('should handle hsl(300, 100%, 50%) - magenta', () => {
      const result = parseHsl('hsl(300, 100%, 50%)');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(255);
    });

    it('should handle gray (0% saturation)', () => {
      const result = parseHsl('hsl(0, 0%, 50%)');
      expect(result?.r).toBe(128);
      expect(result?.g).toBe(128);
      expect(result?.b).toBe(128);
    });
  });
});
