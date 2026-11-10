import type { Meta, StoryObj } from '@storybook/react';
import { ProjectileSim } from './ProjectileSim';
import seedLesson from '@/lessons/seeds/hsc-phy-p1-ch3-projectile-01.json';

const meta: Meta<typeof ProjectileSim> = {
  title: 'Physics/ProjectileSim',
  component: ProjectileSim,
};

export default meta;
type Story = StoryObj<typeof ProjectileSim>;

export const Card1ZeroFailToy: Story = {
  args: { config: (seedLesson.cards[0] as any).widgetProps },
};

export const Card4TargetRangePuzzle: Story = {
  args: { config: (seedLesson.cards[3] as any).widgetProps },
};

export const Card5VerticalAxisTrap: Story = {
  args: { config: (seedLesson.cards[4] as any).widgetProps },
};
