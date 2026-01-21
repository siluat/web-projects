import type { Meta, StoryObj } from '@storybook/react';
import { ColorPalette, SemanticColorPreview } from './ColorPalette';

const meta: Meta<typeof ColorPalette> = {
  title: 'Color Tokens/Color Palette',
  component: ColorPalette,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: [undefined, 'blue', 'green', 'purple', 'orange'],
      description: 'Filter to show only a specific theme',
    },
    showBaseColors: {
      control: 'boolean',
      description: 'Whether to show base semantic colors',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Shows all color themes and their shades (50-950).
 */
export const AllThemes: Story = {
  args: {
    showBaseColors: true,
  },
};

/**
 * Shows only the Blue theme palette.
 */
export const BlueTheme: Story = {
  args: {
    theme: 'blue',
    showBaseColors: false,
  },
};

/**
 * Shows only the Green theme palette.
 */
export const GreenTheme: Story = {
  args: {
    theme: 'green',
    showBaseColors: false,
  },
};

/**
 * Shows only the Purple theme palette.
 */
export const PurpleTheme: Story = {
  args: {
    theme: 'purple',
    showBaseColors: false,
  },
};

/**
 * Shows only the Orange theme palette.
 */
export const OrangeTheme: Story = {
  args: {
    theme: 'orange',
    showBaseColors: false,
  },
};

/**
 * Demonstrates semantic colors using CSS variables.
 * Use the Theme and Mode toolbar controls to see how colors change.
 */
export const SemanticColors: StoryObj<typeof SemanticColorPreview> = {
  render: () => <SemanticColorPreview />,
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates how semantic color tokens respond to theme and mode changes. Use the Theme and Mode controls in the toolbar to see the colors update in real-time.',
      },
    },
  },
};
