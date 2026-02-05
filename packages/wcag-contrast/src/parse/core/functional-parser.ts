import type { RGB } from '../../types';
import { parseAlpha } from './parsers';
import type { FunctionalColorSchema } from './types';

/**
 * Extract content from a functional color notation
 * e.g., "hsl(180 50% 50%)" -> { name: "hsl", content: "180 50% 50%" }
 */
export function extractFunctionContent(
  color: string,
  functionNames: string[],
): { name: string; content: string } | null {
  const trimmed = color.trim().toLowerCase();

  for (const name of functionNames) {
    const pattern = new RegExp(`^${name}\\s*\\(\\s*(.+)\\s*\\)$`);
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return { name, content: match[1] };
    }
  }

  return null;
}

/**
 * Split content by slash (for alpha) and then by separator (comma or space)
 */
export function splitContent(content: string): {
  values: string[];
  alphaPart: string | undefined;
  hasComma: boolean;
} | null {
  const slashParts = content.trim().split('/');
  if (slashParts.length > 2) {
    return null;
  }

  const firstPart = slashParts[0];
  if (!firstPart) {
    return null;
  }

  const colorPart = firstPart.trim();
  const alphaPart = slashParts[1]?.trim();

  const hasComma = colorPart.includes(',');
  const values = hasComma
    ? colorPart.split(',').map((v) => v.trim())
    : colorPart.split(/\s+/).filter((v) => v.length > 0);

  return { values, alphaPart, hasComma };
}

/**
 * Create a parser from a functional color schema
 */
export function createFunctionalParser<TChannels extends string>(
  schema: FunctionalColorSchema<TChannels>,
): (color: string) => RGB | null {
  return (color: string): RGB | null => {
    const extracted = extractFunctionContent(color, schema.functionNames);
    if (!extracted) {
      return null;
    }

    const split = splitContent(extracted.content);
    if (!split) {
      return null;
    }

    const { values, alphaPart, hasComma } = split;

    // Handle alpha in comma syntax: hsla(180, 50%, 50%, 0.5)
    let alpha: number | undefined;
    if (
      hasComma &&
      values.length === schema.channelOrder.length + 1 &&
      !alphaPart
    ) {
      const alphaStr = values.pop();
      if (alphaStr) {
        const alphaResult = parseAlpha(alphaStr);
        if (!alphaResult.ok) {
          return null;
        }
        alpha = alphaResult.value;
      }
    } else if (alphaPart) {
      const alphaResult = parseAlpha(alphaPart);
      if (!alphaResult.ok) {
        return null;
      }
      alpha = alphaResult.value;
    }

    if (values.length !== schema.channelOrder.length) {
      return null;
    }

    // Parse each channel
    const channelValues = {} as Record<TChannels, number>;
    for (let i = 0; i < schema.channelOrder.length; i++) {
      const channelName = schema.channelOrder[i];
      if (!channelName) {
        return null;
      }
      const config = schema.channels[channelName];
      const value = values[i];
      if (!value) {
        return null;
      }

      const result = config.parser(value);
      if (!result.ok) {
        return null;
      }
      channelValues[channelName] = result.value;
    }

    return schema.toRgb(channelValues, alpha);
  };
}
