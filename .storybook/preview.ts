import '../src/app/globals.css';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        budgetAndroid: {
          name: 'Budget Android (360x800)',
          styles: { width: '360px', height: '800px' },
        },
      },
      defaultViewport: 'budgetAndroid',
    },
  },
};

export default preview;
