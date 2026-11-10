import type { FormulaBalancerProps } from './FormulaBalancer.schema';

export function computeScalingRatio(
  numFactor: number,
  denFactor: number,
  numPower: number,
  denPower: number
): number {
  const val = Math.pow(numFactor, numPower) / Math.pow(denFactor, denPower);
  return Number(val.toFixed(4));
}

export function verifyFormulaBalancerPuzzle(props: FormulaBalancerProps) {
  if (props.targetRatio === undefined) {
    return { solvable: true, solutions: [] };
  }
  const solutions: Array<{ numFactor: number; denFactor: number; ratio: number }> = [];
  for (const nf of props.allowedNumFactors) {
    for (const df of props.allowedDenFactors) {
      if (df <= 0) continue;
      const r = computeScalingRatio(nf, df, props.numeratorPower, props.denominatorPower);
      if (Math.abs(r - props.targetRatio) <= props.tolerance) {
        solutions.push({ numFactor: nf, denFactor: df, ratio: r });
      }
    }
  }

  if (solutions.length === 0) {
    return {
      solvable: false,
      solutions: [],
      reason: `Unreachable targetRatio=${props.targetRatio}× from allowed multiplier pools.`,
    };
  }
  return { solvable: true, solutions };
}
