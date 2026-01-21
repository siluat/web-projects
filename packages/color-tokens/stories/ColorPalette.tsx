import type { PrimaryColor, Theme } from '../src/index';
import {
  primaryColorPalettes,
  primaryColors,
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
   * Which primary color to display. If not provided, shows all primary colors.
   */
  primary?: PrimaryColor;
  /**
   * Whether to show theme colors (background, foreground, etc.)
   */
  showThemeColors?: boolean;
}

/**
 * ColorPalette displays all color tokens for visual reference.
 * It shows primary color shades and theme colors.
 */
export function ColorPalette({
  primary,
  showThemeColors = true,
}: ColorPaletteProps) {
  const colorsToShow = primary ? [primary] : primaryColors;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Primary Colors */}
      {colorsToShow.map((colorName) => (
        <section key={colorName}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '1rem',
              textTransform: 'capitalize',
              color: 'var(--color-foreground)',
            }}
          >
            Primary: {colorName}
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
                color={primaryColorPalettes[colorName][shade]}
                name={shade}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Theme Colors */}
      {showThemeColors && (
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
              Theme: Light
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '1rem',
              }}
            >
              <ColorSwatch
                color={themeColors.light.background}
                name="background"
              />
              <ColorSwatch
                color={themeColors.light.foreground}
                name="foreground"
              />
              <ColorSwatch color={themeColors.light.muted} name="muted" />
              <ColorSwatch
                color={themeColors.light.mutedForeground}
                name="muted-foreground"
              />
              <ColorSwatch color={themeColors.light.border} name="border" />
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
              Theme: Dark
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '1rem',
              }}
            >
              <ColorSwatch
                color={themeColors.dark.background}
                name="background"
              />
              <ColorSwatch
                color={themeColors.dark.foreground}
                name="foreground"
              />
              <ColorSwatch color={themeColors.dark.muted} name="muted" />
              <ColorSwatch
                color={themeColors.dark.mutedForeground}
                name="muted-foreground"
              />
              <ColorSwatch color={themeColors.dark.border} name="border" />
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
 * SemanticColorPreview shows how semantic colors look with current theme/primary.
 * This component uses CSS variables directly to demonstrate runtime behavior.
 */
export function SemanticColorPreview({
  label = 'Semantic Colors (Current Settings)',
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
