import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p2-ch3-kirchhoff-01.json';
import { verifyKirchhoffPuzzle } from './KirchhoffCircuitBoard.eval';

describe('KirchhoffCircuitBoard Deterministic Evals', () => {
  it('verifies Card 4 parallel 6.0A target is solvable via 3Ω || 6Ω = 2Ω', () => {
    const res = verifyKirchhoffPuzzle((seed.cards[3] as any).widgetProps);
    expect(res.solvable).toBe(true);
    expect(res.solutions.some((s) => s.r1 === 3 && s.r2 === 6)).toBe(true);
  });
});
