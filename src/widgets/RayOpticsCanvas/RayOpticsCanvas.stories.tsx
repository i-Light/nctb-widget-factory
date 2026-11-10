import type { Meta, StoryObj } from '@storybook/react';
import { RayOpticsCanvas } from './RayOpticsCanvas';
import seed from '@/lessons/seeds/hsc-phy-p2-ch6-rayoptics-01.json';

const meta: Meta<typeof RayOpticsCanvas> = {
  title: 'Physics/RayOpticsCanvas',
  component: RayOpticsCanvas,
};
export default meta;
export const Card1ConvexBench: StoryObj<typeof RayOpticsCanvas> = {
  args: { config: (seed.cards[0] as any).widgetProps },
};
