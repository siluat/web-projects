import { describe, expect, it } from 'bun:test';
import { parseBatchLine } from './parse-line';

describe('parseBatchLine', () => {
  describe('hex colors', () => {
    it('splits two hex colors by space', () => {
      expect(parseBatchLine('#000 #fff')).toEqual({
        kind: 'pair',
        foreground: '#000',
        background: '#fff',
      });
    });

    it('splits 6-digit hex colors', () => {
      expect(parseBatchLine('#333333 #cccccc')).toEqual({
        kind: 'pair',
        foreground: '#333333',
        background: '#cccccc',
      });
    });

    it('splits hex colors by tab', () => {
      expect(parseBatchLine('#000\t#fff')).toEqual({
        kind: 'pair',
        foreground: '#000',
        background: '#fff',
      });
    });
  });

  describe('named colors', () => {
    it('splits two named colors', () => {
      expect(parseBatchLine('black white')).toEqual({
        kind: 'pair',
        foreground: 'black',
        background: 'white',
      });
    });

    it('splits named color and hex', () => {
      expect(parseBatchLine('red #ffffff')).toEqual({
        kind: 'pair',
        foreground: 'red',
        background: '#ffffff',
      });
    });
  });

  describe('functional colors (bracket-aware splitting)', () => {
    it('splits rgb() with spaces inside parentheses', () => {
      expect(parseBatchLine('rgb(255, 0, 0) white')).toEqual({
        kind: 'pair',
        foreground: 'rgb(255, 0, 0)',
        background: 'white',
      });
    });

    it('splits rgb() with modern space syntax', () => {
      expect(parseBatchLine('rgb(255 0 0) #fff')).toEqual({
        kind: 'pair',
        foreground: 'rgb(255 0 0)',
        background: '#fff',
      });
    });

    it('splits two functional colors', () => {
      expect(parseBatchLine('rgb(255, 0, 0) hsl(120, 100%, 50%)')).toEqual({
        kind: 'pair',
        foreground: 'rgb(255, 0, 0)',
        background: 'hsl(120, 100%, 50%)',
      });
    });

    it('splits oklch() and hex', () => {
      expect(parseBatchLine('oklch(60% 0.15 50) #ffffff')).toEqual({
        kind: 'pair',
        foreground: 'oklch(60% 0.15 50)',
        background: '#ffffff',
      });
    });

    it('splits lab() and named color', () => {
      expect(parseBatchLine('lab(50% 40 59.5) white')).toEqual({
        kind: 'pair',
        foreground: 'lab(50% 40 59.5)',
        background: 'white',
      });
    });

    it('splits rgba() with alpha', () => {
      expect(parseBatchLine('rgba(0, 0, 0, 0.5) #fff')).toEqual({
        kind: 'pair',
        foreground: 'rgba(0, 0, 0, 0.5)',
        background: '#fff',
      });
    });

    it('prefers tab over bracket-aware space splitting', () => {
      expect(parseBatchLine('oklch(60% 0.15 50)\t#ffffff')).toEqual({
        kind: 'pair',
        foreground: 'oklch(60% 0.15 50)',
        background: '#ffffff',
      });
    });

    it('ignores tabs inside parentheses', () => {
      expect(parseBatchLine('rgb(255,\t0,\t0)\t#fff')).toEqual({
        kind: 'pair',
        foreground: 'rgb(255,\t0,\t0)',
        background: '#fff',
      });
    });
  });

  describe('skip lines', () => {
    it('skips empty lines', () => {
      expect(parseBatchLine('')).toEqual({ kind: 'skip' });
    });

    it('skips whitespace-only lines', () => {
      expect(parseBatchLine('   ')).toEqual({ kind: 'skip' });
    });

    it('skips comment lines', () => {
      expect(parseBatchLine('// Design system audit')).toEqual({
        kind: 'skip',
      });
    });

    it('skips comment lines with leading whitespace', () => {
      expect(parseBatchLine('  // indented comment')).toEqual({ kind: 'skip' });
    });
  });

  describe('error cases', () => {
    it('errors on single color without separator', () => {
      const result = parseBatchLine('#000');
      expect(result.kind).toBe('error');
    });

    it('errors on single named color', () => {
      const result = parseBatchLine('red');
      expect(result.kind).toBe('error');
    });

    it('errors on tab with empty foreground', () => {
      const result = parseBatchLine('\t#fff');
      expect(result.kind).toBe('error');
    });

    it('errors on tab with empty background', () => {
      const result = parseBatchLine('#000\t');
      expect(result.kind).toBe('error');
    });
  });

  describe('whitespace handling', () => {
    it('trims leading and trailing whitespace', () => {
      expect(parseBatchLine('  #000 #fff  ')).toEqual({
        kind: 'pair',
        foreground: '#000',
        background: '#fff',
      });
    });

    it('trims whitespace around tab-separated values', () => {
      expect(parseBatchLine('  #000 \t #fff  ')).toEqual({
        kind: 'pair',
        foreground: '#000',
        background: '#fff',
      });
    });
  });
});
