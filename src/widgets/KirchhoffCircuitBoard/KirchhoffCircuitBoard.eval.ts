import type { KirchhoffProps } from './KirchhoffCircuitBoard.schema';

export function computeCircuitMetrics(
  topology: 'series' | 'parallel',
  voltage: number,
  r1: number,
  r2: number
) {
  const req = topology === 'series' ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const totalCurrent = voltage / req;
  return {
    req: Number(req.toFixed(4)),
    totalCurrent: Number(totalCurrent.toFixed(4)),
    i1: Number((topology === 'series' ? totalCurrent : voltage / r1).toFixed(4)),
    i2: Number((topology === 'series' ? totalCurrent : voltage / r2).toFixed(4)),
  };
}

export function computeWheatstoneShunt(
  P: number,
  Q: number,
  R: number,
  SInitial: number,
  addedResistor: number,
  connection: 'series' | 'parallel'
) {
  const sEffective =
    connection === 'series'
      ? SInitial + addedResistor
      : (SInitial * addedResistor) / (SInitial + addedResistor);
  const sRequired = (Q / P) * R;
  const imbalance = Number((P / Q - R / sEffective).toFixed(4));
  return {
    sEffective: Number(sEffective.toFixed(4)),
    sRequired: Number(sRequired.toFixed(4)),
    balanced: Math.abs(sEffective - sRequired) < 1e-4,
    galvanometerDeflection: imbalance,
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
    return { solvable: true, solutions: [] };
  }

  const r1Pool = props.lockedControls.includes('R1')
    ? [props.initialR1]
    : props.allowedResistorValues;
  const r2Pool = props.lockedControls.includes('R2')
    ? [props.initialR2]
    : props.allowedResistorValues;

  const solutions: Array<{ r1: number; r2: number; req: number; current: number }> = [];

  for (const r1 of r1Pool) {
    for (const r2 of r2Pool) {
      const m = computeCircuitMetrics(props.topology, props.supplyVoltage, r1, r2);
      const val =
        props.targetMetric === 'totalCurrent' ? m.totalCurrent : m.req;
      if (Math.abs(val - props.targetValue) <= props.tolerance) {
        solutions.push({ r1, r2, req: m.req, current: m.totalCurrent });
      }
    }
  }

  if (solutions.length === 0) {
    return {
      solvable: false,
      solutions: [],
      reason: `Unreachable ${props.targetMetric}=${props.targetValue} across resistor pool [${props.allowedResistorValues.join(', ')}] in ${props.topology} topology.`,
    };
  }
  return { solvable: true, solutions };
}
