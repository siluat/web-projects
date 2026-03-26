import { describe, expect, it } from 'bun:test';
import { oklabToOklch } from './oklab-to-oklch';

/**
 * Reference values verified against Color.js 0.6.1.
 * Inverse of oklchToOklab: cartesian → polar.
 */
describe('oklabToOklch', () => {
  it('converts achromatic OKLAB (a=0, b=0) to OKLCH with C=0', () => {
    const result = oklabToOklch({
      space: 'oklab',
      l: 0.5,
      a: 0,
      b: 0,
      alpha: 1,
    });
    expect(result.space).toBe('oklch');
    expect(result.l).toBe(0.5);
    expect(result.c).toBe(0);
    // Hue is arbitrary for achromatic colors (atan2(0,0) = 0)
    expect(result.h).toBe(0);
    expect(result.alpha).toBe(1);
  });

  it('converts OKLAB black to OKLCH black', () => {
    const result = oklabToOklch({
      space: 'oklab',
      l: 0,
      a: 0,
      b: 0,
      alpha: 1,
    });
    expect(result.l).toBe(0);
    expect(result.c).toBe(0);
  });

  it('converts OKLAB white to OKLCH white', () => {
    const result = oklabToOklch({
      space: 'oklab',
      l: 1,
      a: 0,
      b: 0,
      alpha: 1,
    });
    expect(result.l).toBe(1);
    expect(result.c).toBe(0);
  });

  it('computes correct C and H for positive a and b', () => {
    // a=0.3, b=0.4 → C=0.5, H=atan2(0.4,0.3)≈53.13°
    const result = oklabToOklch({
      space: 'oklab',
      l: 0.5,
      a: 0.3,
      b: 0.4,
      alpha: 1,
    });
    expect(result.c).toBeCloseTo(0.5, 10);
    expect(result.h).toBeCloseTo(53.13010235415598, 6);
  });

  it('wraps negative hue to [0, 360)', () => {
    // a=0.3, b=-0.4 → H=atan2(-0.4,0.3)≈-53.13° → wrapped to ≈306.87°
    const result = oklabToOklch({
      space: 'oklab',
      l: 0.5,
      a: 0.3,
      b: -0.4,
      alpha: 1,
    });
    expect(result.c).toBeCloseTo(0.5, 10);
    expect(result.h).toBeCloseTo(306.869897645844, 6);
  });

  it('preserves alpha', () => {
    const result = oklabToOklch({
      space: 'oklab',
      l: 0.5,
      a: 0.1,
      b: 0.1,
      alpha: 0.75,
    });
    expect(result.alpha).toBe(0.75);
  });

  it('round-trips with oklchToOklab for sRGB red', () => {
    // OKLAB values for sRGB red (from Color.js 0.6.1)
    const result = oklabToOklch({
      space: 'oklab',
      l: 0.6279553639846869,
      a: 0.22486306106597398,
      b: 0.1258462985307351,
      alpha: 1,
    });
    // Expected OKLCH: L≈0.6280, C≈0.2577, H≈29.23°
    expect(result.l).toBeCloseTo(0.6279553639846869, 6);
    expect(result.c).toBeCloseTo(0.2577, 3);
    expect(result.h).toBeCloseTo(29.23, 1);
  });
});
