# Issue 2: Basic Color Parsing (HEX, RGB, Named Colors)

## Scope

- `src/parse.ts`: ColorFormat table structure + parseColor + HEX/RGB extraction
- `src/named-colors.ts`: CSS 148 named colors data

## Details

### parse.ts Structure

Declare the ColorFormat table at the top of the file; the parseColor function iterates over the table.

```typescript
interface ColorFormat {
  pattern: RegExp;
  toRgb: (match: RegExpMatchArray) => RGB;
}
```

Formats to implement in this issue:

| Format | Pattern | Example |
|--------|---------|---------|
| Short HEX | `#RGB` | `#fff` |
| Short HEX + Alpha | `#RGBA` | `#fff8` |
| HEX | `#RRGGBB` | `#ffffff` |
| HEX + Alpha | `#RRGGBBAA` | `#ffffff80` |
| RGB function | `rgb(r, g, b)` | `rgb(255, 255, 255)` |
| RGBA function | `rgba(r, g, b, a)` | `rgba(255, 255, 255, 0.5)` |

### named-colors.ts

Implement the 148 CSS Level 4 named colors as a `Record<string, RGB>` data table.

```typescript
export const NAMED_COLORS: Record<string, RGB> = {
  aliceblue: { r: 240, g: 248, b: 255 },
  antiquewhite: { r: 250, g: 235, b: 215 },
  // ... 148 colors
};
```

### parseColor Function

```typescript
export function parseColor(input: string): RGB {
  const key = input.trim().toLowerCase();
  if (key in NAMED_COLORS) return NAMED_COLORS[key];
  for (const { pattern, toRgb } of COLOR_FORMATS) {
    const match = key.match(pattern);
    if (match) return toRgb(match);
  }
  throw new Error(`Unsupported color format: "${input}"`);
}
```

## Test Cases

- HEX parsing: `#fff`, `#ffffff`, `#FFF`, `#FFFFFF`
- HEX + Alpha: `#fff8`, `#ffffff80`
- RGB function: `rgb(255, 255, 255)`, `rgb(0, 0, 0)`
- RGBA function: `rgba(255, 255, 255, 0.5)`
- Named colors: `white`, `black`, `red`, `rebeccapurple`
- Errors: empty string, invalid format, out-of-range values

## Estimated Size

~400 lines

## Verification

```bash
bun run test --filter=@siluat/wcag-contrast
turbo run check-types --filter=@siluat/wcag-contrast
biome check packages/wcag-contrast
```
