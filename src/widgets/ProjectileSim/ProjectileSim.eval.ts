import { ProjectileCardProps } from './ProjectileSim.schema';

export interface ProjectileMetrics {
  thetaRad: number;
  thetaDegFromHorizontal: number;
  v0x: number;
  v0y: number;
  flightTime: number;
  peakHeight: number;
  range: number;
}

export function computeProjectileMetrics(
  initialSpeed: number,
  inputAngleDeg: number,
  gravity: number = 9.8,
  angleAxis: 'horizontal' | 'vertical' = 'horizontal'
): ProjectileMetrics {
  const thetaDegFromHorizontal = angleAxis === 'vertical' ? 90 - inputAngleDeg : inputAngleDeg;
  const thetaRad = (thetaDegFromHorizontal * Math.PI) / 180;
  const v0x = initialSpeed * Math.cos(thetaRad);
  const v0y = initialSpeed * Math.sin(thetaRad);
  const flightTime = (2 * v0y) / gravity;
  const peakHeight = (v0y * v0y) / (2 * gravity);
  const range = (initialSpeed * initialSpeed * Math.sin(2 * thetaRad)) / gravity;

  return {
    thetaRad,
    thetaDegFromHorizontal,
    v0x,
    v0y,
    flightTime,
    peakHeight,
    range
  };
}

export function verifyTargetReachable(
  targetMetric: 'range' | 'peakHeight' | 'flightTime',
  targetValue: number,
  props: ProjectileCardProps,
  stepSize: number = 5
): boolean {
  const [minAngle, maxAngle] = props.angleBounds;
  const g = props.gravity;
  const v0 = props.initialSpeed;

  for (let angle = minAngle; angle <= maxAngle; angle += stepSize) {
    const metrics = computeProjectileMetrics(v0, angle, g, props.angleAxis);
    const value = metrics[targetMetric];
    if (Math.abs(value - targetValue) <= props.tolerance * targetValue) {
      return true;
    }
  }
  return false;
}

export function evaluateProjectileLesson(
  inputAngle: number,
  inputSpeed: number,
  props: ProjectileCardProps
): { gate1Passed: boolean; gate2Passed: boolean; score: number; feedback: string } {
  const metrics = computeProjectileMetrics(inputSpeed, inputAngle, props.gravity, props.angleAxis);
  let targetVal = props.targetValue || 0;
  let currentVal = 0;

  if (props.targetMetric === 'range') currentVal = metrics.range;
  else if (props.targetMetric === 'peakHeight') currentVal = metrics.peakHeight;
  else if (props.targetMetric === 'flightTime') currentVal = metrics.flightTime;

  const diff = Math.abs(currentVal - targetVal);
  const allowed = (props.tolerance || 0.05) * (targetVal || 1);

  const gate1Passed = diff <= allowed;
  const gate2Passed = gate1Passed && props.angleAxis === 'vertical' ? inputAngle === 60 : true;

  const score = gate2Passed ? 100 : gate1Passed ? 80 : 0;
  const feedback = gate2Passed
    ? 'Perfect launch! Target hit with exact vertical-axis trap angle handling.'
    : gate1Passed
    ? 'Close hit! Remember angle is measured from vertical axis.'
    : 'Missed target. Adjust angle handle and velocity vector.';

  return { gate1Passed, gate2Passed, score, feedback };
}
