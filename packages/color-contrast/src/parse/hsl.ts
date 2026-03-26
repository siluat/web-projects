import type { HSLColor } from '../types';
import {
  hasLength,
  normalizeAlpha,
  normalizeHue,
  normalizePercentage,
} from './utils';

/**
 * Parse a CSS hsl()/hsla() color string into an HSLColor.
 *
 * Supports both modern (space-separated) and legacy (comma-separated) syntax
 * as defined in CSS Color Level 4, Section 7.
 *
 * - Modern:  hsl(H S L) or hsl(H S L / A)
 * - Legacy:  hsl(H, S, L) or hsl(H, S, L, A)
 * - Hue may include an angle unit (deg, rad, grad, turn) or be unitless (treated as degrees).
 * - Saturation and Lightness must be percentages.
 * - Alpha may be a number (0-1) or percentage (0%-100%).
 * - hsla() is a legacy alias and behaves identically.
 * - Out-of-range values are clamped (S, L, alpha) or wrapped (hue).
 *
 * Not supported: `none` keyword, `calc()`, scientific notation.
 */
export function parseHsl(input: string): HSLColor | null {
  const match = /^hsla?\(\s*(.*?)\s*\)$/i.exec(input);
  if (!match) return null;

  const body = match[1];
  if (!body) return null;

  return body.includes(',') ? parseCommaSyntax(body) : parseSpaceSyntax(body);
}

/** Number literal: optional sign, integer or decimal, no scientific notation. */
const NUMBER_RE = /^[+-]?\d+(\.\d+)?$|^[+-]?\.\d+$/;

/** Percentage literal: number followed by %. */
const PERCENT_RE = /^[+-]?\d+(\.\d+)?%$|^[+-]?\.\d+%$/;

/** Hue token: number with optional angle unit. */
const HUE_RE = /^([+-]?\d+(\.\d+)?|[+-]?\.\d+)(deg|rad|grad|turn)?$/i;

function isNumber(s: string): boolean {
  return NUMBER_RE.test(s);
}

function isPercent(s: string): boolean {
  return PERCENT_RE.test(s);
}

function parseNumber(s: string): number {
  return Number.parseFloat(s);
}

function parsePercentValue(s: string): number {
  return Number.parseFloat(s.slice(0, -1));
}

/**
 * Parse a hue token into degrees.
 * Supports unitless, deg, rad, grad, turn.
 * Returns null if the token is invalid.
 */
function parseHueToken(token: string): number | null {
  const match = HUE_RE.exec(token);
  if (!match) return null;

  const value = Number.parseFloat(token);
  const unit = match[3]?.toLowerCase();

  switch (unit) {
    case undefined:
    case 'deg':
      return value;
    case 'rad':
      return value * (180 / Math.PI);
    case 'grad':
      return value * 0.9;
    case 'turn':
      return value * 360;
    default:
      return null;
  }
}

/**
 * Parse alpha from a token that may be a number (0-1) or percentage (0%-100%).
 * Returns null if the token is neither.
 */
function parseAlphaToken(token: string): number | null {
  if (isPercent(token)) return normalizePercentage(parsePercentValue(token));
  if (isNumber(token)) return normalizeAlpha(parseNumber(token));
  return null;
}

/**
 * Parse hue, saturation, and lightness from three tokens.
 * Hue must be a valid hue token; S and L must be percentages.
 * Returns null if any token is invalid.
 */
function parseChannels(tokens: string[]): [number, number, number] | null {
  if (!hasLength(tokens, 3)) return null;

  const hueDeg = parseHueToken(tokens[0]);
  if (hueDeg === null) return null;

  if (!isPercent(tokens[1]) || !isPercent(tokens[2])) return null;

  return [
    normalizeHue(hueDeg),
    normalizePercentage(parsePercentValue(tokens[1])),
    normalizePercentage(parsePercentValue(tokens[2])),
  ];
}

/**
 * Build an HSLColor from parsed channels and an optional alpha token.
 * Returns null if the alpha token is present but invalid.
 */
function buildWithAlpha(
  channels: [number, number, number],
  alphaToken: string | null,
): HSLColor | null {
  let alpha = 1;
  if (alphaToken !== null) {
    const parsed = parseAlphaToken(alphaToken);
    if (parsed === null) return null;
    alpha = parsed;
  }
  return {
    space: 'hsl',
    h: channels[0],
    s: channels[1],
    l: channels[2],
    alpha,
  };
}

/** Parse legacy comma-separated syntax: H, S, L or H, S, L, A */
function parseCommaSyntax(body: string): HSLColor | null {
  const parts = body.split(',').map((p) => p.trim());
  if (parts.length !== 3 && parts.length !== 4) return null;

  const channels = parseChannels(parts.slice(0, 3));
  if (!channels) return null;

  return buildWithAlpha(channels, parts[3] ?? null);
}

/** Parse modern space-separated syntax: H S L or H S L / A */
function parseSpaceSyntax(body: string): HSLColor | null {
  const slashIndex = body.indexOf('/');

  let channelPart: string;
  let alphaPart: string | null = null;

  if (slashIndex !== -1) {
    channelPart = body.slice(0, slashIndex).trim();
    alphaPart = body.slice(slashIndex + 1).trim();
  } else {
    channelPart = body;
  }

  const tokens = channelPart.split(/\s+/);
  if (tokens.length !== 3) return null;

  const channels = parseChannels(tokens);
  if (!channels) return null;

  return buildWithAlpha(channels, alphaPart);
}
