import type { Meta, StoryObj } from '@storybook/react';
import { KirchhoffCircuitBoard } from './KirchhoffCircuitBoard';
import seed from '@/lessons/seeds/hsc-phy-p2-ch3-kirchhoff-01.json';

const meta: Meta<typeof KirchhoffCircuitBoard> = {
  title: 'Physics/KirchhoffCircuitBoard',
  component: KirchhoffCircuitBoard,
};
export default meta;

export const Card1ParallelToy: StoryObj<typeof KirchhoffCircuitBoard> = {
  args: { config: (seed.cards[0] as any).widgetProps, lang: 'en' },
};

export const Card4FuseProtectedChallenge: StoryObj<typeof KirchhoffCircuitBoard> = {
  args: { config: (seed.cards[3] as any).widgetProps, lang: 'en' },
};

export const Card5WheatstoneShuntTrap: StoryObj<typeof KirchhoffCircuitBoard> = {
  args: { config: (seed.cards[4] as any).widgetProps, lang: 'en', dualReplayTrigger: 1 },
};
