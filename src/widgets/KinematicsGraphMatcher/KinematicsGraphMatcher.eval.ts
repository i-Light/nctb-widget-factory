import type { KinematicsGraphProps } from './KinematicsGraphMatcher.schema';

function segmentDistanceAndDisplacement(vStart: number, vEnd: number, dt: number) {
  const netDisp = 0.5 * (vStart + vEnd) * dt;
  if (vStart * vEnd >= 0) {
    return { disp: netDisp, dist: Math.abs(netDisp) };
  }
  // Zero crossing inside segment
  const tZero = (Math.abs(vStart) / (Math.abs(vStart) + Math.abs(vEnd))) * dt;
  const d1 = 0.5 * Math.abs(vStart) * tZero;
  const d2 = 0.5 * Math.abs(vEnd) * (dt - tZero);
  return { disp: netDisp, dist: d1 + d2 };
}

export function computePiecewiseKinematics(
  v0: number,
  v1: number,
  v2: number,
  dt: number
) {
  const s1 = segmentDistanceAndDisplacement(v0, v1, dt);
  const s2 = segmentDistanceAndDisplacement(v1, v2, dt);
  return {
    a1: Number(((v1 - v0) / dt).toFixed(2)),
    a2: Number(((v2 - v1) / dt).toFixed(2)),
    netDisplacement: Number((s1.disp + s2.disp).toFixed(2)),
    totalDistance: Number((s1.dist + s2.dist).toFixed(2)),
  };
}

export function verifyKinematicsGraphPuzzle(props: KinematicsGraphProps) {
  if (props.targetDisplacementMeters === undefined) {
    return { solvable: true, solutions: [] };
  }
  const steps: number[] = [];
  for (
    let v = props.velocityBounds.min;
    v <= props.velocityBounds.max + 1e-9;
    v += props.velocityBounds.step
  ) {
    steps.push(Number(v.toFixed(2)));
  }

  const v0Pool = props.lockedNodes.includes('v0') ? [props.initialV0] : steps;
  const v1Pool = props.lockedNodes.includes('v1') ? [props.initialV1] : steps;
  const v2Pool = props.lockedNodes.includes('v2') ? [props.initialV2] : steps;

  const solutions: Array<{ v0: number; v1: number; v2: number; disp: number }> = [];
  for (const v0 of v0Pool) {
    for (const v1 of v1Pool) {
      for (const v2 of v2Pool) {
        const m = computePiecewiseKinematics(v0, v1, v2, props.stageDurationSec);
        if (props.requireZeroStage2Accel && Math.abs(m.a2) > 1e-6) continue;
        if (Math.abs(m.netDisplacement - props.targetDisplacementMeters) <= props.tolerance) {
          solutions.push({ v0, v1, v2, disp: m.netDisplacement });
        }
      }
    }
  }

  if (solutions.length === 0) {
    return {
      solvable: false,
      solutions: [],
      reason: `Unreachable targetDisplacementMeters=${props.targetDisplacementMeters} on discrete velocity grid.`,
    };
  }
  return { solvable: true, solutions };
}
