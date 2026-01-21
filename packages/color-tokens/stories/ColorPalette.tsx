import type { ColorTheme } from '../src/index';
import {
  baseColors,
  colorThemes,
  primaryShades,
  themeColors,
} from '../src/index';

interface ColorSwatchProps {
  color: string;
  name: string;
  showHex?: boolean;
}

function ColorSwatch({ color, name, showHex = true }: ColorSwatchProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div
        style={{
          width: '100%',
          height: '3rem',
          backgroundColor: color,
          borderRadius: '0.375rem',
          border: '1px solid var(--color-border)',
        }}
        title={`${name}: ${color}`}
      />
      <span
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-muted-foreground)',
        }}
      >
        {name}
      </span>
      {showHex && (
        <span
          style={{
            fontSize: '0.625rem',
            fontFamily: 'monospace',
            color: 'var(--color-muted-foreground)',
          }}
        >
          {color}
        </span>
      )}
    </div>
  );
}

interface ColorPaletteProps {
  /**
   * Which theme to display. If not provided, shows all themes.
   */
  theme?: ColorTheme;
  /**
   * Whether to show base colors (background, foreground, etc.)
   */
  showBaseColors?: boolean;
}

/**
 * ColorPalette displays all color tokens for visual reference.
 * It shows primary colors for each theme and base semantic colors.
 */
export function ColorPalette({
  theme,
  showBaseColors = true,
}: ColorPaletteProps) {
  const themesToShow = theme ? [theme] : colorThemes;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Primary Colors by Theme */}
      {themesToShow.map((themeName) => (
        <section key={themeName}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '1rem',
              textTransform: 'capitalize',
              color: 'var(--color-foreground)',
            }}
          >
            {themeName} Theme
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '1rem',
            }}
          >
            {primaryShades.map((shade) => (
              <ColorSwatch
                key={shade}
                color={themeColors[themeName][shade]}
                name={shade}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Base Colors */}
      {showBaseColors && (
        <>
          <section>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--color-foreground)',
              }}
            >
              Base Colors - Light Mode
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '1rem',
              }}
            >
              <ColorSwatch
                color={baseColors.light.background}
                name="background"
              />
              <ColorSwatch
                color={baseColors.light.foreground}
                name="foreground"
              />
              <ColorSwatch color={baseColors.light.muted} name="muted" />
              <ColorSwatch
                color={baseColors.light.mutedForeground}
                name="muted-foreground"
              />
              <ColorSwatch color={baseColors.light.border} name="border" />
            </div>
          </section>

          <section>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--color-foreground)',
              }}
            >
              Base Colors - Dark Mode
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '1rem',
              }}
            >
              <ColorSwatch
                color={baseColors.dark.background}
                name="background"
              />
              <ColorSwatch
                color={baseColors.dark.foreground}
                name="foreground"
              />
              <ColorSwatch color={baseColors.dark.muted} name="muted" />
              <ColorSwatch
                color={baseColors.dark.mutedForeground}
                name="muted-foreground"
              />
              <ColorSwatch color={baseColors.dark.border} name="border" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

interface SemanticColorPreviewProps {
  /**
   * Label for the preview section
   */
  label?: string;
}

/**
 * SemanticColorPreview shows how semantic colors look with current theme/mode.
 * This component uses CSS variables directly to demonstrate runtime behavior.
 */
export function SemanticColorPreview({
  label = 'Semantic Colors (Current Theme)',
}: SemanticColorPreviewProps) {
  return (
    <section>
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: 'var(--color-foreground)',
        }}
      >
        {label}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
        >
          <div
            style={{
              width: '100%',
              height: '3rem',
              backgroundColor: 'var(--color-background)',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-border)',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-muted-foreground)',
            }}
          >
            --color-background
          </span>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
        >
          <div
            style={{
              width: '100%',
              height: '3rem',
              backgroundColor: 'var(--color-foreground)',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-border)',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-muted-foreground)',
            }}
          >
            --color-foreground
          </span>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
        >
          <div
            style={{
              width: '100%',
              height: '3rem',
              backgroundColor: 'var(--color-primary)',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-border)',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-muted-foreground)',
            }}
          >
            --color-primary
          </span>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
        >
          <div
            style={{
              width: '100%',
              height: '3rem',
              backgroundColor: 'var(--color-muted)',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-border)',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-muted-foreground)',
            }}
          >
            --color-muted
          </span>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
        >
          <div
            style={{
              width: '100%',
              height: '3rem',
              backgroundColor: 'var(--color-border)',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-foreground)',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-muted-foreground)',
            }}
          >
            --color-border
          </span>
        </div>
      </div>
    </section>
  );
}
