import { describe, expect, it } from 'bun:test';
import { alphaComposite } from './alpha-composite';
import { srgbToLinear } from './convert';
import { relativeLuminance } from './luminance';
import { suggestForeground } from './suggest';
import type { SRGBColor } from './types';

// --- Test helpers ---

function srgb(r: number, g: number, b: number, alpha = 1): SRGBColor {
  return { space: 'srgb', r: r / 255, g: g / 255, b: b / 255, alpha };
}

const WHITE: SRGBColor = { space: 'srgb', r: 1, g: 1, b: 1, alpha: 1 };
const BLACK: SRGBColor = { space: 'srgb', r: 0, g: 0, b: 0, alpha: 1 };

/**
 * Compute the raw (unrounded) contrast ratio of a hex string against a background.
 * Used for round-trip verification in tests.
 */
function rawRatioFromHex(hex: string, bg: SRGBColor): number {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const alpha =
    hex.length === 9 ? Number.parseInt(hex.slice(7, 9), 16) / 255 : 1;
  const fg: SRGBColor = { space: 'srgb', r, g, b, alpha };

  const [fgComp, bgComp] = alphaComposite(fg, bg);
  const fgLum = relativeLuminance(srgbToLinear(fgComp));
  const bgLum = relativeLuminance(srgbToLinear(bgComp));
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Tests ---

describe('suggestForeground', () => {
  describe('already passing pairs', () => {
    it('returns null when contrast already meets target', () => {
      // #333333 on #ffffff has contrast ratio ~12.63:1
      const result = suggestForeground(srgb(0x33, 0x33, 0x33), WHITE, 4.5);
      expect(result.suggested).toBeNull();
      expect(result.result).toBeNull();
    });
  });

  describe('known failure pairs', () => {
    it('suggests a color that meets AA for #777 on #fff', () => {
      // #777777 on #ffffff has contrast ratio ~4.48:1 (just below AA)
      const result = suggestForeground(srgb(0x77, 0x77, 0x77), WHITE, 4.5);
      expect(result.suggested).not.toBeNull();
      expect(result.result).not.toBeNull();
      if (result.suggested === null) return;

      // Verify suggested color actually meets the target
      const ratio = rawRatioFromHex(result.suggested, WHITE);
      expect(ratio).toBeGreaterThanOrEqual(4.5);

      // Should match Chrome DevTools reference #767676
      expect(result.suggested).toBe('#767676');
    });
  });

  describe('direction preference', () => {
    it('prefers darker direction on bright background', () => {
      const result = suggestForeground(srgb(0x88, 0x88, 0x88), WHITE, 4.5);
      expect(result.suggested).not.toBeNull();
      if (result.suggested === null) return;

      // Suggested color should be darker (lower channel values)
      const suggestedR = Number.parseInt(result.suggested.slice(1, 3), 16);
      expect(suggestedR).toBeLessThan(0x88);
    });

    it('prefers lighter direction on dark background', () => {
      // #555555 on #000000 has contrast ratio ~2.81 (well below AA)
      const result = suggestForeground(srgb(0x55, 0x55, 0x55), BLACK, 4.5);
      expect(result.suggested).not.toBeNull();
      if (result.suggested === null) return;

      // Suggested color should be lighter (higher channel values)
      const suggestedR = Number.parseInt(result.suggested.slice(1, 3), 16);
      expect(suggestedR).toBeGreaterThan(0x55);
    });
  });

  describe('impossible suggestions', () => {
    it('returns null for same color with target 21', () => {
      const gray = srgb(0x80, 0x80, 0x80);
      const result = suggestForeground(gray, gray, 21);
      expect(result.suggested).toBeNull();
      expect(result.result).toBeNull();
    });
  });

  describe('alpha preservation', () => {
    it('preserves alpha in the suggested color', () => {
      const fgWithAlpha = srgb(0x77, 0x77, 0x77, 0.8);
      const result = suggestForeground(fgWithAlpha, WHITE, 4.5);
      expect(result.suggested).not.toBeNull();
      if (result.suggested === null) return;

      // 8-digit hex for semi-transparent colors
      expect(result.suggested).toHaveLength(9);

      // Alpha byte should match: 0.8 × 255 = 204 = 0xcc
      const alphaHex = result.suggested.slice(7, 9);
      expect(alphaHex).toBe('cc');
    });
  });

  describe('extreme backgrounds', () => {
    it('finds lighter suggestion on black background', () => {
      const result = suggestForeground(srgb(0x20, 0x20, 0x20), BLACK, 4.5);
      expect(result.suggested).not.toBeNull();
      if (result.suggested === null) return;

      const suggestedR = Number.parseInt(result.suggested.slice(1, 3), 16);
      expect(suggestedR).toBeGreaterThan(0x20);
    });

    it('finds darker suggestion on white background', () => {
      const result = suggestForeground(srgb(0xcc, 0xcc, 0xcc), WHITE, 4.5);
      expect(result.suggested).not.toBeNull();
      if (result.suggested === null) return;

      const suggestedR = Number.parseInt(result.suggested.slice(1, 3), 16);
      expect(suggestedR).toBeLessThan(0xcc);
    });
  });

  describe('hex format', () => {
    it('returns 6-digit lowercase hex for opaque colors', () => {
      const result = suggestForeground(srgb(0x77, 0x77, 0x77), WHITE, 4.5);
      expect(result.suggested).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('returns 8-digit lowercase hex for semi-transparent colors', () => {
      // alpha 0.8 can achieve AA; alpha 0.5 cannot (max ratio ~3.98)
      const result = suggestForeground(srgb(0x77, 0x77, 0x77, 0.8), WHITE, 4.5);
      expect(result.suggested).not.toBeNull();
      expect(result.suggested).toMatch(/^#[0-9a-f]{8}$/);
    });
  });

  describe('round-trip verification', () => {
    const testCases = [
      {
        fg: srgb(0x77, 0x77, 0x77),
        bg: WHITE,
        target: 4.5,
        label: '#777 on #fff (AA)',
      },
      {
        fg: srgb(0x77, 0x77, 0x77),
        bg: WHITE,
        target: 7,
        label: '#777 on #fff (AAA)',
      },
      {
        fg: srgb(0x55, 0x55, 0x55),
        bg: BLACK,
        target: 4.5,
        label: '#555 on #000 (AA)',
      },
      {
        fg: srgb(0xcc, 0xcc, 0xcc),
        bg: WHITE,
        target: 3,
        label: '#ccc on #fff (large AA)',
      },
      {
        fg: srgb(0x55, 0x88, 0xcc),
        bg: WHITE,
        target: 4.5,
        label: '#5588cc on #fff (AA)',
      },
    ];

    for (const { fg, bg, target, label } of testCases) {
      it(`produces valid suggestion for ${label}`, () => {
        const result = suggestForeground(fg, bg, target);
        expect(result.suggested).not.toBeNull();
        if (result.suggested === null) return;
        const ratio = rawRatioFromHex(result.suggested, bg);
        expect(ratio).toBeGreaterThanOrEqual(target);
      });
    }
  });
});
