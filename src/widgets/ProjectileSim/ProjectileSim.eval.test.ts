import { describe, expect, it } from 'vitest';
import seedLesson from '@/lessons/seeds/hsc-phy-p1-ch3-projectile-01.json';
import { evaluateProjectileLesson } from './ProjectileSim.eval';

describe('ProjectileSim Deterministic Evals (Gate 1 + Gate 2)', () => {
  it('passes gold-standard HSC Physics Chapter 3 seed JSON', () => {
    const result = evaluateProjectileLesson(seedLesson);
    expect(result.errors).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it('rejects AI-hallucinated unsolvable targetRange beyond slider max', () => {
    const broken = structuredClone(seedLesson);
    const card4 = broken.cards[3] as any;
    card4.widgetProps.targetValue = 95.0; // max possible at u=25, g=10 is 62.5m
    const result = evaluateProjectileLesson(broken);
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toContain('Card 4 Eval Failed');
  });
});
