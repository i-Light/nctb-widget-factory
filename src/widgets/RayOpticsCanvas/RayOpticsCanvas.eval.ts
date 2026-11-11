import { RayOpticsLessonManifestSchema, type RayOpticsLessonManifest } from '@/engine/schema';
import type { RayOpticsProps } from './RayOpticsCanvas.schema';

export interface ThinLensMetrics {
  /** Signed focal length (convex +, concave −), cm. */
  f: number;
  vCm: number;
  magnification: number;
  isReal: boolean;
  atInfinity: boolean;
  powerDiopter: number;
}

export function computeThinLensMetrics(
  lensType: 'convex' | 'concave',
  focalAbsCm: number,
  objectDistCm: number
): ThinLensMetrics {
  const f = lensType === 'convex' ? focalAbsCm : -focalAbsCm;
  const powerDiopter = Number((100 / f).toFixed(2));
  if (Math.abs(objectDistCm - f) < 1e-6) {
    return { f, vCm: Infinity, magnification: Infinity, isReal: false, atInfinity: true, powerDiopter };
  }
  // NCTB real-is-positive: 1/u + 1/v = 1/f  =>  v = u·f / (u − f)
  const vCm = (objectDistCm * f) / (objectDistCm - f);
  const magnification = -vCm / objectDistCm;
  return {
    f,
    vCm: Number(vCm.toFixed(2)),
    magnification: Number(magnification.toFixed(2)),
    isReal: vCm > 0,
    atInfinity: false,
    powerDiopter,
  };
}

/** Card 4: is the image sharp on the fixed screen at the requested |m|? */
export function isScreenFocusHit(props: RayOpticsProps, focalAbsCm: number, objectDistCm: number) {
  if (props.screenDistanceCm === undefined || props.targetMagnificationAbs === undefined) return false;
  const m = computeThinLensMetrics(props.lensType, focalAbsCm, objectDistCm);
  return (
    m.isReal &&
    Math.abs(m.vCm - props.screenDistanceCm) <= props.screenToleranceCm &&
    Math.abs(Math.abs(m.magnification) - props.targetMagnificationAbs) <= props.tolerance
  );
}

function objectDistPool(props: RayOpticsProps): number[] {
  if (props.lockedControls.includes('objectDist')) return [props.initialObjectDistCm];
  const { min, max, step } = props.objectDistBounds;
  const pool: number[] = [];
  for (let u = min; u <= max + 1e-9; u += step) pool.push(Number(u.toFixed(2)));
  return pool;
}

export interface RayOpticsSolution {
  f: number;
  u: number;
  v: number;
  m: number;
}

