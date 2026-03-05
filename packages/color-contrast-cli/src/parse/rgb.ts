import type { SRGBColor } from '../types';
import {
  normalizeAlpha,
  normalizePercentage,
  normalizeRgbChannel,
} from './utils';

/**
 * Parse a CSS rgb()/rgba() color string into an SRGBColor.
 *
 * Supports both modern (space-separated) and legacy (comma-separated) syntax
 * as defined in CSS Color Level 4, Section 4.1.
 *
 * - Modern:  rgb(R G B) or rgb(R G B / A)
 * - Legacy:  rgb(R, G, B) or rgb(R, G, B, A)
 * - Channels may be numbers (0-255) or percentages (0%-100%), but not mixed.
 * - Alpha may be a number (0-1) or percentage (0%-100%) regardless of channel type.
 * - rgba() is a legacy alias and behaves identically.
 * - Out-of-range values are clamped.
 *
 * Not supported: `none` keyword, `calc()`, scientific notation.
 */
export function parseRgb(input: string): SRGBColor | null {
  const match = /^rgba?\(\s*(.*?)\s*\)$/i.exec(input);
  if (!match) return null;

  const body = match[1];
  if (!body) return null;

  return body.includes(',') ? parseCommaSyntax(body) : parseSpaceSyntax(body);
}

/** Number literal: optional sign, integer or decimal, no scientific notation. */
const NUMBER_RE = /^-?\d+(\.\d+)?$|^-?\.\d+$/;

/** Percentage literal: number followed by %. */
const PERCENT_RE = /^-?\d+(\.\d+)?%$|^-?\.\d+%$/;

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
 * Parse alpha from a token that may be a number (0-1) or percentage (0%-100%).
 * Returns null if the token is neither.
 */
function parseAlphaToken(token: string): number | null {
  if (isPercent(token)) return normalizePercentage(parsePercentValue(token));
  if (isNumber(token)) return normalizeAlpha(parseNumber(token));
  return null;
}

/**
 * Convert 3 channel tokens to normalized [r, g, b].
 * All tokens must be the same type (all numbers or all percentages).
 * Returns null if types are mixed or invalid.
 */
function parseChannels(
  tokens: [string, string, string],
): [number, number, number] | null {
  const allNumbers = tokens.every(isNumber);
  const allPercents = tokens.every(isPercent);

  if (!allNumbers && !allPercents) return null;

  const parse = allNumbers ? parseNumber : parsePercentValue;
  const normalize = allNumbers ? normalizeRgbChannel : normalizePercentage;
  return [
    normalize(parse(tokens[0])),
    normalize(parse(tokens[1])),
    normalize(parse(tokens[2])),
  ];
}

/**
 * Build an SRGBColor from parsed channels and an optional alpha token.
 * Returns null if the alpha token is present but invalid.
 */
function buildWithAlpha(
  channels: [number, number, number],
  alphaToken: string | null,
): SRGBColor | null {
  let alpha = 1;
  if (alphaToken !== null) {
    const parsed = parseAlphaToken(alphaToken);
    if (parsed === null) return null;
    alpha = parsed;
  }
  return {
    space: 'srgb',
    r: channels[0],
    g: channels[1],
    b: channels[2],
    alpha,
  };
}

/** Parse legacy comma-separated syntax: R, G, B or R, G, B, A */
function parseCommaSyntax(body: string): SRGBColor | null {
  const parts = body.split(',').map((p) => p.trim());
  if (parts.length !== 3 && parts.length !== 4) return null;

  const channelTokens = parts.slice(0, 3) as [string, string, string];
  const channels = parseChannels(channelTokens);
  if (!channels) return null;

  return buildWithAlpha(channels, parts[3] ?? null);
}

/** Parse modern space-separated syntax: R G B or R G B / A */
function parseSpaceSyntax(body: string): SRGBColor | null {
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

  const channelTokens = tokens as [string, string, string];
  const channels = parseChannels(channelTokens);
  if (!channels) return null;

  return buildWithAlpha(channels, alphaPart);
}
