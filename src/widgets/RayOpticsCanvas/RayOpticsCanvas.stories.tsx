import type { Meta, StoryObj } from '@storybook/react';
import { RayOpticsCanvas } from './RayOpticsCanvas';
import seed from '@/lessons/seeds/hsc-phy-p2-ch6-rayoptics-01.json';

const meta: Meta<typeof RayOpticsCanvas> = {
  title: 'Physics/RayOpticsCanvas',
  component: RayOpticsCanvas,
};
export default meta;

export const Card1CandleRail: StoryObj<typeof RayOpticsCanvas> = {
  args: { config: (seed.cards[0] as any).widgetProps, lang: 'en' },
};

export const Card4CinemaScreenChallenge: StoryObj<typeof RayOpticsCanvas> = {
  args: { config: (seed.cards[3] as any).widgetProps, lang: 'en' },
};

export const Card5DualMagnificationTrap: StoryObj<typeof RayOpticsCanvas> = {
  args: { config: (seed.cards[4] as any).widgetProps, lang: 'en', dualReplayTrigger: 1 },
};
