import type { Meta, StoryObj } from '@storybook/react';
import { FormulaBalancer } from './FormulaBalancer';
import seed from '@/lessons/seeds/hsc-phy-p1-ch6-balancer-01.json';

const meta: Meta<typeof FormulaBalancer> = {
  title: 'Physics/FormulaBalancer',
  component: FormulaBalancer,
};
export default meta;
export const Card4Force16x: StoryObj<typeof FormulaBalancer> = {
  args: { config: (seed.cards[1] as any).widgetProps },
};
