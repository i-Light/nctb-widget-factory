import {
  RiverBoatLessonManifestSchema,
  type RiverBoatLessonManifest,
} from '@/engine/schema';
import type { VectorRiverBoatProps } from './VectorRiverBoatSim.schema';

export interface RiverBoatMetrics {
  streamAngleDeg: number;
  vx: number;
  vy: number;
  resultantSpeed: number;
  reachesOppositeBank: boolean;
  crossingTimeSec: number;
  lateralDriftMeters: number;
  hitsDownstreamRocks: boolean;
}

export interface RiverBoatEvalResult {
  solvable: boolean;
  solutions: Array<{
    boatSpeed: number;
    headingDeg: number;
    drift: number;
    time: number;
  }>;
  reason?: string;
}

export function computeRiverBoatMetrics(
  riverWidth: number,
  streamSpeed: number,
  boatSpeed: number,
  inputAngleDeg: number,
  angleReference: 'stream' | 'perpendicular' = 'stream',
  downstreamRockMeters?: number
): RiverBoatMetrics {
  const streamAngleDeg =
    angleReference === 'perpendicular' ? 90 + inputAngleDeg : inputAngleDeg;
  const rad = (streamAngleDeg * Math.PI) / 180;

  const vxRaw = streamSpeed + boatSpeed * Math.cos(rad);
  const vyRaw = boatSpeed * Math.sin(rad);
  const vx = Math.abs(vxRaw) < 1e-9 ? 0 : Number(vxRaw.toFixed(4));
  const vy = Math.abs(vyRaw) < 1e-9 ? 0 : Number(vyRaw.toFixed(4));
  const resultantSpeed = Number(Math.hypot(vxRaw, vyRaw).toFixed(4));

  const reachesOppositeBank = vyRaw > 1e-5;
  if (!reachesOppositeBank) {
    return {
      streamAngleDeg,
      vx,
      vy,
      resultantSpeed,
      reachesOppositeBank: false,
      crossingTimeSec: Number.POSITIVE_INFINITY,
      lateralDriftMeters: Number.POSITIVE_INFINITY,
      hitsDownstreamRocks: false,
    };
  }

  const rawTime = riverWidth / vyRaw;
  const rawDrift = vxRaw * rawTime;
  const crossingTimeSec = Number(rawTime.toFixed(4));
  const lateralDriftMeters =
    Math.abs(rawDrift) < 1e-6 ? 0 : Number(rawDrift.toFixed(4));

  let hitsDownstreamRocks = false;
  if (downstreamRockMeters !== undefined) {
    const xAtReef = 0.75 * rawDrift;
    const minRockX = Math.max(4, downstreamRockMeters - 8);
    const maxRockX = downstreamRockMeters + 45;
    hitsDownstreamRocks = xAtReef >= minRockX && xAtReef <= maxRockX;
  }

  return {
    streamAngleDeg,
    vx,
    vy,
    resultantSpeed,
    reachesOppositeBank: true,
    crossingTimeSec,
    lateralDriftMeters,
    hitsDownstreamRocks,
  };
}

export const computerRiverBoatMetrics = computeRiverBoatMetrics;

function enumerateSteps(min: number, max: number, step: number): number[] {
  const list: number[] = [];
  const count = Math.floor((max - min) / step + 1e-9) + 1;
  for (let i = 0; i < count; i++) {
    const val = Number((min + i * step).toFixed(4));
    if (val <= max + 1e-6) list.push(val);
  }
  return list;
}

