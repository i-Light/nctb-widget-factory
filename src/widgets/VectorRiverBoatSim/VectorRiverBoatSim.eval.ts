import type { VectorRiverBoatProps } from './VectorRiverBoatSim.schema';

export interface RiverBoatMetrics {
  alphaWithStreamDeg: number;
  vxAlongBank: number;
  vyAcrossRiver: number;
  crossingTimeSec: number;
  lateralDriftMeters: number;
  resultantSpeed: number;
  reachesOppositeBank: boolean;
}

/**
 * NCTB HSC Physics 1st Paper Ch. 2 Convention:
 * - Stream velocity u points along +x (0°).
 * - α (alphaWithStreamDeg) is the angle between stream u and boat heading v.
 *   If angleReference === 'perpendicular', input θ is measured upstream from +y (90°),
 *   so α = 90° + θ.
 */
export function computeRiverBoatMetrics(
  riverWidth: number,
  streamSpeed: number,
  boatSpeed: number,
  inputAngleDeg: number,
  angleReference: 'stream' | 'perpendicular' = 'stream'
): RiverBoatMetrics {
  const alphaWithStreamDeg =
    angleReference === 'perpendicular' ? 90 + inputAngleDeg : inputAngleDeg;
  const rad = (alphaWithStreamDeg * Math.PI) / 180;
  const vxAlongBank = streamSpeed + boatSpeed * Math.cos(rad);
  const vyAcrossRiver = boatSpeed * Math.sin(rad);

  if (vyAcrossRiver <= 1e-6) {
    return {
      alphaWithStreamDeg: Number(alphaWithStreamDeg.toFixed(2)),
      vxAlongBank: Number(vxAlongBank.toFixed(4)),
      vyAcrossRiver: 0,
      crossingTimeSec: Infinity,
      lateralDriftMeters: Infinity,
      resultantSpeed: Math.abs(vxAlongBank),
      reachesOppositeBank: false,
    };
  }

  const crossingTimeSec = riverWidth / vyAcrossRiver;
  const lateralDriftMeters = vxAlongBank * crossingTimeSec;
  const resultantSpeed = Math.hypot(vxAlongBank, vyAcrossRiver);

  return {
    alphaWithStreamDeg: Number(alphaWithStreamDeg.toFixed(2)),
    vxAlongBank: Number(vxAlongBank.toFixed(4)),
    vyAcrossRiver: Number(vyAcrossRiver.toFixed(4)),
    crossingTimeSec: Number(crossingTimeSec.toFixed(4)),
    lateralDriftMeters: Number(lateralDriftMeters.toFixed(4)),
    resultantSpeed: Number(resultantSpeed.toFixed(4)),
    reachesOppositeBank: true,
  };
}

function enumerateSteps(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) {
    out.push(Number(v.toFixed(4)));
  }
  return out;
}

export function verifyRiverBoatPuzzle(props: VectorRiverBoatProps): {
  solvable: boolean;
  solutions: Array<{ boatSpeed: number; headingDeg: number; drift: number; time: number }>;
  reason?: string;
} {
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

  // Classic AI math hallucination check: zero drift requires v > u!
  if (props.targetGoal === 'zero_drift') {
    const maxBoat = Math.max(...boatSpeeds);
    if (maxBoat <= props.initialStreamSpeed) {
      return {
        solvable: false,
        solutions: [],
        reason: `Impossible zero-drift puzzle: max boatSpeed (${maxBoat} m/s) <= streamSpeed (${props.initialStreamSpeed} m/s), so cos(α) = -u/v has no real crossing solution.`,
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

  for (const v of boatSpeeds) {
    const minPossibleTimeForV = props.riverWidth / v;
    for (const h of headings) {
      const m = computeRiverBoatMetrics(
        props.riverWidth,
        props.initialStreamSpeed,
        v,
        h,
        props.angleReference
      );
      if (!m.reachesOppositeBank) continue;

      if (
        props.targetGoal === 'zero_drift' &&
        Math.abs(m.lateralDriftMeters) <= props.tolerance
      ) {
        solutions.push({
          boatSpeed: v,
          headingDeg: h,
          drift: m.lateralDriftMeters,
          time: m.crossingTimeSec,
        });
      } else if (
        props.targetGoal === 'min_time' &&
        Math.abs(m.crossingTimeSec - minPossibleTimeForV) <= 0.05
      ) {
        solutions.push({
          boatSpeed: v,
          headingDeg: h,
          drift: m.lateralDriftMeters,
          time: m.crossingTimeSec,
        });
      } else if (
        props.targetGoal === 'target_drift' &&
        props.targetDriftMeters !== undefined &&
        Math.abs(m.lateralDriftMeters - props.targetDriftMeters) <= props.tolerance
      ) {
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
      reason: `No discrete (boatSpeed, headingDeg) step satisfies ${props.targetGoal} within tolerance ±${props.tolerance}m.`,
    };
  }

  return { solvable: true, solutions };
}
