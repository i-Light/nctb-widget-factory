import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p1-ch3-graphs-01.json';
import {
  computePiecewiseKinematics,
  evaluateKinematicsLesson,
  motionAt,
  verifyKinematicsGraphPuzzle,
} from './KinematicsGraphMatcher.eval';
import { KinematicsGraphPropsSchema } from './KinematicsGraphMatcher.schema';

const cardProps = (idx: number) => KinematicsGraphPropsSchema.parse((seed.cards[idx] as any).widgetProps);

describe('KinematicsGraphMatcher Deterministic Evals (Gate 1 + Gate 2)', () => {
  it('passes the full 6-card HSC Physics P1 Ch-3 phone seed JSON', () => {
    const res = evaluateKinematicsLesson(seed);
    expect(res.errors).toEqual([]);
    expect(res.passed).toBe(true);
  });

  it('Card 2: 0 → 20 → 0 m/s over 8 s covers the 80 m triangle, not 160 m', () => {
    const m = computePiecewiseKinematics(0, 20, 0, 4);
    expect(m.netDisplacement).toBe(80);
    expect(m.a1).toBe(5);
    expect(m.a2).toBe(-5);
  });

  it('integrates position mid-segment: s(2 s) for 0 → 20 m/s in 4 s is ½·a·t² = 10 m', () => {
    const mid = motionAt([0, 20, 0], 4, 2);
    expect(mid.displacement).toBeCloseTo(10, 6);
    expect(mid.velocity).toBe(10);
  });

  it('Card 4 charging pad: only v₁ = 15, v₂ = 0 stops exactly on 60 m', () => {
    const res = verifyKinematicsGraphPuzzle(cardProps(3));
    expect(res.solvable).toBe(true);
    expect(res.solutions).toEqual([{ v0: 0, v1: 15, v2: 0, disp: 60 }]);
  });

  it('rejects AI hallucination: 65 m pad is unreachable on the 5 m/s grid', () => {
    const res = verifyKinematicsGraphPuzzle({ ...cardProps(3), targetDisplacementMeters: 65 });
    expect(res.solvable).toBe(false);
    expect(res.reason).toContain('Unreachable');
  });

  it('rejects a pad placed off the visible track and a pre-solved start', () => {
    expect(verifyKinematicsGraphPuzzle({ ...cardProps(3), targetDisplacementMeters: 140 }).reason).toContain('off the visible track');
    expect(verifyKinematicsGraphPuzzle({ ...cardProps(3), initialV1: 15, initialV2: 0 }).reason).toContain('already solves');
  });

  it('Card 5 turnaround: +20 m then −20 m gives 0 m displacement but 40 m distance', () => {
    const m = computePiecewiseKinematics(10, 0, -10, 4);
    expect(m.netDisplacement).toBe(0);
    expect(m.totalDistance).toBe(40);
    expect(motionAt([10, 0, -10], 4, 4).displacement).toBe(20);
  });

  it('splits odometer distance at a mid-segment zero crossing (10 → −10 m/s)', () => {
    const m = computePiecewiseKinematics(10, -10, -10, 4);
    expect(m.netDisplacement).toBe(-40);
    expect(m.totalDistance).toBe(60); // +10 m, −10 m (crossing at 2 s), then −40 m
  });
});
