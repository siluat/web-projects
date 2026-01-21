import type { Meta, StoryObj } from '@storybook/react';
import {
  ContrastChecker,
  ContrastMatrix,
  InteractiveContrastChecker,
} from './ContrastChecker';

const meta: Meta<typeof ContrastChecker> = {
  title: 'Color Tokens/Contrast Checker',
  component: ContrastChecker,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['blue', 'green', 'purple', 'orange'],
      description: 'Theme to check contrast for',
    },
    mode: {
      control: 'radio',
      options: ['light', 'dark'],
      description: 'Color mode',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Shows contrast ratios for the Blue theme in light mode.
 */
export const BlueLightMode: Story = {
  args: {
    theme: 'blue',
    mode: 'light',
  },
};

/**
 * Shows contrast ratios for the Blue theme in dark mode.
 */
export const BlueDarkMode: Story = {
  args: {
    theme: 'blue',
    mode: 'dark',
  },
};

/**
 * Shows contrast ratios for the Green theme.
 */
export const GreenTheme: Story = {
  args: {
    theme: 'green',
    mode: 'light',
  },
};

/**
 * Shows contrast ratios for the Purple theme.
 */
export const PurpleTheme: Story = {
  args: {
    theme: 'purple',
    mode: 'light',
  },
};

/**
 * Shows contrast ratios for the Orange theme.
 */
export const OrangeTheme: Story = {
  args: {
    theme: 'orange',
    mode: 'light',
  },
};

/**
 * Interactive contrast checker where you can input custom colors.
 */
export const Interactive: StoryObj<typeof InteractiveContrastChecker> = {
  render: () => <InteractiveContrastChecker />,
  parameters: {
    docs: {
      description: {
        story:
          'An interactive tool to check contrast ratios between any two colors. Enter hex color codes or use the color picker to see real-time WCAG compliance levels.',
      },
    },
  },
};

/**
 * Matrix view showing contrast ratios between all primary shades.
 */
export const Matrix: StoryObj<typeof ContrastMatrix> = {
  render: (args) => <ContrastMatrix {...args} />,
  args: {
    theme: 'blue',
  },
  argTypes: {
    theme: {
      control: 'select',
      options: ['blue', 'green', 'purple', 'orange'],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'A matrix showing contrast ratios between all shades of a theme. Color-coded cells indicate WCAG compliance: green for AAA/AA, yellow for AA Large, and red for failing combinations.',
      },
    },
  },
};
