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
    primary: {
      control: 'select',
      options: ['blue', 'green', 'purple', 'orange'],
      description: 'Primary color to check contrast for',
    },
    theme: {
      control: 'radio',
      options: ['light', 'dark'],
      description: 'Theme',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Shows contrast ratios for Blue primary in light theme.
 */
export const BlueLight: Story = {
  args: {
    primary: 'blue',
    theme: 'light',
  },
};

/**
 * Shows contrast ratios for Blue primary in dark theme.
 */
export const BlueDark: Story = {
  args: {
    primary: 'blue',
    theme: 'dark',
  },
};

/**
 * Shows contrast ratios for Green primary.
 */
export const Green: Story = {
  args: {
    primary: 'green',
    theme: 'light',
  },
};

/**
 * Shows contrast ratios for Purple primary.
 */
export const Purple: Story = {
  args: {
    primary: 'purple',
    theme: 'light',
  },
};

/**
 * Shows contrast ratios for Orange primary.
 */
export const Orange: Story = {
  args: {
    primary: 'orange',
    theme: 'light',
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
    primary: 'blue',
  },
  argTypes: {
    primary: {
      control: 'select',
      options: ['blue', 'green', 'purple', 'orange'],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'A matrix showing contrast ratios between all shades of a primary color. Color-coded cells indicate WCAG compliance: green for AAA/AA, yellow for AA Large, and red for failing combinations.',
      },
    },
  },
};
