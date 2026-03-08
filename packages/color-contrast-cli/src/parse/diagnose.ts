interface FormatDiagnostic {
  detect: (input: string) => boolean;
  diagnose: (input: string) => string;
}

const FORMAT_DIAGNOSTICS: readonly FormatDiagnostic[] = [
  { detect: (s) => s.startsWith('#'), diagnose: diagnoseHex },
  { detect: (s) => /^rgba?\(/i.test(s), diagnose: diagnoseRgb },
  { detect: (s) => /^hsla?\(/i.test(s), diagnose: diagnoseHsl },
  { detect: (s) => /^hwb\(/i.test(s), diagnose: diagnoseHwb },
  { detect: (s) => /^lab\(/i.test(s), diagnose: diagnoseLab },
  { detect: (s) => /^lch\(/i.test(s), diagnose: diagnoseLch },
  { detect: (s) => /^oklab\(/i.test(s), diagnose: diagnoseOklab },
  { detect: (s) => /^oklch\(/i.test(s), diagnose: diagnoseOklch },
];

/** Valid hex digit counts: #RGB (3), #RGBA (4), #RRGGBB (6), #RRGGBBAA (8) */
const VALID_HEX_LENGTHS = new Set([3, 4, 6, 8]);

const SUPPORTED_FORMATS =
  'Supported formats: #hex, named colors (red, blue, ...), rgb(), hsl(), hwb(), lab(), lch(), oklab(), oklch()';

/**
 * Produce a descriptive error message for a color string that failed to parse.
 *
 * Analyzes the input to detect the intended format and returns a specific hint
 * about what went wrong. Only called on the failure path — never on success.
 */
export function diagnoseColorError(input: string): string {
  const trimmed = input.trim();
  const header = `Invalid color: "${input}"`;

  if (trimmed === '') {
    return `${header}\n  ${SUPPORTED_FORMATS}`;
  }

  for (const { detect, diagnose } of FORMAT_DIAGNOSTICS) {
    if (detect(trimmed)) {
      return `${header}\n  ${diagnose(trimmed)}`;
    }
  }

  // Bare hex: looks like hex digits but missing #
  if (/^[0-9a-fA-F]+$/.test(trimmed)) {
    const len = trimmed.length;
    if (VALID_HEX_LENGTHS.has(len)) {
      return `${header}\n  Hex colors must start with #. Try: #${trimmed}`;
    }
  }

  return `${header}\n  ${SUPPORTED_FORMATS}`;
}

// --- Format-specific diagnostics ---

function diagnoseHex(input: string): string {
  const digits = input.slice(1);

  if (!/^[0-9a-fA-F]*$/.test(digits)) {
    return 'Hex colors use characters 0-9 and a-f. Example: #ff0000';
  }

  const len = digits.length;
  if (!VALID_HEX_LENGTHS.has(len)) {
    return `Hex colors must be 3, 4, 6, or 8 digits after #. Got ${len}.`;
  }

  return 'Hex colors use characters 0-9 and a-f. Example: #ff0000';
}

function extractBody(input: string): { body: string; closed: boolean } {
  const openParen = input.indexOf('(');
  if (openParen === -1) return { body: '', closed: false };
  const closed = input.endsWith(')');
  const body = closed
    ? input.slice(openParen + 1, -1).trim()
    : input.slice(openParen + 1).trim();
  return { body, closed };
}

function diagnoseRgb(input: string): string {
  const { body, closed } = extractBody(input);
  if (!closed) return 'Missing closing parenthesis.';

  const tokens = splitTokens(body);
  if (tokens.length !== 3) {
    return 'rgb() requires 3 color channels.';
  }

  const hasNumber = tokens.some((t) => /^\d/.test(t) && !t.endsWith('%'));
  const hasPercent = tokens.some((t) => t.endsWith('%'));
  if (hasNumber && hasPercent) {
    return "RGB channels must be all numbers (0-255) or all percentages. Don't mix.";
  }

  return 'Could not parse rgb() values. Example: rgb(255 0 0)';
}

function diagnoseHsl(input: string): string {
  const { body, closed } = extractBody(input);
  if (!closed) return 'Missing closing parenthesis.';

  const tokens = splitTokens(body);
  if (tokens.length !== 3) {
    return 'hsl() requires 3 values (hue, saturation, lightness).';
  }

  // Check if S and L are missing %
  const s = tokens[1];
  const l = tokens[2];
  if (
    (s !== undefined && !s.endsWith('%')) ||
    (l !== undefined && !l.endsWith('%'))
  ) {
    return 'Saturation and lightness must be percentages. Example: hsl(120 100% 50%)';
  }

  return 'Could not parse hsl() values. Example: hsl(120 100% 50%)';
}

function diagnoseSpaceOnly(
  input: string,
  format: string,
  example: string,
  extraCheck?: (tokens: string[]) => string | null,
): string {
  const { body, closed } = extractBody(input);
  if (!closed) return 'Missing closing parenthesis.';

  if (body.includes(',')) {
    return `${format}() uses space-separated values, not commas. Example: ${example}`;
  }

  const tokens = splitChannelTokens(body);

  if (extraCheck) {
    const hint = extraCheck(tokens);
    if (hint) return hint;
  }

  if (tokens.length !== 3) {
    return `${format}() requires 3 values. Example: ${example}`;
  }

  return `Could not parse ${format}() values. Example: ${example}`;
}

function diagnoseHwb(input: string): string {
  return diagnoseSpaceOnly(input, 'hwb', 'hwb(0 0% 100%)', (tokens) => {
    if (tokens.length === 3) {
      const w = tokens[1];
      const b = tokens[2];
      if (
        (w !== undefined && !w.endsWith('%')) ||
        (b !== undefined && !b.endsWith('%'))
      ) {
        return 'Whiteness and blackness must be percentages. Example: hwb(0 0% 100%)';
      }
    }
    return null;
  });
}

function diagnoseLab(input: string): string {
  return diagnoseSpaceOnly(input, 'lab', 'lab(50% 40 59.5)');
}

function diagnoseLch(input: string): string {
  return diagnoseSpaceOnly(input, 'lch', 'lch(52.2% 72.2 50)');
}

function diagnoseOklab(input: string): string {
  return diagnoseSpaceOnly(input, 'oklab', 'oklab(0.6 0.1 0.1)');
}

function diagnoseOklch(input: string): string {
  return diagnoseSpaceOnly(input, 'oklch', 'oklch(60% 0.15 50)');
}

/** Split body into channel tokens, handling comma/space separation and alpha slash. */
function splitTokens(body: string): string[] {
  if (body.includes(',')) {
    return body
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return splitChannelTokens(body);
}

/** Split space-separated body into channel tokens, stripping alpha after `/`. */
function splitChannelTokens(body: string): string[] {
  const slashIndex = body.indexOf('/');
  const channelPart = slashIndex !== -1 ? body.slice(0, slashIndex) : body;
  return channelPart.trim().split(/\s+/).filter(Boolean);
}
