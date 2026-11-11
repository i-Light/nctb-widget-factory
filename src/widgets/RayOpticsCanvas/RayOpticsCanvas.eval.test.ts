import { describe, expect, it } from 'vitest';
import seed from '@/lessons/seeds/hsc-phy-p2-ch6-rayoptics-01.json';
import { computeThinLensMetrics, evaluateRayOpticsLesson, verifyRayOpticsPuzzle } from './RayOpticsCanvas.eval';
import { RayOpticsPropsSchema } from './RayOpticsCanvas.schema';

const cardProps = (idx: number) => RayOpticsPropsSchema.parse((seed.cards[idx] as any).widgetProps);

describe('RayOpticsCanvas Deterministic Evals (Gate 1 + Gate 2)', () => {
  it('passes the full 6-card HSC Physics P2 Ch-6 phone seed JSON', () => {
    const res = evaluateRayOpticsLesson(seed);
    expect(res.errors).toEqual([]);
    expect(res.passed).toBe(true);
  });

  it('obeys 1/u + 1/v = 1/f across 2F, F and inside F', () => {
    const at2F = computeThinLensMetrics('convex', 15, 30);
    expect(at2F.vCm).toBe(30);
    expect(at2F.magnification).toBe(-1);
    expect(at2F.isReal).toBe(true);

    const atF = computeThinLensMetrics('convex', 15, 15);
    expect(atF.atInfinity).toBe(true);

    const magnifier = computeThinLensMetrics('convex', 20, 10);
    expect(magnifier.vCm).toBe(-20);
    expect(magnifier.magnification).toBe(2);
    expect(magnifier.isReal).toBe(false);

    const concave = computeThinLensMetrics('concave', 20, 30);
    expect(concave.isReal).toBe(false);
    expect(concave.vCm).toBe(-12);
    expect(concave.powerDiopter).toBe(-5);
  });

  it('Card 4 cinema screen: only f = 20 cm, u = 30 cm focuses a sharp 2.0× image at v = 60 cm', () => {
    const res = verifyRayOpticsPuzzle(cardProps(3));
    expect(res.solvable).toBe(true);
    expect(res.solutions).toEqual([{ f: 20, u: 30, v: 60, m: -2 }]);
  });

  it('Card 4 rejects a screen distance no discrete (f, u) can focus at 2×', () => {
    const res = verifyRayOpticsPuzzle({ ...cardProps(3), screenDistanceCm: 50 });
    expect(res.solvable).toBe(false);
    expect(res.reason).toContain('v=50cm screen');
  });

  it('rejects AI hallucination: concave lens projecting a real image on a screen', () => {
    const res = verifyRayOpticsPuzzle({ ...cardProps(3), lensType: 'concave' });
    expect(res.solvable).toBe(false);
    expect(res.reason).toContain('cannot project a real image');
  });

  it('rejects a target puzzle already solved at its initial (f, u)', () => {
    const res = verifyRayOpticsPuzzle({ ...cardProps(3), initialFocalLengthCm: 20, initialObjectDistCm: 30 });
    expect(res.solvable).toBe(false);
    expect(res.reason).toContain('already solves');
  });

  it('Card 5 dual ±m: u = 30 cm (m = −2) and u = 10 cm (m = +2) both work, 2F trap gives m = −1', () => {
    const res = verifyRayOpticsPuzzle(cardProps(4));
    expect(res.solvable).toBe(true);
    expect(res.solutions.map((s) => s.m)).toEqual([-2, 2]);
    expect(computeThinLensMetrics('convex', 20, 40).magnification).toBe(-1);

    const broken = verifyRayOpticsPuzzle({ ...cardProps(4), replayObjectDistsCm: { real: 30, virtual: 10, trap: 30 } });
    expect(broken.solvable).toBe(false);
  });
});
