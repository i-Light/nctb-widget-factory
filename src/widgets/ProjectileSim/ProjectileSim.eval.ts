import { LessonManifestSchema, type LessonManifest } from '@/engine/schema';
import type { ProjectileCardProps } from './ProjectileSim.schema';

export interface PhysicsMetrics {
  horizontalAngleDeg: number;
  maxHeight: number;
  range: number;
  flightTime: number;
}

export function computeProjectileMetrics(
  speed: number,
  inputAngleDeg: number,
  gravity: number,
  angleAxis: 'horizontal' | 'vertical'
): PhysicsMetrics {
  const horizontalAngleDeg =
    angleAxis === 'vertical' ? 90 - inputAngleDeg : inputAngleDeg;
  const rad = (horizontalAngleDeg * Math.PI) / 180;
  const maxHeight =
    (speed * speed * Math.sin(rad) * Math.sin(rad)) / (2 * gravity);
  const range = (speed * speed * Math.sin(2 * rad)) / gravity;
  const flightTime = (2 * speed * Math.sin(rad)) / gravity;
  return {
    horizontalAngleDeg,
    maxHeight: Number(maxHeight.toFixed(4)),
    range: Number(range.toFixed(4)),
    flightTime: Number(flightTime.toFixed(4)),
  };
}

function enumerateSteps(min: number, max: number, step: number): number[] {
  const values: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) {
    values.push(Number(v.toFixed(4)));
  }
  return values;
}

export function verifyTargetReachable(props: ProjectileCardProps): {
  solvable: boolean;
  matchingPairs: Array<{ speed: number; angle: number; achieved: number }>;
  reason?: string;
} {
  if (props.targetMetric === 'none' || props.targetValue === undefined) {
    return { solvable: true, matchingPairs: [] };
  }

  const speeds = props.lockedControls.includes('speed')
    ? [props.initialSpeed]
    : enumerateSteps(
        props.speedBounds.min,
        props.speedBounds.max,
        props.speedBounds.step
      );

  const angles = props.lockedControls.includes('angle')
    ? [props.initialAngle]
    : enumerateSteps(
        props.angleBounds.min,
        props.angleBounds.max,
        props.angleBounds.step
      );

  const matchingPairs: Array<{ speed: number; angle: number; achieved: number }> = [];

  for (const speed of speeds) {
    for (const angle of angles) {
      const m = computeProjectileMetrics(
        speed,
        angle,
        props.gravity,
        props.angleAxis
      );
      const val = props.targetMetric === 'range' ? m.range : m.maxHeight;
      if (Math.abs(val - props.targetValue) <= props.tolerance) {
        matchingPairs.push({ speed, angle, achieved: val });
      }
    }
  }

  if (matchingPairs.length === 0) {
    return {
      solvable: false,
      matchingPairs,
      reason: `Unreachable ${props.targetMetric}=${props.targetValue} within tolerance ±${props.tolerance} across discrete slider grid.`,
    };
  }

  const initM = computeProjectileMetrics(
    props.initialSpeed,
    props.initialAngle,
    props.gravity,
    props.angleAxis
  );
  const initVal =
    props.targetMetric === 'range' ? initM.range : initM.maxHeight;
  if (Math.abs(initVal - props.targetValue) <= props.tolerance) {
    return {
      solvable: false,
      matchingPairs,
      reason: 'Initial slider values already satisfy targetValue (zero student effort).',
    };
  }

  return { solvable: true, matchingPairs };
}

export function evaluateProjectileLesson(rawJson: unknown): {
  passed: boolean;
  errors: string[];
  manifest?: LessonManifest;
} {
  const parsed = LessonManifestSchema.safeParse(rawJson);
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
      const check = verifyTargetReachable(card.widgetProps);
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
    }
  }

  return { passed: errors.length === 0, errors, manifest };
}
