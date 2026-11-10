import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p1-ch2-riverboat-01.json';
import { verifyRiverBoatPuzzle } from './VectorRiverBoatSim.eval';

describe('VectorRiverBoatSim Deterministic Evals (Gate 2)', () => {
  it('passes Card 4 zero-drift puzzle on discrete slider grid (u=4, v=8, α=120°)', () => {
    const card4Props = (seed.cards[3] as any).widgetProps;
    const res = verifyRiverBoatPuzzle(card4Props);
    expect(res.solvable).toBe(true);
    expect(res.solutions.some((s) => s.boatSpeed === 8 && s.headingDeg === 120)).toBe(true);
  });

  it('rejects AI hallucination when streamSpeed >= max boatSpeed for zero_drift', () => {
    const brokenProps = structuredClone((seed.cards[3] as any).widgetProps);
    brokenProps.initialStreamSpeed = 10; // boatSpeed max is 8 -> impossible!
    const res = verifyRiverBoatPuzzle(brokenProps);
    expect(res.solvable).toBe(false);
    expect(res.reason).toContain('Impossible zero-drift puzzle');
  });
});
