import type { Meta, StoryObj } from '@storybook/react';
import { ProjectileSim } from './ProjectileSim';
import seed from '@/lessons/seeds/hsc-phy-p1-ch3-projectile-01.json';
import { ProjectileCardPropsSchema } from './ProjectileSim.schema';

const meta: Meta<typeof ProjectileSim> = {
  title: 'Physics/ProjectileSim (Phone-Only v2)',
  component: ProjectileSim,
  parameters: {
    viewport: { defaultViewport: 'budgetAndroid' },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectileSim>;

export const Card1ZeroFailToy: Story = {
  args: {
    config: ProjectileCardPropsSchema.parse((seed.cards[0] as any).widgetProps),
  },
};

export const Card2PredictionHook: Story = {
  args: {
    config: ProjectileCardPropsSchema.parse((seed.cards[1] as any).widgetProps),
  },
};

export const Card4TargetRangePuzzle: Story = {
  args: {
    config: ProjectileCardPropsSchema.parse((seed.cards[3] as any).widgetProps),
  },
};

export const Card5VerticalAxisTrap: Story = {
  args: {
    config: ProjectileCardPropsSchema.parse((seed.cards[4] as any).widgetProps),
  },
};
