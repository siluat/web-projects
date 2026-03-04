import { describe, expect, it } from 'bun:test';
import { alphaComposite } from './alpha-composite';
import type { SRGBColor } from './types';

/** Helper to create SRGBColor values concisely. */
function srgb(r: number, g: number, b: number, alpha = 1): SRGBColor {
  return { space: 'srgb', r, g, b, alpha };
}

describe('alphaComposite', () => {
  it('returns opaque colors unchanged', () => {
    const [fg, bg] = alphaComposite(srgb(0, 0, 0), srgb(1, 1, 1));
    expect(fg).toEqual({ r: 0, g: 0, b: 0 });
    expect(bg).toEqual({ r: 1, g: 1, b: 1 });
  });

  it('composites rgba(0,0,0,0.5) over white to mid-gray', () => {
    const [fg, bg] = alphaComposite(srgb(0, 0, 0, 0.5), srgb(1, 1, 1));
    expect(fg).toEqual({ r: 0.5, g: 0.5, b: 0.5 });
    expect(bg).toEqual({ r: 1, g: 1, b: 1 });
  });

  it('composites semi-transparent red over white', () => {
    const [fg, bg] = alphaComposite(srgb(1, 0, 0, 0.5), srgb(1, 1, 1));
    expect(fg).toEqual({ r: 1, g: 0.5, b: 0.5 });
    expect(bg).toEqual({ r: 1, g: 1, b: 1 });
  });

  it('composites fully transparent foreground to background', () => {
    const [fg, bg] = alphaComposite(srgb(0, 0, 0, 0), srgb(1, 1, 1));
    expect(fg).toEqual({ r: 1, g: 1, b: 1 });
    expect(bg).toEqual({ r: 1, g: 1, b: 1 });
  });

  it('composites opaque foreground over semi-transparent background', () => {
    const [fg, bg] = alphaComposite(srgb(0, 0, 0), srgb(0, 0, 0, 0.5));
    expect(fg).toEqual({ r: 0, g: 0, b: 0 });
    expect(bg).toEqual({ r: 0.5, g: 0.5, b: 0.5 });
  });

  it('composites both semi-transparent colors', () => {
    const [fg, bg] = alphaComposite(srgb(0, 0, 0, 0.5), srgb(0, 0, 0, 0.5));
    expect(fg).toEqual({ r: 0.25, g: 0.25, b: 0.25 });
    expect(bg).toEqual({ r: 0.5, g: 0.5, b: 0.5 });
  });

  it('handles floating-point channel values', () => {
    const [fg, bg] = alphaComposite(
      srgb(0.2, 0.4, 0.6, 0.8),
      srgb(0.9, 0.7, 0.3),
    );
    // bg is opaque, composited over white → unchanged
    expect(bg).toEqual({ r: 0.9, g: 0.7, b: 0.3 });
    // fg composited over bg: alpha * fg + (1 - alpha) * bg
    expect(fg.r).toBeCloseTo(0.8 * 0.2 + 0.2 * 0.9, 10);
    expect(fg.g).toBeCloseTo(0.8 * 0.4 + 0.2 * 0.7, 10);
    expect(fg.b).toBeCloseTo(0.8 * 0.6 + 0.2 * 0.3, 10);
  });
});
