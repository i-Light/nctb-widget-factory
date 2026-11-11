'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '@/engine/audio';
import type { RayOpticsProps } from './RayOpticsCanvas.schema';
import { computeThinLensMetrics, isScreenFocusHit } from './RayOpticsCanvas.eval';
import { fmtCm, RayOpticsStageSvg, STAGE } from './RayOpticsStageSvg';
import { RayOpticsControlsBar } from './RayOpticsControlsBar';

export interface RayOpticsRuntimeProps {
  config: RayOpticsProps;
  lang?: 'en' | 'bn';
  dualReplayTrigger?: number;
  onGoalSolved?: (sol: { f: number; u: number; v: number; m: number }) => void;
  onRunComplete?: (summary: { f: number; u: number; v: number; m: number; runCount: number }) => void;
}

export const RayOpticsCanvas: React.FC<RayOpticsRuntimeProps> = ({
  config, lang = 'en', dualReplayTrigger = 0, onGoalSolved, onRunComplete,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const replayRafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const solvedEmittedRef = useRef(false);
  const [fAbs, setFAbs] = useState(config.initialFocalLengthCm);
  const [uCm, setUCm] = useState(config.initialObjectDistCm);
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [xray, setXray] = useState(false);
  const [ghosts, setGhosts] = useState<Array<{ id: number; f: number; u: number }>>([]);
  const [runCount, setRunCount] = useState(0);
  const [replayT, setReplayT] = useState(0);

  useEffect(() => {
    if (replayRafRef.current !== null) cancelAnimationFrame(replayRafRef.current);
    setFAbs(config.initialFocalLengthCm);
    setUCm(config.initialObjectDistCm);
    setDragging(false);
    setHasInteracted(false);
    setRevealed(false);
    setGhosts([]);
    setRunCount(0);
    setReplayT(0);
    solvedEmittedRef.current = false;
  }, [config]);

  useEffect(() => {
    const onVis = () => { pausedRef.current = document.visibilityState === 'hidden'; };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (replayRafRef.current !== null) cancelAnimationFrame(replayRafRef.current);
    };
  }, []);

  const metrics = useMemo(() => computeThinLensMetrics(config.lensType, fAbs, uCm), [config.lensType, fAbs, uCm]);

  const checkGoal = useCallback((f: number, u: number) => {
    if (solvedEmittedRef.current || config.mode !== 'target_puzzle') return;
    const m = computeThinLensMetrics(config.lensType, f, u);
    const hit =
      config.targetGoal === 'screen_focus'
        ? isScreenFocusHit(config, f, u)
        : config.targetGoal === 'real_magnification' && config.targetMagnificationAbs !== undefined &&
          !m.atInfinity && (!config.requireRealImageOnScreen || m.isReal) &&
          Math.abs(Math.abs(m.magnification) - config.targetMagnificationAbs) <= config.tolerance;
    if (hit) {
      solvedEmittedRef.current = true;
      sfx.chime();
      onGoalSolved?.({ f, u, v: m.vCm, m: m.magnification });
    }
  }, [config, onGoalSolved]);

  /** Apply a new u with notch ticks and a pop whenever the candle crosses F or 2F (image flips). */
  const applyU = useCallback((next: number) => {
    const { min, max } = config.objectDistBounds;
    const u = Math.max(min, Math.min(max, next));
    if (u === uCm) return;
    setHasInteracted(true);
    const zone = (x: number) => (x < fAbs ? 0 : x < 2 * fAbs ? 1 : 2);
    if (config.lensType === 'convex' && zone(u) !== zone(uCm)) sfx.pop(u > uCm);
    else if (config.objectDistBounds.step >= 5 || u % 5 === 0) sfx.tick(0.8 + (max - u) / max);
    setUCm(u);
    checkGoal(fAbs, u);
  }, [checkGoal, config.lensType, config.objectDistBounds, fAbs, uCm]);

  const snapU = (raw: number) => {
    const { min, step } = config.objectDistBounds;
    return Number((min + Math.round((raw - min) / step) * step).toFixed(2));
  };

  const clientToStageX = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return ((clientX - rect.left) * STAGE.W) / rect.width;
  };

  const runReplay = useCallback(() => {
    if (replayRafRef.current !== null) cancelAnimationFrame(replayRafRef.current);
    sfx.launch();
    let t = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!pausedRef.current) t = Math.min(1, t + dt / 900);
      // easeOutBack: a little overshoot so images "pop" to size
      const c = 1.6;
      const eased = 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
      setReplayT(t >= 1 ? 1 : Math.max(0.02, eased));
      if (t < 1) replayRafRef.current = requestAnimationFrame(step);
      else replayRafRef.current = null;
    };
    replayRafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (dualReplayTrigger > 0 && config.mode === 'exam_trap') runReplay();
  }, [dualReplayTrigger, config.mode, runReplay]);

  const handlePrimary = () => {
    if (config.mode === 'exam_trap') { runReplay(); return; }
    sfx.launch();
    if (config.mode === 'predict') setRevealed(true);
    setGhosts((prev) => [...prev.slice(-1), { id: Date.now(), f: fAbs, u: uCm }]);
    const next = runCount + 1;
    setRunCount(next);
    onRunComplete?.({ f: fAbs, u: uCm, v: metrics.vCm, m: metrics.magnification, runCount: next });
    checkGoal(fAbs, uCm);
  };

  const vLabel = metrics.atInfinity ? '∞' : `${fmtCm(metrics.vCm)} cm`;

  return (
    <div className="w-full select-none">
      <RayOpticsStageSvg
        svgRef={svgRef}
        config={config}
        lang={lang}
        fAbs={fAbs}
        uCm={uCm}
        metrics={metrics}
        dragging={dragging}
        hasInteracted={hasInteracted}
        revealed={revealed}
        xray={xray}
        ghosts={ghosts.filter((g) => g.u !== uCm || g.f !== fAbs)}
        replayT={replayT}
        onToggleXray={() => setXray((x) => !x)}
        onCandlePointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragOffsetRef.current = STAGE.LX - uCm * STAGE.S - clientToStageX(e.clientX);
          setDragging(true);
          setHasInteracted(true);
          sfx.pop(true);
        }}
        onStagePointerMove={(clientX) => {
          const x = clientToStageX(clientX) + dragOffsetRef.current;
          applyU(snapU((STAGE.LX - x) / STAGE.S));
        }}
        onStagePointerUp={() => setDragging(false)}
      />
      <RayOpticsControlsBar
        config={config}
        lang={lang}
        fAbs={fAbs}
        uCm={uCm}
        vLabel={vLabel}
        revealed={revealed}
        hasGhosts={ghosts.length > 0}
        onPickFocal={(f) => { setHasInteracted(true); setFAbs(f); checkGoal(f, uCm); }}
        onStepU={(dir) => applyU(uCm + dir * Math.max(1, config.objectDistBounds.step))}
        onPrimary={handlePrimary}
        onClearGhosts={() => setGhosts([])}
      />
    </div>
  );
};
