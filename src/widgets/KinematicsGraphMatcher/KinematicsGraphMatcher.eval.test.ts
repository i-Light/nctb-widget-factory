import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p1-ch3-graphs-01.json';
import { verifyKinematicsGraphPuzzle } from './KinematicsGraphMatcher.eval';

describe('KinematicsGraphMatcher Deterministic Evals', () => {
  it('finds unique cruise solution v1=10, v2=10 for s=60m', () => {
    const res = verifyKinematicsGraphPuzzle((seed.cards[1] as any).widgetProps);
    expect(res.solvable).toBe(true);
    expect(res.solutions).toEqual([{ v0: 0, v1: 10, v2: 10, disp: 60 }]);
  });
});
