import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p2-ch6-rayoptics-01.json';
import { verifyRayOpticsPuzzle } from './RayOpticsCanvas.eval';

describe('RayOpticsCanvas Deterministic Evals', () => {
  it('finds real 2x magnification at f=20cm, u=30cm -> v=60cm', () => {
    const res = verifyRayOpticsPuzzle((seed.cards[1] as any).widgetProps);
    expect(res.solvable).toBe(true);
    expect(res.solutions.some((s) => s.f === 20 && s.u === 30)).toBe(true);
  });
});
