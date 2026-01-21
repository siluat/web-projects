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
      disable: true,
    },
  },
  globalTypes: {
    theme: {
      description: 'Theme (light/dark)',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    primary: {
      description: 'Primary color',
      defaultValue: 'blue',
      toolbar: {
        title: 'Primary',
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
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      const primary = context.globals.primary || 'blue';

      return (
        <div
          data-theme={theme}
          data-primary={primary}
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
