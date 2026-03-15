import { describe, expect, it } from 'bun:test';
import type { SRGBColor } from '../types';
import { srgbToOklch } from './srgb-to-oklch';

function srgb(r: number, g: number, b: number, alpha = 1): SRGBColor {
  return { space: 'srgb', r, g, b, alpha };
}

describe('srgbToOklch', () => {
  it('converts black (0, 0, 0) -> L=0, C=0', () => {
    const result = srgbToOklch(srgb(0, 0, 0));
    expect(result.l).toBe(0);
    expect(result.c).toBe(0);
  });

  it('converts white (1, 1, 1) -> L≈1, C≈0', () => {
    const result = srgbToOklch(srgb(1, 1, 1));
    expect(result.l).toBeCloseTo(1, 4);
    expect(result.c).toBeCloseTo(0, 4);
  });

  it('converts sRGB red (1, 0, 0) -> OKLCH (~0.628, ~0.258, ~29.2)', () => {
    const result = srgbToOklch(srgb(1, 0, 0));
    // Derived from xyz-to-oklab.test.ts OKLAB reference values for sRGB red
    // (Color.js 0.6.1): L = 0.6279553639846869, a = 0.22486306106597398, b = 0.1258462985307351
    // C = hypot(a, b) = 0.25768330773615683
    // H = atan2(b, a) * 180/π = 29.2338851923426
    expect(result.l).toBeCloseTo(0.6279553639846869, 4);
    expect(result.c).toBeCloseTo(0.25768330773615683, 6);
    expect(result.h).toBeCloseTo(29.2338851923426, 4);
  });

  it('preserves alpha', () => {
    const result = srgbToOklch(srgb(0.5, 0.5, 0.5, 0.5));
    expect(result.alpha).toBe(0.5);
  });

  it('output has space tag oklch', () => {
    const result = srgbToOklch(srgb(0, 0, 0));
    expect(result.space).toBe('oklch');
  });
});
