import {
  KirchhoffLessonManifestSchema,
  type KirchhoffLessonManifest,
} from '@/engine/schema';
import type { KirchhoffProps } from './KirchhoffCircuitBoard.schema';

export interface CircuitMetrics {
  req: number;
  totalCurrent: number;
  activeCurrent: number;
  i1: number;
  i2: number;
  p1: number;
  p2: number;
  totalPower: number;
  midNodeVoltage: number;
  fuseBlown: boolean;
}

export interface WheatstoneMetrics {
  sEffective: number;
  sRequired: number;
  balanced: boolean;
  galvanometerDeflection: number;
  vB: number;
  vD: number;
  igAmps: number;
}

export function computeCircuitMetrics(
  topology: 'series' | 'parallel',
  voltage: number,
  r1: number,
  r2: number,
  maxFuseCurrent?: number
): CircuitMetrics {
  const reqRaw = topology === 'series' ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const rawCurrent = voltage / reqRaw;
  const fuseBlown =
    maxFuseCurrent !== undefined && rawCurrent > maxFuseCurrent + 1e-6;

  const rawI1 = topology === 'series' ? rawCurrent : voltage / r1;
  const rawI2 = topology === 'series' ? rawCurrent : voltage / r2;
  const activeI1 = fuseBlown ? 0 : rawI1;
  const activeI2 = fuseBlown ? 0 : rawI2;
  const p1 = activeI1 * activeI1 * r1;
  const p2 = activeI2 * activeI2 * r2;
  const midNodeVoltage =
    fuseBlown
      ? 0
      : topology === 'series'
      ? voltage * (r2 / (r1 + r2))
      : voltage;

  return {
    req: Number(reqRaw.toFixed(4)),
    totalCurrent: Number(rawCurrent.toFixed(4)),
    activeCurrent: fuseBlown ? 0 : Number(rawCurrent.toFixed(4)),
    i1: Number((fuseBlown ? 0 : rawI1).toFixed(4)),
    i2: Number((fuseBlown ? 0 : rawI2).toFixed(4)),
    p1: Number(p1.toFixed(4)),
    p2: Number(p2.toFixed(4)),
    totalPower: Number((p1 + p2).toFixed(4)),
    midNodeVoltage: Number(midNodeVoltage.toFixed(4)),
    fuseBlown,
  };
}

export function computeWheatstoneShunt(
  P: number,
  Q: number,
  R: number,
  SInitial: number,
  addedResistor: number,
  connection: 'series' | 'parallel',
  supplyVoltage = 12
): WheatstoneMetrics {
  const sEffective =
    connection === 'series'
      ? SInitial + addedResistor
      : (SInitial * addedResistor) / (SInitial + addedResistor);
  const sRequired = (Q / P) * R;
  const imbalance = Number((P / Q - R / sEffective).toFixed(4));
  const vB = supplyVoltage * (Q / (P + Q));
  const vD = supplyVoltage * (sEffective / (R + sEffective));
  const rTh = (P * Q) / (P + Q) + (R * sEffective) / (R + sEffective);
  const igRaw = (vB - vD) / (rTh + 10);

  return {
    sEffective: Number(sEffective.toFixed(4)),
    sRequired: Number(sRequired.toFixed(4)),
    balanced: Math.abs(sEffective - sRequired) < 1e-4,
    galvanometerDeflection: imbalance,
    vB: Number(vB.toFixed(4)),
    vD: Number(vD.toFixed(4)),
    igAmps: Math.abs(igRaw) < 1e-5 ? 0 : Number(igRaw.toFixed(4)),
  };
}

