import { useMemo, useState } from 'react';
import type { ColorTheme, PrimaryShade } from '../src/index';
import { baseColors, themeColors } from '../src/index';

/**
 * Parse a hex color string to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1] as string, 16),
        g: Number.parseInt(result[2] as string, 16),
        b: Number.parseInt(result[3] as string, 16),
      }
    : null;
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const sRgb = v / 255;
    return sRgb <= 0.03928 ? sRgb / 12.92 : ((sRgb + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * (r as number) + 0.7152 * (g as number) + 0.0722 * (b as number)
  );
}

/**
 * Calculate contrast ratio according to WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG compliance levels
 */
type WcagLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';

/**
 * Get WCAG compliance level based on contrast ratio
 */
function getWcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

/**
 * Get badge color based on WCAG level
 */
function getWcagBadgeStyle(level: WcagLevel): React.CSSProperties {
  const styles: Record<WcagLevel, React.CSSProperties> = {
    AAA: { backgroundColor: '#16a34a', color: '#ffffff' },
    AA: { backgroundColor: '#22c55e', color: '#ffffff' },
    'AA Large': { backgroundColor: '#eab308', color: '#000000' },
    Fail: { backgroundColor: '#dc2626', color: '#ffffff' },
  };
  return styles[level];
}

interface ContrastPairProps {
  foreground: string;
  background: string;
  foregroundLabel: string;
  backgroundLabel: string;
}

function ContrastPair({
  foreground,
  background,
  foregroundLabel,
  backgroundLabel,
}: ContrastPairProps) {
  const ratio = getContrastRatio(foreground, background);
  const level = getWcagLevel(ratio);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Preview */}
      <div
        style={{
          backgroundColor: background,
          color: foreground,
          padding: '1rem',
          borderRadius: '0.375rem',
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        Sample Text
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{ fontSize: '0.875rem', color: 'var(--color-foreground)' }}
          >
            Contrast Ratio
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: 'var(--color-foreground)',
            }}
          >
            {ratio.toFixed(2)}:1
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{ fontSize: '0.875rem', color: 'var(--color-foreground)' }}
          >
            WCAG Level
          </span>
          <span
            style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              ...getWcagBadgeStyle(level),
            }}
          >
            {level}
          </span>
        </div>
      </div>

      {/* Color info */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-muted-foreground)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.125rem',
        }}
      >
        <div>
          <strong>Text:</strong> {foregroundLabel} ({foreground})
        </div>
        <div>
          <strong>BG:</strong> {backgroundLabel} ({background})
        </div>
      </div>
    </div>
  );
}

interface ContrastCheckerProps {
  /**
   * Theme to check contrast for
   */
  theme?: ColorTheme;
  /**
   * Color scheme to check (light/dark affects background colors)
   */
  colorScheme?: 'light' | 'dark';
}

/**
 * ContrastChecker displays contrast ratios between color combinations.
 * It helps verify WCAG accessibility compliance.
 */
export function ContrastChecker({
  theme = 'blue',
  colorScheme = 'light',
}: ContrastCheckerProps) {
  const base = colorScheme === 'light' ? baseColors.light : baseColors.dark;
  const primary = themeColors[theme];

  const combinations = useMemo(
    () => [
      {
        foreground: base.foreground,
        background: base.background,
        foregroundLabel: 'foreground',
        backgroundLabel: 'background',
      },
      {
        foreground: primary['500'],
        background: base.background,
        foregroundLabel: `primary-500`,
        backgroundLabel: 'background',
      },
      {
        foreground: base.mutedForeground,
        background: base.background,
        foregroundLabel: 'muted-foreground',
        backgroundLabel: 'background',
      },
      {
        foreground: '#ffffff',
        background: primary['500'],
        foregroundLabel: 'white',
        backgroundLabel: 'primary-500',
      },
      {
        foreground: '#ffffff',
        background: primary['600'],
        foregroundLabel: 'white',
        backgroundLabel: 'primary-600',
      },
      {
        foreground: '#ffffff',
        background: primary['700'],
        foregroundLabel: 'white',
        backgroundLabel: 'primary-700',
      },
    ],
    [base, primary],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: 'var(--color-foreground)',
            textTransform: 'capitalize',
          }}
        >
          {theme} Theme - {colorScheme}
        </h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-muted-foreground)',
          }}
        >
          Contrast ratios between common color combinations.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
        }}
      >
        {combinations.map((combo) => (
          <ContrastPair
            key={`${combo.foregroundLabel}-${combo.backgroundLabel}`}
            {...combo}
          />
        ))}
      </div>

      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--color-muted)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--color-muted-foreground)',
        }}
      >
        <strong>WCAG Guidelines:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>AAA:</strong> 7:1 or higher (enhanced contrast)
          </li>
          <li>
            <strong>AA:</strong> 4.5:1 or higher (normal text)
          </li>
          <li>
            <strong>AA Large:</strong> 3:1 or higher (large text 18pt+ or 14pt
            bold)
          </li>
          <li>
            <strong>Fail:</strong> Below 3:1 (does not meet WCAG requirements)
          </li>
        </ul>
      </div>
    </div>
  );
}

