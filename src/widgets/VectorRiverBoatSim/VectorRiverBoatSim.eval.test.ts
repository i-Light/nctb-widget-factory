import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p1-ch2-riverboat-01.json';
import {
  computeRiverBoatMetrics,
  evaluateRiverBoatLesson,
  verifyRiverBoatPuzzle,
} from './VectorRiverBoatSim.eval';
import { VectorRiverBoatPropsSchema } from './VectorRiverBoatSim.schema';

describe('VectorRiverBoatSim Deterministic Evals (Gate 1 + Gate 2)', () => {
  it('passes full 6-card gold-standard HSC Physics Ch-2 phone seed JSON', () => {
    const res = evaluateRiverBoatLesson(seed);
    expect(res.errors).toEqual([]);
    expect(res.passed).toBe(true);
  });

  it('passes Card 4 zero-drift + rock-clearance puzzle on discrete grid (u=4, v=8, α=120°)', () => {
    const card4Props = VectorRiverBoatPropsSchema.parse(
      (seed.cards[3] as any).widgetProps
    );
    const res = verifyRiverBoatPuzzle(card4Props);
    expect(res.solvable).toBe(true);
    expect(
      res.solutions.some((s) => s.boatSpeed === 8 && s.headingDeg === 120)
    ).toBe(true);
  });

  it('flags downstream rock collision at +25m when steering straight across (α=90°)', () => {
    const straightMetrics = computeRiverBoatMetrics(120, 4, 8, 90, 'stream', 25);
    expect(straightMetrics.lateralDriftMeters).toBe(60);
    expect(straightMetrics.hitsDownstreamRocks).toBe(true);

    const bullseyeMetrics = computeRiverBoatMetrics(120, 4, 8, 120, 'stream', 25);
    expect(bullseyeMetrics.lateralDriftMeters).toBe(0);
    expect(bullseyeMetrics.hitsDownstreamRocks).toBe(false);
  });

  it('rejects AI hallucination when streamSpeed >= max boatSpeed for zero_drift (|-u/v| >= 1)', () => {
    const brokenProps = VectorRiverBoatPropsSchema.parse({
      ...(seed.cards[3] as any).widgetProps,
      initialStreamSpeed: 10,
    });
    const res = verifyRiverBoatPuzzle(brokenProps);
    expect(res.solvable).toBe(false);
    expect(res.reason).toContain('Impossible zero-drift puzzle');
  });

  it('rejects target_drift puzzles whose path clips downstream rocks', () => {
    const rockBlockedProps = VectorRiverBoatPropsSchema.parse({
      ...(seed.cards[3] as any).widgetProps,
      targetGoal: 'target_drift',
      targetDriftMeters: 40,
      tolerance: 2,
    });
    const res = verifyRiverBoatPuzzle(rockBlockedProps);
    expect(res.solvable).toBe(false);
    expect(res.reason).toContain('collides with downstream rocks');
  });

  it('computes Rajshahi Board perpendicular width-angle (30° upstream = 120° stream)', () => {
    const goodPerp = computeRiverBoatMetrics(120, 4, 8, 30, 'perpendicular');
    expect(goodPerp.streamAngleDeg).toBe(120);
    expect(goodPerp.lateralDriftMeters).toBe(0);

    const trapPerp = computeRiverBoatMetrics(120, 4, 8, 120, 'perpendicular');
    expect(trapPerp.streamAngleDeg).toBe(210);
    expect(trapPerp.reachesOppositeBank).toBe(false);
  });
});
