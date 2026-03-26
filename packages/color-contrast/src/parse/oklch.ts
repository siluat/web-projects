import type { OKLCHColor } from '../types';
import {
  hasLength,
  normalizeAlpha,
  normalizePercentage,
  wrapHueDegrees,
} from './utils';

/**
 * Parse a CSS oklch() color string into an OKLCHColor.
 *
 * Supports only the modern space-separated syntax as defined in
 * CSS Color Level 4, Section 10.3.
 *
 * - Syntax:  oklch(L C H) or oklch(L C H / A)
 * - L: number or percentage (0%-100% maps to 0-1). No clamping.
 * - C: number or percentage (0%-100% maps to 0-0.4). No clamping.
 * - H: angle (deg/rad/grad/turn). Wrapped to [0, 360) degrees.
 * - Alpha: number (0-1) or percentage (0%-100%). Clamped to [0, 1].
 *
 * Not supported: `none` keyword, `calc()`, scientific notation, comma syntax.
 *
 * @see https://www.w3.org/TR/css-color-4/#funcdef-oklch
 */
export function parseOklch(input: string): OKLCHColor | null {
  const match = /^oklch\(\s*(.*?)\s*\)$/i.exec(input);
  if (!match) return null;

  const body = match[1];
  if (!body) return null;

  // Reject comma syntax — oklch() has no legacy comma form
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
 * Percentage scale factors per CSS Color Level 4:
 * - L: 100% = 1
 * - C: 100% = 0.4
 */
const L_PERCENT_SCALE = 0.01;
const C_PERCENT_SCALE = 0.004;

/** Parse a channel value that may be a number or percentage. */
function parseChannelValue(token: string, percentScale: number): number | null {
  if (isPercent(token)) return parsePercentValue(token) * percentScale;
  if (isNumber(token)) return parseNumber(token);
  return null;
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
 * Parse L, C, and H from three tokens.
 * L and C may be number or percentage; H is an angle.
 * Returns null if any token is invalid.
 */
function parseChannels(tokens: string[]): [number, number, number] | null {
  if (!hasLength(tokens, 3)) return null;

  const l = parseChannelValue(tokens[0], L_PERCENT_SCALE);
  if (l === null) return null;

  const c = parseChannelValue(tokens[1], C_PERCENT_SCALE);
  if (c === null) return null;

  const hueDeg = parseHueToken(tokens[2]);
  if (hueDeg === null) return null;

  return [l, c, wrapHueDegrees(hueDeg)];
}

/**
 * Build an OKLCHColor from parsed channels and an optional alpha token.
 * Returns null if the alpha token is present but invalid.
 */
function buildWithAlpha(
  channels: [number, number, number],
  alphaToken: string | null,
): OKLCHColor | null {
  let alpha = 1;
  if (alphaToken !== null) {
    const parsed = parseAlphaToken(alphaToken);
    if (parsed === null) return null;
    alpha = parsed;
  }
  return {
    space: 'oklch',
    l: channels[0],
    c: channels[1],
    h: channels[2],
    alpha,
  };
}

/** Parse modern space-separated syntax: L C H or L C H / A */
function parseSpaceSyntax(body: string): OKLCHColor | null {
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
