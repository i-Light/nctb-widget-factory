import type { Meta, StoryObj } from '@storybook/react';
import { KinematicsGraphMatcher } from './KinematicsGraphMatcher';
import seed from '@/lessons/seeds/hsc-phy-p1-ch3-graphs-01.json';

const meta: Meta<typeof KinematicsGraphMatcher> = {
  title: 'Physics/KinematicsGraphMatcher',
  component: KinematicsGraphMatcher,
};
export default meta;
export const Card4Cruise60m: StoryObj<typeof KinematicsGraphMatcher> = {
  args: { config: (seed.cards[1] as any).widgetProps },
};
