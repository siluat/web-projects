import type { RGB } from '../types';

/**
 * Parse HEX color string to RGB
 * Supports: #rgb, #rgba, #rrggbb, #rrggbbaa
 */
export function parseHex(color: string): RGB | null {
  const trimmed = color.trim();

  if (!trimmed.startsWith('#')) {
    return null;
  }

  const hex = trimmed.slice(1).toLowerCase();

  // #rgb or #rgba
  if (hex.length === 3 || hex.length === 4) {
    if (!/^[0-9a-f]+$/.test(hex)) {
      return null;
    }

    const r = Number.parseInt(hex.charAt(0) + hex.charAt(0), 16);
    const g = Number.parseInt(hex.charAt(1) + hex.charAt(1), 16);
    const b = Number.parseInt(hex.charAt(2) + hex.charAt(2), 16);

    if (hex.length === 4) {
      const a = Number.parseInt(hex.charAt(3) + hex.charAt(3), 16) / 255;
      return { r, g, b, a };
    }

    return { r, g, b };
  }

  // #rrggbb or #rrggbbaa
  if (hex.length === 6 || hex.length === 8) {
    if (!/^[0-9a-f]+$/.test(hex)) {
      return null;
    }

    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);

    if (hex.length === 8) {
      const a = Number.parseInt(hex.slice(6, 8), 16) / 255;
      return { r, g, b, a };
    }

    return { r, g, b };
  }

  return null;
}
