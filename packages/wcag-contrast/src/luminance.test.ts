import { describe, expect, it } from 'bun:test';
import { relativeLuminance } from './luminance';

describe('relativeLuminance', () => {
  it('returns 0 for black', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it('returns 1 for white', () => {
    expect(relativeLuminance({ r: 1, g: 1, b: 1 })).toBe(1);
  });

  it('returns 0.2126 for pure red', () => {
    expect(relativeLuminance({ r: 1, g: 0, b: 0 })).toBe(0.2126);
  });

  it('returns 0.7152 for pure green', () => {
    expect(relativeLuminance({ r: 0, g: 1, b: 0 })).toBe(0.7152);
  });

  it('returns 0.0722 for pure blue', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 1 })).toBe(0.0722);
  });
});
