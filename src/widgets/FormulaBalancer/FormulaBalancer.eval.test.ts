import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p1-ch6-balancer-01.json';
import { verifyFormulaBalancerPuzzle } from './FormulaBalancer.eval';

describe('FormulaBalancer Deterministic Evals', () => {
  it('finds unique 16x force solution via Mass 4x and Distance 0.5x', () => {
    const res = verifyFormulaBalancerPuzzle((seed.cards[1] as any).widgetProps);
    expect(res.solvable).toBe(true);
    expect(res.solutions).toEqual([{ numFactor: 4, denFactor: 0.5, ratio: 16 }]);
  });
});
