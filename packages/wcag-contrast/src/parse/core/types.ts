import type { RGB } from '../../types';

/**
 * Result type for parsing operations
 */
export type ParseResult<T> = { ok: true; value: T } | { ok: false };

/**
 * A function that parses a string value into a typed result
 */
export type ValueParser<T> = (value: string) => ParseResult<T>;

/**
 * Configuration for a single color channel
 */
export interface ChannelConfig<T = number> {
  name: string;
  parser: ValueParser<T>;
}

/**
 * Schema for functional color notation (rgb(), hsl(), etc.)
 * TChannels is a union of channel names (e.g., 'h' | 's' | 'l')
 */
export interface FunctionalColorSchema<TChannels extends string> {
  /** Function names that match this schema (e.g., ['hsl', 'hsla']) */
  functionNames: string[];
  /** Channel configurations keyed by channel name */
  channels: Record<TChannels, ChannelConfig>;
  /** Order of channels in the color function */
  channelOrder: TChannels[];
  /** Convert parsed channel values to RGB */
  toRgb: (values: Record<TChannels, number>, alpha?: number) => RGB;
}