export function verifyKirchhoffPuzzle(props: KirchhoffProps): {
  solvable: boolean;
  solutions: Array<{ r1: number; r2: number; req: number; current: number }>;
  reason?: string;
} {
  if (props.targetMetric === 'none' || props.targetValue === undefined) {
    return { solvable: true, solutions: [] };
  }

  if (props.topology === 'wheatstone') {
    if (!props.bridgeArms) {
      return {
        solvable: false,
        solutions: [],
        reason: 'Wheatstone topology requires bridgeArms { P, Q, R, SInitial }.',
      };
    }
    const { P, Q, R, SInitial } = props.bridgeArms;
    const solutions: Array<{
      r1: number;
      r2: number;
      req: number;
      current: number;
    }> = [];
    for (const rAdd of props.allowedResistorValues) {
      for (const conn of ['series', 'parallel'] as const) {
        const w = computeWheatstoneShunt(
          P,
          Q,
          R,
          SInitial,
          rAdd,
          conn,
          props.supplyVoltage
        );
        if (
          w.balanced &&
          Math.abs(w.sEffective - props.targetValue) <= props.tolerance
        ) {
          solutions.push({
            r1: SInitial,
            r2: rAdd,
            req: w.sEffective,
            current: w.igAmps,
          });
        }
      }
    }
    if (solutions.length === 0) {
      return {
        solvable: false,
        solutions: [],
        reason: `No resistor in [${props.allowedResistorValues.join(', ')}] balances bridge S_req=${((Q / P) * R).toFixed(2)}Ω.`,
      };
    }
    return { solvable: true, solutions };
  }

  const r1Pool = props.lockedControls.includes('R1')
    ? [props.initialR1]
    : props.allowedResistorValues;
  const r2Pool = props.lockedControls.includes('R2')
    ? [props.initialR2]
    : props.allowedResistorValues;

  const solutions: Array<{
    r1: number;
    r2: number;
    req: number;
    current: number;
  }> = [];
  let blockedByFuse = false;

  for (const r1 of r1Pool) {
    for (const r2 of r2Pool) {
      const m = computeCircuitMetrics(
        props.topology,
        props.supplyVoltage,
        r1,
        r2,
        props.maxFuseCurrent
      );
      const val =
        props.targetMetric === 'totalCurrent' ? m.totalCurrent : m.req;
      if (Math.abs(val - props.targetValue) <= props.tolerance) {
        if (m.fuseBlown) {
          blockedByFuse = true;
          continue;
        }
        solutions.push({ r1, r2, req: m.req, current: m.totalCurrent });
      }
    }
  }

  if (solutions.length === 0) {
    return {
      solvable: false,
      solutions: [],
      reason: blockedByFuse
        ? `Target ${props.targetMetric}=${props.targetValue} blows the ${props.maxFuseCurrent}A glass fuse.`
        : `Unreachable ${props.targetMetric}=${props.targetValue} across resistor pool [${props.allowedResistorValues.join(', ')}] in ${props.topology} topology.`,
    };
  }

  if (props.mode === 'target_puzzle') {
    const initM = computeCircuitMetrics(
      props.topology,
      props.supplyVoltage,
      props.initialR1,
      props.initialR2,
      props.maxFuseCurrent
    );
    const initVal =
      props.targetMetric === 'totalCurrent' ? initM.totalCurrent : initM.req;
    if (
      !initM.fuseBlown &&
      Math.abs(initVal - props.targetValue) <= props.tolerance
    ) {
      return {
        solvable: false,
        solutions,
        reason:
          'Initial (R1, R2) already satisfies the target puzzle without thumb input.',
      };
    }
  }

  return { solvable: true, solutions };
}

export function evaluateKirchhoffLesson(rawJson: unknown): {
  passed: boolean;
  errors: string[];
  manifest?: KirchhoffLessonManifest;
} {
  const parsed = KirchhoffLessonManifestSchema.safeParse(rawJson);
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
      const check = verifyKirchhoffPuzzle(card.widgetProps);
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
          'Card 5 Eval Failed: must include at least one trap misconception option for dual-galvanometer replay.'
        );
      }
      const bridgeCheck = verifyKirchhoffPuzzle(card.widgetProps);
      if (!bridgeCheck.solvable) {
        errors.push(`Card 5 Eval Failed: ${bridgeCheck.reason}`);
      }
    }
  }

  return { passed: errors.length === 0, errors, manifest };
}
