import '../src/app/globals.css';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: {
        budgetAndroid: {
          name: 'Budget Android Phone (360x800)',
          styles: { width: '360px', height: '800px' },
        },
        modernPhone: {
          name: 'Modern Portrait Phone (390x844)',
          styles: { width: '390px', height: '844px' },
        },
      },
      defaultViewport: 'budgetAndroid',
    },
  },
};

export default preview;
