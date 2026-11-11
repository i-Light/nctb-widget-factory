import type { Meta, StoryObj } from '@storybook/react';
import { VectorRiverBoatSim } from './VectorRiverBoatSim';
import seed from '@/lessons/seeds/hsc-phy-p1-ch2-riverboat-01.json';
import { VectorRiverBoatPropsSchema } from './VectorRiverBoatSim.schema';

const meta: Meta<typeof VectorRiverBoatSim> = {
  title: 'Physics/VectorRiverBoatSim (Phone-Only v2)',
  component: VectorRiverBoatSim,
  parameters: {
    viewport: { defaultViewport: 'budgetAndroid' },
  },
};

export default meta;
type Story = StoryObj<typeof VectorRiverBoatSim>;

export const Card1ExploreCurrent: Story = {
  args: {
    config: VectorRiverBoatPropsSchema.parse((seed.cards[0] as any).widgetProps),
  },
};

export const Card2MinTimePrediction: Story = {
  args: {
    config: VectorRiverBoatPropsSchema.parse((seed.cards[1] as any).widgetProps),
  },
};

export const Card3ZeroDriftFormula: Story = {
  args: {
    config: VectorRiverBoatPropsSchema.parse((seed.cards[2] as any).widgetProps),
  },
};

export const Card4ZeroDriftPuzzle: Story = {
  args: {
    config: VectorRiverBoatPropsSchema.parse((seed.cards[3] as any).widgetProps),
  },
};

export const Card5PerpendicularTrap: Story = {
  args: {
    config: VectorRiverBoatPropsSchema.parse((seed.cards[4] as any).widgetProps),
  },
};
