import { KinematicsLessonManifestSchema, type KinematicsLessonManifest } from '@/engine/schema';
import type { KinematicsGraphProps } from './KinematicsGraphMatcher.schema';

/** Node velocities at t = 0, T, 2T. */
export type VNodes = readonly [number, number, number];

const round2 = (x: number) => Number(x.toFixed(2));

export function velocityAt(n: VNodes, T: number, t: number): number {
  const tc = Math.max(0, Math.min(2 * T, t));
  const k = tc <= T ? 0 : 1;
  const tau = tc - k * T;
  return n[k] + ((n[k + 1] - n[k]) * tau) / T;
}

/** Signed displacement and odometer distance within one linear segment, from its start to tau. */
function segmentUpTo(vA: number, vB: number, T: number, tau: number) {
  const a = (vB - vA) / T;
  const disp = (x: number) => vA * x + 0.5 * a * x * x;
  const vEnd = vA + a * tau;
  if (vA * vEnd >= 0 || a === 0) return { disp: disp(tau), dist: Math.abs(disp(tau)) };
  const tz = -vA / a;
  return { disp: disp(tau), dist: Math.abs(disp(tz)) + Math.abs(disp(tau) - disp(tz)) };
}

export function motionAt(n: VNodes, T: number, t: number) {
  const tc = Math.max(0, Math.min(2 * T, t));
  const s1 = segmentUpTo(n[0], n[1], T, Math.min(tc, T));
  const s2 = tc > T ? segmentUpTo(n[1], n[2], T, tc - T) : { disp: 0, dist: 0 };
  return { displacement: s1.disp + s2.disp, distance: s1.dist + s2.dist, velocity: velocityAt(n, T, tc) };
}

export function computePiecewiseKinematics(v0: number, v1: number, v2: number, dt: number) {
  const end = motionAt([v0, v1, v2], dt, 2 * dt);
  return {
    a1: round2((v1 - v0) / dt),
    a2: round2((v2 - v1) / dt),
    netDisplacement: round2(end.displacement),
    totalDistance: round2(end.distance),
  };
}

function velocityPool(props: KinematicsGraphProps, node: 'v0' | 'v1' | 'v2', initial: number) {
  if (props.lockedNodes.includes(node)) return [initial];
  const { min, max, step } = props.velocityBounds;
  const pool: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) pool.push(round2(v));
  return pool;
}

export function isGoalHit(props: KinematicsGraphProps, v0: number, v1: number, v2: number) {
  if (props.targetDisplacementMeters === undefined) return false;
  const m = computePiecewiseKinematics(v0, v1, v2, props.stageDurationSec);
  if (props.requireZeroStage2Accel && Math.abs(m.a2) > 1e-6) return false;
  if (props.targetFinalVelocity !== undefined && Math.abs(v2 - props.targetFinalVelocity) > 1e-6) return false;
  return Math.abs(m.netDisplacement - props.targetDisplacementMeters) <= props.tolerance;
}

export function verifyKinematicsGraphPuzzle(props: KinematicsGraphProps): {
  solvable: boolean;
  solutions: Array<{ v0: number; v1: number; v2: number; disp: number }>;
  reason?: string;
} {
  if (props.targetDisplacementMeters === undefined) return { solvable: true, solutions: [] };
  const target = props.targetDisplacementMeters;
  if (target < props.trackMeters.min || target > props.trackMeters.max) {
    return { solvable: false, solutions: [], reason: `Target s=${target}m lies off the visible track [${props.trackMeters.min}, ${props.trackMeters.max}].` };
  }
  const solutions: Array<{ v0: number; v1: number; v2: number; disp: number }> = [];
  for (const v0 of velocityPool(props, 'v0', props.initialV0)) {
    for (const v1 of velocityPool(props, 'v1', props.initialV1)) {
      for (const v2 of velocityPool(props, 'v2', props.initialV2)) {
        if (isGoalHit(props, v0, v1, v2)) {
          solutions.push({ v0, v1, v2, disp: computePiecewiseKinematics(v0, v1, v2, props.stageDurationSec).netDisplacement });
        }
      }
    }
  }
  if (solutions.length === 0) {
    return {
      solvable: false,
      solutions: [],
      reason: `Unreachable targetDisplacementMeters=${target}${props.targetFinalVelocity !== undefined ? ` ending at v=${props.targetFinalVelocity} m/s` : ''} on discrete velocity grid.`,
    };
  }
  if (props.mode === 'target_puzzle' && isGoalHit(props, props.initialV0, props.initialV1, props.initialV2)) {
    return { solvable: false, solutions, reason: 'Initial (v₀, v₁, v₂) already solves the target puzzle without thumb input.' };
  }
  return { solvable: true, solutions };
}

export function evaluateKinematicsLesson(rawJson: unknown): {
  passed: boolean;
  errors: string[];
  manifest?: KinematicsLessonManifest;
} {
  const parsed = KinematicsLessonManifestSchema.safeParse(rawJson);
  if (!parsed.success) {
    return { passed: false, errors: parsed.error.issues.map((i) => `Zod [${i.path.join('.')}]: ${i.message}`) };
  }
  const manifest = parsed.data;
  const errors: string[] = [];

  for (const card of manifest.cards) {
    const words = card.prompt.en.trim().split(/\s+/).length;
    if (words > 16) errors.push(`Card ${card.cardNumber} Prompt Too Long (${words} words > 16-word phone cap).`);
    if (card.cardStage === 'skills_check') continue;

    const p = card.widgetProps;
    const { min, max } = p.velocityBounds;
    for (const [name, v] of [['v0', p.initialV0], ['v1', p.initialV1], ['v2', p.initialV2]] as const) {
      if (v < min || v > max) errors.push(`Card ${card.cardNumber}: initial ${name}=${v} outside velocityBounds.`);
    }
    // The whole trip must stay on the visible track.
    const T = p.stageDurationSec;
    const nodes: VNodes = [p.initialV0, p.initialV1, p.initialV2];
    for (let i = 0; i <= 16; i++) {
      const s = motionAt(nodes, T, (i / 16) * 2 * T).displacement;
      if (s < p.trackMeters.min - 1e-6 || s > p.trackMeters.max + 1e-6) {
        errors.push(`Card ${card.cardNumber}: EV leaves the track (s=${round2(s)}m).`);
        break;
      }
    }

    if (card.cardStage === 'guided_manipulation') {
      const check = verifyKinematicsGraphPuzzle(p);
      if (!check.solvable) errors.push(`Card 4 Eval Failed: ${check.reason}`);
    }
    if (card.cardStage === 'exam_trap') {
      const correct = card.options[card.correctOptionIndex];
      if (!correct) errors.push('Card 5 Eval Failed: correctOptionIndex out of bounds.');
      else if (correct.isTrapMisconception) errors.push('Card 5 Eval Failed: correctOptionIndex points to a trap misconception.');
      if (!card.options.some((o) => o.isTrapMisconception)) {
        errors.push('Card 5 Eval Failed: must include at least one trap misconception option for the turnaround replay.');
      }
      const m = computePiecewiseKinematics(p.initialV0, p.initialV1, p.initialV2, T);
      if (Math.abs(m.totalDistance - Math.abs(m.netDisplacement)) < 1e-6) {
        errors.push('Card 5 Eval Failed: no velocity reversal, so displacement equals distance and there is no trap to replay.');
      }
      if (m.totalDistance > p.trackMeters.max + 1e-6) {
        errors.push('Card 5 Eval Failed: odometer ghost car would leave the track.');
      }
    }
  }
  return { passed: errors.length === 0, errors, manifest };
}