interface InteractiveContrastCheckerProps {
  /**
   * Initial foreground color
   */
  initialForeground?: string;
  /**
   * Initial background color
   */
  initialBackground?: string;
}

/**
 * InteractiveContrastChecker allows users to input custom colors
 * and see the contrast ratio in real-time.
 */
export function InteractiveContrastChecker({
  initialForeground = '#000000',
  initialBackground = '#ffffff',
}: InteractiveContrastCheckerProps) {
  const [foreground, setForeground] = useState(initialForeground);
  const [background, setBackground] = useState(initialBackground);

  const ratio = getContrastRatio(foreground, background);
  const level = getWcagLevel(ratio);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '400px',
      }}
    >
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--color-foreground)',
        }}
      >
        Interactive Contrast Checker
      </h2>

      {/* Color inputs */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="foreground-color"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.5rem',
              color: 'var(--color-foreground)',
            }}
          >
            Text Color
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              id="foreground-color"
              value={foreground}
              onChange={(e) => setForeground(e.target.value)}
              style={{
                width: '3rem',
                height: '2.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              aria-label="Foreground color hex value"
              value={foreground}
              onChange={(e) => setForeground(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: '0.25rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <label
            htmlFor="background-color"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.5rem',
              color: 'var(--color-foreground)',
            }}
          >
            Background Color
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              id="background-color"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              style={{
                width: '3rem',
                height: '2.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              aria-label="Background color hex value"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: '0.25rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          backgroundColor: background,
          color: foreground,
          padding: '2rem',
          borderRadius: '0.5rem',
          textAlign: 'center',
          border: '1px solid var(--color-border)',
        }}
      >
        <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          Large Text (18pt+)
        </p>
        <p style={{ fontSize: '1rem', margin: '0.5rem 0 0 0' }}>
          Normal Text (16px)
        </p>
        <p style={{ fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>
          Small Text (12px)
        </p>
      </div>

      {/* Results */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--color-muted)',
          borderRadius: '0.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--color-foreground)',
            }}
          >
            Contrast Ratio
          </span>
          <span
            style={{
              fontSize: '1.5rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'var(--color-foreground)',
            }}
          >
            {ratio.toFixed(2)}:1
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--color-foreground)',
            }}
          >
            WCAG Level
          </span>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              ...getWcagBadgeStyle(level),
            }}
          >
            {level}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ContrastMatrixProps {
  /**
   * Theme to generate matrix for
   */
  theme?: ColorTheme;
}

/**
 * ContrastMatrix shows a grid of contrast ratios between all primary shades.
 */
export function ContrastMatrix({ theme = 'blue' }: ContrastMatrixProps) {
  const colors = themeColors[theme];
  const shades: PrimaryShade[] = [
    '50',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
    '950',
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: 'var(--color-foreground)',
          textTransform: 'capitalize',
        }}
      >
        {theme} Theme - Contrast Matrix
      </h2>
      <table
        style={{
          borderCollapse: 'collapse',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                padding: '0.5rem',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            >
              BG \ FG
            </th>
            {shades.map((shade) => (
              <th
                key={shade}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-muted)',
                  color: 'var(--color-foreground)',
                }}
              >
                {shade}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shades.map((bgShade) => (
            <tr key={bgShade}>
              <th
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-muted)',
                  color: 'var(--color-foreground)',
                }}
              >
                {bgShade}
              </th>
              {shades.map((fgShade) => {
                const ratio = getContrastRatio(
                  colors[fgShade],
                  colors[bgShade],
                );
                const level = getWcagLevel(ratio);
                return (
                  <td
                    key={fgShade}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--color-border)',
                      textAlign: 'center',
                      ...getWcagBadgeStyle(level),
                    }}
                    title={`${fgShade} on ${bgShade}: ${ratio.toFixed(2)}:1 (${level})`}
                  >
                    {ratio.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
