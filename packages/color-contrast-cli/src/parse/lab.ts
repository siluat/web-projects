import type { LABColor } from '../types';
import { hasLength, normalizeAlpha, normalizePercentage } from './utils';

/**
 * Parse a CSS lab() color string into a LABColor.
 *
 * Supports only the modern space-separated syntax as defined in
 * CSS Color Level 4, Section 10.1.
 *
 * - Syntax:  lab(L a b) or lab(L a b / A)
 * - L: number or percentage (0%-100% maps to 0-100). No clamping.
 * - a, b: number or percentage (-100%-100% maps to -125–125). No clamping.
 * - Alpha: number (0-1) or percentage (0%-100%). Clamped to [0, 1].
 *
 * Not supported: `none` keyword, `calc()`, scientific notation, comma syntax.
 *
 * @see https://www.w3.org/TR/css-color-4/#funcdef-lab
 */
export function parseLab(input: string): LABColor | null {
  const match = /^lab\(\s*(.*?)\s*\)$/i.exec(input);
  if (!match) return null;

  const body = match[1];
  if (!body) return null;

  // Reject comma syntax — lab() has no legacy comma form
  if (body.includes(',')) return null;

  return parseSpaceSyntax(body);
}

/** Number literal: optional sign, integer or decimal, no scientific notation. */
const NUMBER_RE = /^[+-]?\d+(\.\d+)?$|^[+-]?\.\d+$/;

/** Percentage literal: number followed by %. */
const PERCENT_RE = /^[+-]?\d+(\.\d+)?%$|^[+-]?\.\d+%$/;

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
 * - L: 100% = 100
 * - a, b: 100% = 125 (reference range -125 to 125)
 */
const L_PERCENT_SCALE = 1;
const AB_PERCENT_SCALE = 1.25;

/** Parse a channel value that may be a number or percentage. */
function parseChannelValue(token: string, percentScale: number): number | null {
  if (isPercent(token)) return parsePercentValue(token) * percentScale;
  if (isNumber(token)) return parseNumber(token);
  return null;
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
 * Parse L, a, and b from three tokens.
 * Each may be a number or percentage with its own scale.
 * Returns null if any token is invalid.
 */
function parseChannels(tokens: string[]): [number, number, number] | null {
  if (!hasLength(tokens, 3)) return null;

  const l = parseChannelValue(tokens[0], L_PERCENT_SCALE);
  if (l === null) return null;

  const a = parseChannelValue(tokens[1], AB_PERCENT_SCALE);
  if (a === null) return null;

  const b = parseChannelValue(tokens[2], AB_PERCENT_SCALE);
  if (b === null) return null;

  return [l, a, b];
}

/**
 * Build a LABColor from parsed channels and an optional alpha token.
 * Returns null if the alpha token is present but invalid.
 */
function buildWithAlpha(
  channels: [number, number, number],
  alphaToken: string | null,
): LABColor | null {
  let alpha = 1;
  if (alphaToken !== null) {
    const parsed = parseAlphaToken(alphaToken);
    if (parsed === null) return null;
    alpha = parsed;
  }
  return {
    space: 'lab',
    l: channels[0],
    a: channels[1],
    b: channels[2],
    alpha,
  };
}

/** Parse modern space-separated syntax: L a b or L a b / A */
function parseSpaceSyntax(body: string): LABColor | null {
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
