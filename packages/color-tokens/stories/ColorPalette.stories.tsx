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
    primary: {
      control: 'select',
      options: [undefined, 'blue', 'green', 'purple', 'orange'],
      description: 'Filter to show only a specific primary color',
    },
    showThemeColors: {
      control: 'boolean',
      description: 'Whether to show theme colors',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Shows all primary colors and their shades (50-950).
 */
export const AllColors: Story = {
  args: {
    showThemeColors: true,
  },
};

/**
 * Shows only the Blue primary color palette.
 */
export const Blue: Story = {
  args: {
    primary: 'blue',
    showThemeColors: false,
  },
};

/**
 * Shows only the Green primary color palette.
 */
export const Green: Story = {
  args: {
    primary: 'green',
    showThemeColors: false,
  },
};

/**
 * Shows only the Purple primary color palette.
 */
export const Purple: Story = {
  args: {
    primary: 'purple',
    showThemeColors: false,
  },
};

/**
 * Shows only the Orange primary color palette.
 */
export const Orange: Story = {
  args: {
    primary: 'orange',
    showThemeColors: false,
  },
};

/**
 * Demonstrates semantic colors using CSS variables.
 * Use the Theme and Primary toolbar controls to see how colors change.
 */
export const SemanticColors: StoryObj<typeof SemanticColorPreview> = {
  render: () => <SemanticColorPreview />,
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates how semantic color tokens respond to theme and primary color changes. Use the Theme and Primary controls in the toolbar to see the colors update in real-time.',
      },
    },
  },
};