export function verifyRayOpticsPuzzle(props: RayOpticsProps): {
  solvable: boolean;
  solutions: RayOpticsSolution[];
  reason?: string;
} {
  if (props.targetGoal === 'none') return { solvable: true, solutions: [] };
  if (props.targetMagnificationAbs === undefined) {
    return { solvable: false, solutions: [], reason: `targetGoal=${props.targetGoal} requires targetMagnificationAbs.` };
  }
  const target = props.targetMagnificationAbs;

  if (props.targetGoal === 'dual_magnification') {
    const d = props.replayObjectDistsCm;
    if (!d) {
      return { solvable: false, solutions: [], reason: 'dual_magnification requires replayObjectDistsCm { real, virtual, trap }.' };
    }
    const fAbs = props.initialFocalLengthCm;
    const real = computeThinLensMetrics(props.lensType, fAbs, d.real);
    const virt = computeThinLensMetrics(props.lensType, fAbs, d.virtual);
    const trap = computeThinLensMetrics(props.lensType, fAbs, d.trap);
    const hits = (m: ThinLensMetrics) => !m.atInfinity && Math.abs(Math.abs(m.magnification) - target) <= props.tolerance;
    if (!(real.isReal && hits(real))) {
      return { solvable: false, solutions: [], reason: `u=${d.real}cm does not give a real ${target}× image (m=${real.magnification}).` };
    }
    if (!(!virt.isReal && !virt.atInfinity && hits(virt))) {
      return { solvable: false, solutions: [], reason: `u=${d.virtual}cm does not give a virtual ${target}× image (m=${virt.magnification}).` };
    }
    if (hits(trap)) {
      return { solvable: false, solutions: [], reason: `Trap u=${d.trap}cm also gives ${target}× — not a misconception.` };
    }
    return {
      solvable: true,
      solutions: [
        { f: fAbs, u: d.real, v: real.vCm, m: real.magnification },
        { f: fAbs, u: d.virtual, v: virt.vCm, m: virt.magnification },
      ],
    };
  }

  if (props.requireRealImageOnScreen && props.lensType === 'concave') {
    return {
      solvable: false,
      solutions: [],
      reason: 'Impossible optics puzzle: a diverging concave lens cannot project a real image onto a screen.',
    };
  }
  if (props.targetGoal === 'screen_focus' && props.screenDistanceCm === undefined) {
    return { solvable: false, solutions: [], reason: 'screen_focus requires screenDistanceCm.' };
  }

  const fPool = props.lockedControls.includes('focalLength') ? [props.initialFocalLengthCm] : props.allowedFocalLengths;
  const uPool = objectDistPool(props);
  const solutions: RayOpticsSolution[] = [];
  for (const fVal of fPool) {
    for (const uVal of uPool) {
      const m = computeThinLensMetrics(props.lensType, fVal, uVal);
      if (m.atInfinity) continue;
      const ok =
        props.targetGoal === 'screen_focus'
          ? isScreenFocusHit(props, fVal, uVal)
          : (!props.requireRealImageOnScreen || m.isReal) &&
            Math.abs(Math.abs(m.magnification) - target) <= props.tolerance;
      if (ok) solutions.push({ f: fVal, u: uVal, v: m.vCm, m: m.magnification });
    }
  }

  if (solutions.length === 0) {
    return {
      solvable: false,
      solutions: [],
      reason:
        props.targetGoal === 'screen_focus'
          ? `No discrete (f, u) focuses a ${target}× real image on the v=${props.screenDistanceCm}cm screen.`
          : `No discrete (f, u) combination produces |m|=${target} (real=${props.requireRealImageOnScreen}).`,
    };
  }

  if (props.mode === 'target_puzzle') {
    const init = solutions.find((s) => s.f === props.initialFocalLengthCm && s.u === props.initialObjectDistCm);
    if (init) {
      return { solvable: false, solutions, reason: 'Initial (f, u) already solves the target puzzle without thumb input.' };
    }
  }
  return { solvable: true, solutions };
}

export function evaluateRayOpticsLesson(rawJson: unknown): {
  passed: boolean;
  errors: string[];
  manifest?: RayOpticsLessonManifest;
} {
  const parsed = RayOpticsLessonManifestSchema.safeParse(rawJson);
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
    const fPool = p.lockedControls.includes('focalLength') ? [p.initialFocalLengthCm] : p.allowedFocalLengths;
    if (!fPool.includes(p.initialFocalLengthCm)) {
      errors.push(`Card ${card.cardNumber}: initialFocalLengthCm ${p.initialFocalLengthCm} not in allowedFocalLengths.`);
    }
    if (p.initialObjectDistCm < p.objectDistBounds.min || p.initialObjectDistCm > p.objectDistBounds.max) {
      errors.push(`Card ${card.cardNumber}: initialObjectDistCm ${p.initialObjectDistCm} outside objectDistBounds.`);
    }

    if (card.cardStage === 'guided_manipulation') {
      const check = verifyRayOpticsPuzzle(p);
      if (!check.solvable) errors.push(`Card 4 Eval Failed: ${check.reason}`);
    }
    if (card.cardStage === 'exam_trap') {
      const correct = card.options[card.correctOptionIndex];
      if (!correct) errors.push('Card 5 Eval Failed: correctOptionIndex out of bounds.');
      else if (correct.isTrapMisconception) errors.push('Card 5 Eval Failed: correctOptionIndex points to a trap misconception.');
      if (!card.options.some((o) => o.isTrapMisconception)) {
        errors.push('Card 5 Eval Failed: must include at least one trap misconception option for dual ±m replay.');
      }
      const check = verifyRayOpticsPuzzle(p);
      if (!check.solvable) errors.push(`Card 5 Eval Failed: ${check.reason}`);
    }
  }
  return { passed: errors.length === 0, errors, manifest };
}
