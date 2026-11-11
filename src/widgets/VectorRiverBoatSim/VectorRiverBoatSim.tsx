'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '@/engine/audio';
import type { VectorRiverBoatProps } from './VectorRiverBoatSim.schema';
import { computeRiverBoatMetrics } from './VectorRiverBoatSim.eval';
import { RiverBoatStageSvg } from './RiverBoatStageSvg';
import { RiverBoatControlsBar } from './RiverBoatControlsBar';
export interface VectorRiverBoatRuntimeProps {
  config: VectorRiverBoatProps;
  lang?: 'en' | 'bn';
  dualReplayTrigger?: number;
  onGoalSolved?: (sol: {
    boatSpeed: number;
    headingDeg: number;
    drift: number;
    time: number;
  }) => void;
  onCrossingComplete?: (summary: {
    boatSpeed: number;
    headingDeg: number;
    drift: number;
    time: number;
    hitRocks: boolean;
    runCount: number;
  }) => void;
}
export const VectorRiverBoatSim: React.FC<VectorRiverBoatRuntimeProps> = ({
  config,
  lang = 'en',
  dualReplayTrigger = 0,
  onGoalSolved,
  onCrossingComplete
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const crossingRafRef = useRef<number | null>(null);
  const waterRafRef = useRef<number | null>(null);
  const pausedRef = useRef<boolean>(false);
  const [boatSpeed, setBoatSpeed] = useState(config.initialBoatSpeed);
  const [headingDeg, setHeadingDeg] = useState(config.initialHeadingDeg);
  const [showVectors, setShowVectors] = useState(config.showVectorParallelogram);
  const [isDraggingHelm, setIsDraggingHelm] = useState(false);
  const [hasDraggedOnce, setHasDraggedOnce] = useState(false);
  const [streamOffset, setStreamOffset] = useState(0);
  const [crossingProgress, setCrossingProgress] = useState<number | null>(null);
  const [dualTrapMode, setDualTrapMode] = useState(false);
  const [rockSplash, setRockSplash] = useState(false);
  const [ghostWakes, setGhostWakes] = useState<Array<{
    id: number;
    endX: number;
    endY: number;
    label: string;
  }>>([]);
  const [runCount, setRunCount] = useState(0);
  useEffect(() => {
    if (crossingRafRef.current !== null) cancelAnimationFrame(crossingRafRef.current);
    setBoatSpeed(config.initialBoatSpeed);
    setHeadingDeg(config.initialHeadingDeg);
    setShowVectors(config.showVectorParallelogram);
    setCrossingProgress(null);
    setDualTrapMode(false);
    setRockSplash(false);
    setGhostWakes([]);
    setRunCount(0);
  }, [config.mode, config.angleReference, config.initialStreamSpeed, config.initialBoatSpeed, config.initialHeadingDeg, config.downstreamRockMeters, config.targetGoal, config.showVectorParallelogram]);
  useEffect(() => {
    const handleVisibility = () => {
      pausedRef.current = document.visibilityState === 'hidden';
    };
    document.addEventListener('visibilitychange', handleVisibility);
    let lastTs = performance.now();
    const tickWater = (now: number) => {
      const dt = Math.min(50, now - lastTs);
      lastTs = now;
      if (!pausedRef.current) setStreamOffset(prev => (prev + dt * config.initialStreamSpeed * 8.5 / 1000) % 90);
      waterRafRef.current = requestAnimationFrame(tickWater);
    };
    waterRafRef.current = requestAnimationFrame(tickWater);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (waterRafRef.current !== null) cancelAnimationFrame(waterRafRef.current);
      if (crossingRafRef.current !== null) cancelAnimationFrame(crossingRafRef.current);
    };
  }, [config.initialStreamSpeed]);
  const metrics = useMemo(() => computeRiverBoatMetrics(config.riverWidth, config.initialStreamSpeed, boatSpeed, headingDeg, config.angleReference, config.downstreamRockMeters), [config, boatSpeed, headingDeg]);
  const startX = 156;
  const northBankY = 44;
  const southBankY = 224;
  const HELM_R = 64;
  const canDragHelm = !config.lockedControls.includes('heading');
  const canPickBoatSpeed = !config.lockedControls.includes('boatSpeed');
  const boatSpeedPills = useMemo(() => {
    const pills: number[] = [];
    for (let v = config.boatSpeedBounds.min; v <= config.boatSpeedBounds.max + 1e-6; v += config.boatSpeedBounds.step) {
      pills.push(Number(v.toFixed(2)));
    }
    return pills;
  }, [config.boatSpeedBounds]);
  const rawLandX = metrics.reachesOppositeBank ? startX + metrics.lateralDriftMeters * 1.48 : startX - 90;
  const clampedLandX = Math.max(20, Math.min(340, rawLandX));
  const updateHelmFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!canDragHelm || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = (clientX - rect.left) / rect.width * 360;
    const sy = (clientY - rect.top) / rect.height * 272;
    const pointerStreamDeg = Math.atan2(Math.max(6, southBankY - sy), sx - startX) * 180 / Math.PI;
    const rawInput = config.angleReference === 'perpendicular' ? pointerStreamDeg - 90 : pointerStreamDeg;
    const step = config.headingBounds.step;
    const snapped = Math.min(config.headingBounds.max, Math.max(config.headingBounds.min, Math.round(rawInput / step) * step));
    if (snapped !== headingDeg) {
      sfx.tick(0.84 + (snapped - 45) / 210);
      setHeadingDeg(snapped);
      setRockSplash(false);
    }
  }, [canDragHelm, config.angleReference, config.headingBounds, headingDeg]);
  const launchCrossing = useCallback((isDualMisconception: boolean) => {
    if (crossingRafRef.current !== null) cancelAnimationFrame(crossingRafRef.current);
    sfx.launch();
    setDualTrapMode(isDualMisconception);
    setRockSplash(false);
    setCrossingProgress(0);
    const stopFrac = !isDualMisconception && metrics.hitsDownstreamRocks ? 0.75 : 1.0;
    const durationMs = 1080 * stopFrac;
    let elapsed = 0;
    let lastTs = performance.now();
    const stepFrame = (now: number) => {
      const dt = Math.min(48, now - lastTs);
      lastTs = now;
      if (!pausedRef.current) elapsed += dt;
      const frac = Math.min(stopFrac, elapsed / durationMs * stopFrac);
      setCrossingProgress(frac);
      if (frac < stopFrac - 1e-4) {
        crossingRafRef.current = requestAnimationFrame(stepFrame);
      } else {
        crossingRafRef.current = null;
        if (isDualMisconception) return;
        const endX = startX + (clampedLandX - startX) * stopFrac;
        const endY = southBankY - (southBankY - northBankY) * stopFrac;
        if (metrics.hitsDownstreamRocks) {
          setRockSplash(true);
          sfx.nudge();
        }
        const timeLabel = Number.isFinite(metrics.crossingTimeSec) ? `${metrics.crossingTimeSec.toFixed(1)}s` : '∞';
        setGhostWakes(prev => [...prev.slice(-1), {
          id: Date.now(),
          endX,
          endY,
          label: `${headingDeg}° · ${timeLabel}`
        }]);
        const nextCount = runCount + 1;
        setRunCount(nextCount);
        onCrossingComplete?.({
          boatSpeed,
          headingDeg,
          drift: metrics.lateralDriftMeters,
          time: metrics.crossingTimeSec,
          hitRocks: metrics.hitsDownstreamRocks,
          runCount: nextCount
        });
        const solved = !metrics.hitsDownstreamRocks && (config.targetGoal === 'zero_drift' && Math.abs(metrics.lateralDriftMeters) <= config.tolerance || config.targetGoal === 'min_time' && Math.abs(metrics.crossingTimeSec - config.riverWidth / boatSpeed) <= 0.05 || config.targetGoal === 'target_drift' && config.targetDriftMeters !== undefined && Math.abs(metrics.lateralDriftMeters - config.targetDriftMeters) <= config.tolerance);
        if (solved) {
          sfx.chime();
          onGoalSolved?.({
            boatSpeed,
            headingDeg,
            drift: metrics.lateralDriftMeters,
            time: metrics.crossingTimeSec
          });
        } else if (config.targetGoal !== 'none' && !metrics.hitsDownstreamRocks) sfx.nudge();
      }
    };
    crossingRafRef.current = requestAnimationFrame(stepFrame);
  }, [boatSpeed, clampedLandX, config.riverWidth, config.targetDriftMeters, config.targetGoal, config.tolerance, headingDeg, metrics, onCrossingComplete, onGoalSolved, runCount]);
  useEffect(() => {
    if (dualReplayTrigger > 0) launchCrossing(true);
  }, [dualReplayTrigger, launchCrossing]);
  const wakeDots = useMemo(() => {
    if (crossingProgress === null || crossingProgress <= 0.05) return [];
    return Array.from({
      length: 8
    }, (_, idx) => {
      const f = crossingProgress * (idx + 1) / 9;
      return {
        x: dualTrapMode ? startX : startX + (clampedLandX - startX) * f,
        y: southBankY - (southBankY - northBankY) * f,
        r: 2.2 + (idx + 1) / 8 * 1.8
      };
    });
  }, [crossingProgress, dualTrapMode, clampedLandX]);
  const misconceptionBoat = useMemo(() => {
    if (!dualTrapMode || crossingProgress === null) return null;
    return {
      x: Math.max(34, startX - crossingProgress * 76),
      y: Math.min(236, southBankY + crossingProgress * 14),
      bowSvgDeg: -120
    };
  }, [dualTrapMode, crossingProgress]);
  const helmArcPath = useMemo(() => {
    const minS = config.angleReference === 'perpendicular' ? 90 + config.headingBounds.min : config.headingBounds.min;
    const maxS = config.angleReference === 'perpendicular' ? 90 + config.headingBounds.max : config.headingBounds.max;
    const r1 = minS * Math.PI / 180;
    const r2 = maxS * Math.PI / 180;
    return `M ${(startX + HELM_R * Math.cos(r1)).toFixed(1)} ${(southBankY - HELM_R * Math.sin(r1)).toFixed(1)} A ${HELM_R} ${HELM_R} 0 0 0 ${(startX + HELM_R * Math.cos(r2)).toFixed(1)} ${(southBankY - HELM_R * Math.sin(r2)).toFixed(1)}`;
  }, [config.angleReference, config.headingBounds]);
  return <div className="w-full select-none">
      <RiverBoatStageSvg svgRef={svgRef} config={config} lang={lang} boatSpeed={boatSpeed} headingDeg={headingDeg} metrics={metrics} showVectors={showVectors} canDragHelm={canDragHelm} isDraggingHelm={isDraggingHelm} hasDraggedOnce={hasDraggedOnce} streamOffset={streamOffset} crossingProgress={crossingProgress} dualTrapMode={dualTrapMode} rockSplash={rockSplash} clampedLandX={clampedLandX} helmArcPath={helmArcPath} ghostWakes={ghostWakes} wakeDots={wakeDots} misconceptionBoat={misconceptionBoat} onToggleVectors={() => setShowVectors(v => !v)} onStartDrag={(pid, el) => {
      el.setPointerCapture(pid);
      setHasDraggedOnce(true);
      setIsDraggingHelm(true);
      sfx.pop(true);
    }} onMoveDrag={updateHelmFromPointer} onEndDrag={() => setIsDraggingHelm(false)} />
      <RiverBoatControlsBar config={config} lang={lang} boatSpeed={boatSpeed} headingDeg={headingDeg} boatSpeedPills={boatSpeedPills} canPickBoatSpeed={canPickBoatSpeed} canDragHelm={canDragHelm} rockSplash={rockSplash} hasGhosts={ghostWakes.length > 0} onSelectSpeed={v => {
      setBoatSpeed(v);
      setRockSplash(false);
    }} onStepHeading={delta => {
      const next = Math.min(config.headingBounds.max, Math.max(config.headingBounds.min, headingDeg + delta));
      if (next !== headingDeg) {
        sfx.tick(delta > 0 ? 1.12 : 0.86);
        setHeadingDeg(next);
        setRockSplash(false);
      }
    }} onLaunch={() => launchCrossing(config.mode === 'exam_trap')} onClearGhosts={() => {
      setGhostWakes([]);
      setCrossingProgress(null);
      setRockSplash(false);
    }} />
    </div>;
};
