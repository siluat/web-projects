import { describe, expect, it } from 'bun:test';
import { xyzToOklab } from './xyz-to-oklab';

/**
 * Reference values verified against Color.js 0.6.1.
 * Round-trip: oklabToXyz → xyzToOklab should recover original values.
 */
describe('xyzToOklab', () => {
  it('converts D65 white (0.9505, 1.0, 1.0890) to OKLAB L≈1', () => {
    const result = xyzToOklab(
      { x: 0.9504559270516716, y: 1, z: 1.0890577507598784 },
      1,
    );
    expect(result.l).toBeCloseTo(1, 4);
    expect(result.a).toBeCloseTo(0, 4);
    expect(result.b).toBeCloseTo(0, 4);
    expect(result.alpha).toBe(1);
    expect(result.space).toBe('oklab');
  });

  it('converts XYZ origin (0, 0, 0) to OKLAB black (L=0)', () => {
    const result = xyzToOklab({ x: 0, y: 0, z: 0 }, 1);
    expect(result.l).toBe(0);
    expect(result.a).toBe(0);
    expect(result.b).toBe(0);
  });

  it('preserves alpha', () => {
    const result = xyzToOklab({ x: 0, y: 0, z: 0 }, 0.5);
    expect(result.alpha).toBe(0.5);
  });

  it('round-trips with oklabToXyz for sRGB red', () => {
    // sRGB red in XYZ-D65 (from Color.js): approximately (0.4124, 0.2126, 0.0193)
    const result = xyzToOklab(
      { x: 0.4123907992735076, y: 0.21263900587151027, z: 0.01933081871559182 },
      1,
    );
    // Expected OKLAB values for sRGB red (from Color.js 0.6.1)
    expect(result.l).toBeCloseTo(0.6279553639846869, 6);
    expect(result.a).toBeCloseTo(0.22486306106597398, 6);
    expect(result.b).toBeCloseTo(0.1258462985307351, 6);
  });
});