export function verifyRiverBoatPuzzle(
  props: VectorRiverBoatProps
): RiverBoatEvalResult {
  if (props.targetGoal === 'none') {
    return { solvable: true, solutions: [] };
  }

  const boatSpeeds = props.lockedControls.includes('boatSpeed')
    ? [props.initialBoatSpeed]
    : enumerateSteps(
        props.boatSpeedBounds.min,
        props.boatSpeedBounds.max,
        props.boatSpeedBounds.step
      );

  if (props.targetGoal === 'zero_drift') {
    const maxBoat = Math.max(...boatSpeeds);
    if (maxBoat <= props.initialStreamSpeed) {
      return {
        solvable: false,
        solutions: [],
        reason: `Impossible zero-drift puzzle: max boatSpeed (${maxBoat} m/s) <= streamSpeed (${props.initialStreamSpeed} m/s), so |cos(α)| = u/v >= 1 has no real crossing solution.`,
      };
    }
  }

  const headings = props.lockedControls.includes('heading')
    ? [props.initialHeadingDeg]
    : enumerateSteps(
        props.headingBounds.min,
        props.headingBounds.max,
        props.headingBounds.step
      );

  const solutions: Array<{
    boatSpeed: number;
    headingDeg: number;
    drift: number;
    time: number;
  }> = [];

  let blockedOnlyByRocks = false;

  for (const v of boatSpeeds) {
    const minPossibleTimeForV = props.riverWidth / v;
    for (const h of headings) {
      const m = computeRiverBoatMetrics(
        props.riverWidth,
        props.initialStreamSpeed,
        v,
        h,
        props.angleReference,
        props.downstreamRockMeters
      );
      if (!m.reachesOppositeBank) continue;

      const matchesGoal =
        (props.targetGoal === 'zero_drift' &&
          Math.abs(m.lateralDriftMeters) <= props.tolerance) ||
        (props.targetGoal === 'min_time' &&
          Math.abs(m.crossingTimeSec - minPossibleTimeForV) <= 0.05) ||
        (props.targetGoal === 'target_drift' &&
          props.targetDriftMeters !== undefined &&
          Math.abs(m.lateralDriftMeters - props.targetDriftMeters) <=
            props.tolerance);

      if (matchesGoal) {
        if (m.hitsDownstreamRocks) {
          blockedOnlyByRocks = true;
          continue;
        }
        solutions.push({
          boatSpeed: v,
          headingDeg: h,
          drift: m.lateralDriftMeters,
          time: m.crossingTimeSec,
        });
      }
    }
  }

  if (solutions.length === 0) {
    return {
      solvable: false,
      solutions: [],
      reason: blockedOnlyByRocks
        ? `Target path collides with downstream rocks at +${props.downstreamRockMeters}m.`
        : `No discrete (boatSpeed, headingDeg) step satisfies ${props.targetGoal} within tolerance ±${props.tolerance}m.`,
    };
  }

  if (props.mode === 'target_puzzle') {
    const initM = computeRiverBoatMetrics(
      props.riverWidth,
      props.initialStreamSpeed,
      props.initialBoatSpeed,
      props.initialHeadingDeg,
      props.angleReference,
      props.downstreamRockMeters
    );
    const initSolved =
      initM.reachesOppositeBank &&
      !initM.hitsDownstreamRocks &&
      ((props.targetGoal === 'zero_drift' &&
        Math.abs(initM.lateralDriftMeters) <= props.tolerance) ||
        (props.targetGoal === 'min_time' &&
          Math.abs(
            initM.crossingTimeSec - props.riverWidth / props.initialBoatSpeed
          ) <= 0.05) ||
        (props.targetGoal === 'target_drift' &&
          props.targetDriftMeters !== undefined &&
          Math.abs(initM.lateralDriftMeters - props.targetDriftMeters) <=
            props.tolerance));

    if (initSolved) {
      return {
        solvable: false,
        solutions,
        reason:
          'Initial (boatSpeed, headingDeg) already satisfies the target puzzle without thumb input.',
      };
    }
  }

  return { solvable: true, solutions };
}

export const evaluateRiverBoatConfig = verifyRiverBoatPuzzle;

export function evaluateRiverBoatLesson(rawJson: unknown): {
  passed: boolean;
  errors: string[];
  manifest?: RiverBoatLessonManifest;
} {
  const parsed = RiverBoatLessonManifestSchema.safeParse(rawJson);
  if (!parsed.success) {
    return {
      passed: false,
      errors: parsed.error.issues.map(
        (i) => `Zod [${i.path.join('.')}]: ${i.message}`
      ),
    };
  }

  const manifest = parsed.data;
  const errors: string[] = [];

  for (const card of manifest.cards) {
    const enWordCount = card.prompt.en.trim().split(/\s+/).length;
    if (enWordCount > 16) {
      errors.push(
        `Card ${card.cardNumber} Prompt Too Long (${enWordCount} words > 16-word phone cap).`
      );
    }

    if (card.cardStage === 'guided_manipulation') {
      const check = verifyRiverBoatPuzzle(card.widgetProps);
      if (!check.solvable) {
        errors.push(`Card 4 Eval Failed: ${check.reason}`);
      }
    }

    if (card.cardStage === 'exam_trap') {
      const correctOpt = card.options[card.correctOptionIndex];
      if (!correctOpt) {
        errors.push('Card 5 Eval Failed: correctOptionIndex out of bounds.');
      } else if (correctOpt.isTrapMisconception) {
        errors.push(
          'Card 5 Eval Failed: correctOptionIndex points to a trap misconception.'
        );
      }
      if (!card.options.some((o) => o.isTrapMisconception)) {
        errors.push(
          'Card 5 Eval Failed: must include at least one trap misconception option for dual-boat replay.'
        );
      }
    }
  }

  return { passed: errors.length === 0, errors, manifest };
}
