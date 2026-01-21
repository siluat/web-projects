import type { Preview } from '@storybook/react';
import '../src/themes.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'blue',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'blue', title: 'Blue' },
          { value: 'green', title: 'Green' },
          { value: 'purple', title: 'Purple' },
          { value: 'orange', title: 'Orange' },
        ],
        dynamicTitle: true,
      },
    },
    colorScheme: {
      description: 'Color scheme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Scheme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'blue';
      const colorScheme = context.globals.colorScheme || 'light';

      return (
        <div
          data-theme={theme}
          data-color-scheme={colorScheme}
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-foreground)',
            padding: '1rem',
            minHeight: '100vh',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
