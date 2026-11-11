import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p2-ch3-kirchhoff-01.json';
import {
  computeCircuitMetrics,
  computeWheatstoneShunt,
  evaluateKirchhoffLesson,
  verifyKirchhoffPuzzle,
} from './KirchhoffCircuitBoard.eval';
import { KirchhoffPropsSchema } from './KirchhoffCircuitBoard.schema';

describe('KirchhoffCircuitBoard Deterministic Evals (Gate 1 + Gate 2)', () => {
  it('passes full 6-card gold-standard HSC Physics P2 Ch-3 phone seed JSON', () => {
    const res = evaluateKirchhoffLesson(seed);
    expect(res.errors).toEqual([]);
    expect(res.passed).toBe(true);
  });

  it('verifies Card 4 parallel 6.0A target is solvable via 3Ω || 6Ω = 2Ω without blowing 7.0A fuse', () => {
    const card4Props = KirchhoffPropsSchema.parse((seed.cards[3] as any).widgetProps);
    const res = verifyKirchhoffPuzzle(card4Props);
    expect(res.solvable).toBe(true);
    expect(res.solutions.some((s) => s.r1 === 3 && s.r2 === 6)).toBe(true);
  });

  it('trips the 7.0A glass fuse when 3Ω || 3Ω = 1.5Ω draws an 8.0A surge on 12V', () => {
    const blown = computeCircuitMetrics('parallel', 12, 3, 3, 7.0);
    expect(blown.totalCurrent).toBe(8);
    expect(blown.fuseBlown).toBe(true);
    expect(blown.activeCurrent).toBe(0);

    const safe = computeCircuitMetrics('parallel', 12, 3, 6, 7.0);
    expect(safe.totalCurrent).toBe(6);
    expect(safe.fuseBlown).toBe(false);
    expect(safe.i1).toBe(4);
    expect(safe.i2).toBe(2);
  });

  it('rejects AI hallucination where target current exceeds maxFuseCurrent', () => {
    const brokenProps = KirchhoffPropsSchema.parse({
      ...(seed.cards[3] as any).widgetProps,
      targetValue: 8.0,
      maxFuseCurrent: 7.0,
    });
    const res = verifyKirchhoffPuzzle(brokenProps);
    expect(res.solvable).toBe(false);
    expect(res.reason).toContain('blows the 7A glass fuse');
  });

  it('contrasts Dhaka Board Wheatstone 24Ω parallel shunt (Ig = 0) against 12Ω series trap', () => {
    const seriesTrap = computeWheatstoneShunt(4, 8, 6, 24, 12, 'series', 12);
    expect(seriesTrap.sEffective).toBe(36);
    expect(seriesTrap.balanced).toBe(false);
    expect(Math.abs(seriesTrap.igAmps)).toBeGreaterThan(0.1);

    const parallelShunt = computeWheatstoneShunt(4, 8, 6, 24, 24, 'parallel', 12);
    expect(parallelShunt.sEffective).toBe(12);
    expect(parallelShunt.balanced).toBe(true);
    expect(parallelShunt.vB).toBe(8);
    expect(parallelShunt.vD).toBe(8);
    expect(parallelShunt.igAmps).toBe(0);
  });

  it('computes KVL midpoint voltage 6.0V for symmetric 6Ω + 6Ω series divider on 12V', () => {
    const seriesM = computeCircuitMetrics('series', 12, 6, 6);
    expect(seriesM.req).toBe(12);
    expect(seriesM.totalCurrent).toBe(1);
    expect(seriesM.midNodeVoltage).toBe(6);
  });
});
