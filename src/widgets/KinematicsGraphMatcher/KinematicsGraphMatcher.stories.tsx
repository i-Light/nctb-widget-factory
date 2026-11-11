import type { Meta, StoryObj } from '@storybook/react';
import { KinematicsGraphMatcher } from './KinematicsGraphMatcher';
import seed from '@/lessons/seeds/hsc-phy-p1-ch3-graphs-01.json';

const meta: Meta<typeof KinematicsGraphMatcher> = {
  title: 'Physics/KinematicsGraphMatcher',
  component: KinematicsGraphMatcher,
};
export default meta;

export const Card1DragAndDrive: StoryObj<typeof KinematicsGraphMatcher> = {
  args: { config: (seed.cards[0] as any).widgetProps, lang: 'bn' },
};

export const Card4ChargingPadStop: StoryObj<typeof KinematicsGraphMatcher> = {
  args: { config: (seed.cards[3] as any).widgetProps, lang: 'en' },
};

export const Card5TurnaroundTrap: StoryObj<typeof KinematicsGraphMatcher> = {
  args: { config: (seed.cards[4] as any).widgetProps, lang: 'bn', dualReplayTrigger: 1 },
};
