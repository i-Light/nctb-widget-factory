import type { Meta, StoryObj } from '@storybook/react';
import { VectorRiverBoatSim } from './VectorRiverBoatSim';
import seed from '@/lessons/seeds/hsc-phy-p1-ch2-riverboat-01.json';

const meta: Meta<typeof VectorRiverBoatSim> = {
  title: 'Physics/VectorRiverBoatSim',
  component: VectorRiverBoatSim,
};

export default meta;
type Story = StoryObj<typeof VectorRiverBoatSim>;

export const Card1ExploreCurrent: Story = {
  args: { config: (seed.cards[0] as any).widgetProps },
};

export const Card4ZeroDriftPuzzle: Story = {
  args: { config: (seed.cards[3] as any).widgetProps },
};

export const Card5PerpendicularTrap: Story = {
  args: { config: (seed.cards[4] as any).widgetProps },
};
