import type { RayOpticsProps } from './RayOpticsCanvas.schema';

export function computeThinLensMetrics(
  lensType: 'convex' | 'concave',
  focalAbsCm: number,
  objectDistCm: number
) {
  const f = lensType === 'convex' ? focalAbsCm : -focalAbsCm;
  if (Math.abs(objectDistCm - f) < 1e-6) {
    return {
      f,
      vCm: Infinity,
      magnification: Infinity,
      isReal: false,
      atInfinity: true,
      powerDiopter: Number((100 / f).toFixed(2)),
    };
  }
  // NCTB real-is-positive: 1/v + 1/u = 1/f => 1/v = 1/f - 1/u = (u - f)/(u*f)
  const vCm = (objectDistCm * f) / (objectDistCm - f);
  const magnification = -vCm / objectDistCm;
  return {
    f,
    vCm: Number(vCm.toFixed(2)),
    magnification: Number(magnification.toFixed(2)),
    isReal: vCm > 0,
    atInfinity: false,
    powerDiopter: Number((100 / f).toFixed(2)),
  };
}

export function verifyRayOpticsPuzzle(props: RayOpticsProps) {
  if (props.targetGoal === 'none' || props.targetMagnificationAbs === undefined) {
    return { solvable: true, solutions: [] };
  }
  if (props.requireRealImageOnScreen && props.lensType === 'concave') {
    return {
      solvable: false,
      solutions: [],
      reason: 'Impossible optics puzzle: a diverging concave lens cannot project a real image onto a screen.',
    };
  }

  const fPool = props.lockedControls.includes('focalLength')
    ? [props.initialFocalLengthCm]
    : props.allowedFocalLengths;
  const uPool: number[] = [];
  for (
    let u = props.objectDistBounds.min;
    u <= props.objectDistBounds.max + 1e-9;
    u += props.objectDistBounds.step
  ) {
    uPool.push(Number(u.toFixed(2)));
  }

  const solutions: Array<{ f: number; u: number; v: number; m: number }> = [];
  for (const fVal of fPool) {
    for (const uVal of uPool) {
      const m = computeThinLensMetrics(props.lensType, fVal, uVal);
      if (m.atInfinity) continue;
      if (props.requireRealImageOnScreen && !m.isReal) continue;
      if (Math.abs(Math.abs(m.magnification) - props.targetMagnificationAbs) <= props.tolerance) {
        solutions.push({ f: fVal, u: uVal, v: m.vCm, m: m.magnification });
      }
    }
  }

  if (solutions.length === 0) {
    return {
      solvable: false,
      solutions: [],
      reason: `No discrete (f, u) combination produces |m|=${props.targetMagnificationAbs} (real=${props.requireRealImageOnScreen}).`,
    };
  }
  return { solvable: true, solutions };
}
