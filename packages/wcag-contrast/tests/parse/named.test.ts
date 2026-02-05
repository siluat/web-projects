import { describe, expect, it } from 'vitest';
import { parseNamed } from '../../src/parse/named';

describe('parseNamed', () => {
  describe('basic colors', () => {
    it('should parse red', () => {
      expect(parseNamed('red')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse green', () => {
      expect(parseNamed('green')).toEqual({ r: 0, g: 128, b: 0 });
    });

    it('should parse blue', () => {
      expect(parseNamed('blue')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should parse black', () => {
      expect(parseNamed('black')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse white', () => {
      expect(parseNamed('white')).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe('case insensitivity', () => {
    it('should parse RED', () => {
      expect(parseNamed('RED')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse Red', () => {
      expect(parseNamed('Red')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse rEd', () => {
      expect(parseNamed('rEd')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse CORNFLOWERBLUE', () => {
      expect(parseNamed('CORNFLOWERBLUE')).toEqual({ r: 100, g: 149, b: 237 });
    });
  });

  describe('transparent', () => {
    it('should parse transparent with alpha 0', () => {
      expect(parseNamed('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    });

    it('should parse TRANSPARENT', () => {
      expect(parseNamed('TRANSPARENT')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    });
  });

  describe('extended colors', () => {
    it('should parse rebeccapurple', () => {
      expect(parseNamed('rebeccapurple')).toEqual({ r: 102, g: 51, b: 153 });
    });

    it('should parse aliceblue', () => {
      expect(parseNamed('aliceblue')).toEqual({ r: 240, g: 248, b: 255 });
    });

    it('should parse coral', () => {
      expect(parseNamed('coral')).toEqual({ r: 255, g: 127, b: 80 });
    });

    it('should parse darkgoldenrod', () => {
      expect(parseNamed('darkgoldenrod')).toEqual({ r: 184, g: 134, b: 11 });
    });
  });

  describe('gray variants', () => {
    it('should parse gray', () => {
      expect(parseNamed('gray')).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('should parse grey (British spelling)', () => {
      expect(parseNamed('grey')).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('should parse darkgray', () => {
      expect(parseNamed('darkgray')).toEqual({ r: 169, g: 169, b: 169 });
    });

    it('should parse darkgrey', () => {
      expect(parseNamed('darkgrey')).toEqual({ r: 169, g: 169, b: 169 });
    });
  });

  describe('invalid inputs', () => {
    it('should return null for invalid color name', () => {
      expect(parseNamed('invalid')).toBeNull();
      expect(parseNamed('notacolor')).toBeNull();
    });

    it('should return null for hex format', () => {
      expect(parseNamed('#fff')).toBeNull();
    });

    it('should return null for rgb format', () => {
      expect(parseNamed('rgb(255, 0, 0)')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseNamed('')).toBeNull();
    });

    it('should return null for whitespace only', () => {
      expect(parseNamed('   ')).toBeNull();
    });
  });

  describe('whitespace handling', () => {
    it('should handle leading/trailing whitespace', () => {
      expect(parseNamed('  red  ')).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('immutability', () => {
    it('should return a new object each time', () => {
      const result1 = parseNamed('red');
      const result2 = parseNamed('red');
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });
});
