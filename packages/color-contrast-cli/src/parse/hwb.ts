import type { HWBColor } from '../types';
import {
  hasLength,
  normalizeAlpha,
  normalizeHue,
  normalizePercentage,
} from './utils';

/**
 * Parse a CSS hwb() color string into an HWBColor.
 *
 * Supports only the modern space-separated syntax as defined in
 * CSS Color Level 4, Section 8. There is no legacy `hwba()` alias
 * and no comma-separated syntax.
 *
 * - Syntax:  hwb(H W B) or hwb(H W B / A)
 * - Hue may include an angle unit (deg, rad, grad, turn) or be unitless (treated as degrees).
 * - Whiteness and Blackness must be percentages.
 * - Alpha may be a number (0-1) or percentage (0%-100%).
 * - Out-of-range values are clamped (W, B, alpha) or wrapped (hue).
 *
 * Not supported: `none` keyword, `calc()`, scientific notation, `hwba()`.
 */
export function parseHwb(input: string): HWBColor | null {
  const match = /^hwb\(\s*(.*?)\s*\)$/i.exec(input);
  if (!match) return null;

  const body = match[1];
  if (!body) return null;

  // Reject comma syntax — HWB has no legacy comma form
  if (body.includes(',')) return null;

  return parseSpaceSyntax(body);
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
 * Parse hue, whiteness, and blackness from three tokens.
 * Hue must be a valid hue token; W and B must be percentages.
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
 * Build an HWBColor from parsed channels and an optional alpha token.
 * Returns null if the alpha token is present but invalid.
 */
function buildWithAlpha(
  channels: [number, number, number],
  alphaToken: string | null,
): HWBColor | null {
  let alpha = 1;
  if (alphaToken !== null) {
    const parsed = parseAlphaToken(alphaToken);
    if (parsed === null) return null;
    alpha = parsed;
  }
  return {
    space: 'hwb',
    h: channels[0],
    w: channels[1],
    b: channels[2],
    alpha,
  };
}

/** Parse modern space-separated syntax: H W B or H W B / A */
function parseSpaceSyntax(body: string): HWBColor | null {
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
