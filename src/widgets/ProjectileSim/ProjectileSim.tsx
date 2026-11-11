'use client';'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '@/engine/audio';
import type { ProjectileCardProps } from './ProjectileSim.schema';
import { computeProjectileMetrics } from './ProjectileSim.eval';
import { ProjectileStageSvg } from './ProjectileStageSvg';
import { ProjectileControlsBar } from './ProjectileControlsBar';

export interface ProjectileSimRuntimeProps {
  config: ProjectileCardProps;
  lang?: 'en' | 'bn';
  dualReplayTrigger?: number;
  onTargetSolved?: (metrics: { speed: number; angle: number; achieved: number }) => void;
  onRunComplete?: (metrics: {
    speed: number;
    angle: number;
    maxHeight: number;
    range: number;
    runCount: number;
  }) => void;
}

export const ProjectileSim: React.FC<ProjectileSimRuntimeProps> = ({
  config,
  lang = 'en',
  dualReplayTrigger = 0,
  onTargetSolved,
  onRunComplete,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef<boolean>(false);

  const [dragging, setDragging] = useState(false);
  const [hasDraggedOnce, setHasDraggedOnce] = useState(false);
  const [speed, setSpeed] = useState(config.initialSpeed);
  const [angle, setAngle] = useState(config.initialAngle);
  const [showVectors, setShowVectors] = useState(config.showVectorComponents);
  const [flightProgress, setFlightProgress] = useState<number | null>(null);
  const [dualMode, setDualMode] = useState(false);
  const [ghostShots, setGhostShots] = useState<Array<{ id: number; label: string; points: string }>>([]);
  const [runCount, setRunCount] = useState(0);
  const [smokePuffs, setSmokePuffs] = useState<Array<{ id: number; dx: number; dy: number; r: number }>>([]);

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setSpeed(config.initialSpeed);
    setAngle(config.initialAngle);
    setShowVectors(config.showVectorComponents);
    setFlightProgress(null);
    setDualMode(false);
    setGhostShots([]);
    setRunCount(0);
    setSmokePuffs([]);
  }, [config.mode, config.angleAxis, config.initialSpeed, config.initialAngle, config.targetMetric, config.targetValue, config.showVectorComponents]);

  useEffect(() => {
    const onVis = () => {
      pausedRef.current = document.visibilityState === 'hidden';
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const m = useMemo(
    () => computeProjectileMetrics(speed, angle, config.gravity, config.angleAxis),
    [speed, angle, config.gravity, config.angleAxis]
  );

  const OX = 42;
  const GY = 228;
  const maxCfgSpeed = Math.max(config.initialSpeed, config.speedBounds.max, 20);
  const scale = useMemo(() => {
    const maxR = Math.max(48, (maxCfgSpeed * maxCfgSpeed) / config.gravity);
    return Math.min(296 / maxR, 176 / Math.max(24, maxR / 2));
  }, [maxCfgSpeed, config.gravity]);

  const canDragAngle = !config.lockedControls.includes('angle');
  const canPickSpeed = !config.lockedControls.includes('speed');

  const speedSteps = useMemo(() => {
    const out: number[] = [];
    for (let s = config.speedBounds.min; s <= config.speedBounds.max + 1e-6; s += config.speedBounds.step) {
      out.push(Number(s.toFixed(2)));
    }
    return out;
  }, [config.speedBounds]);

  const buildPolyline = useCallback(
    (u: number, horizDeg: number) => {
      const r = (horizDeg * Math.PI) / 180;
      const vx = u * Math.cos(r);
      const vy = u * Math.sin(r);
      const tTotal = Math.max(0.05, (2 * vy) / config.gravity);
      const pts: string[] = [];
      for (let i = 0; i <= 48; i++) {
        const t = (tTotal * i) / 48;
        pts.push(`${(OX + vx * t * scale).toFixed(1)},${(GY - Math.max(0, vy * t - 0.5 * config.gravity * t * t) * scale).toFixed(1)}`);
      }
      return pts.join(' ');
    },
    [config.gravity, scale]
  );

  const updateAngleFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!canDragAngle || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const sx = ((clientX - rect.left) / rect.width) * 360;
      const sy = ((clientY - rect.top) / rect.height) * 268;
      const rawHorizDeg = (Math.atan2(Math.max(6, GY - sy), Math.max(6, sx - OX)) * 180) / Math.PI;
      const rawInput = config.angleAxis === 'vertical' ? 90 - rawHorizDeg : rawHorizDeg;
      const step = config.angleBounds.step;
      const snapped = Math.min(config.angleBounds.max, Math.max(config.angleBounds.min, Math.round(rawInput / step) * step));
      if (snapped !== angle) {
        sfx.tick(0.82 + (snapped - 15) / 140);
        setAngle(snapped);
      }
    },
    [canDragAngle, config.angleAxis, config.angleBounds, angle]
  );

  const startFlightAnimation = useCallback(
    (isDualTrap: boolean) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      sfx.launch();
      setDualMode(isDualTrap);
      setFlightProgress(0);
      setSmokePuffs(Array.from({ length: 8 }, (_, idx) => ({ id: idx, dx: 10 + idx * 4.2, dy: -6 - (idx % 3) * 5, r: 3.5 + (idx % 3) * 1.8 })));

      let elapsed = 0;
      let lastTs = performance.now();
      const stepFrame = (now: number) => {
        const dt = Math.min(48, now - lastTs);
        lastTs = now;
        if (!pausedRef.current) elapsed += dt;
        const p = Math.min(1, elapsed / 1080);
        setFlightProgress(p);

        if (p < 1) {
          rafRef.current = requestAnimationFrame(stepFrame);
        } else {
          rafRef.current = null;
          if (!isDualTrap) {
            const poly = buildPolyline(speed, m.horizontalAngleDeg);
            setGhostShots((prev) => [...prev.slice(-1), { id: Date.now(), label: `${angle}\u00B0 \u00B7 ${m.range.toFixed(1)}m`, points: poly }]);
            const nextCount = runCount + 1;
            setRunCount(nextCount);
            onRunComplete?.({ speed, angle, maxHeight: m.maxHeight, range: m.range, runCount: nextCount });
            if (config.targetMetric !== 'none' && config.targetValue !== undefined) {
              const achieved = config.targetMetric === 'range' ? m.range : m.maxHeight;
              if (Math.abs(achieved - config.targetValue) <= config.tolerance) {
                sfx.chime();
                onTargetSolved?.({ speed, angle, achieved });
              } else sfx.nudge();
            }
          }
        }
      };
      rafRef.current = requestAnimationFrame(stepFrame);
    },
    [angle, buildPolyline, config.targetMetric, config.targetValue, config.tolerance, m, onRunComplete, onTargetSolved, runCount, speed]
  );

  useEffect(() => {
    if (dualReplayTrigger > 0) startFlightAnimation(true);
  }, [dualReplayTrigger, startFlightAnimation]);

  const rad = (m.horizontalAngleDeg * Math.PI) / 180;
  const activeBall = useMemo(() => {
    const prog = flightProgress ?? 0;
    const t = prog * m.flightTime;
    const vx = speed * Math.cos(rad);
    const vy0 = speed * Math.sin(rad);
    const vyNow = vy0 - config.gravity * t;
    return {
      cx: OX + vx * t * scale,
      cy: GY - Math.max(0, vy0 * t - 0.5 * config.gravity * t * t) * scale,
      vx,
      vyNow,
      atApex: flightProgress !== null && prog > 0.36 && prog < 0.64 && Math.abs(vyNow) < 2.4,
    };
  }, [flightProgress, m.flightTime, speed, rad, config.gravity, scale]);

  const strobeDots = useMemo(() => {
    if (flightProgress === null) return [];
    const maxT = flightProgress * m.flightTime;
    const vx = speed * Math.cos(rad);
    const vy0 = speed * Math.sin(rad);
    const dots: Array<{ x: number; y: number }> = [];
    for (let t = 0.25; t <= maxT + 1e-4; t += 0.25) {
      dots.push({ x: OX + vx * t * scale, y: GY - Math.max(0, vy0 * t - 0.5 * config.gravity * t * t) * scale });
    }
    return dots.slice(0, 16);
  }, [flightProgress, m.flightTime, speed, rad, config.gravity, scale]);

  const trapGhostBall = useMemo(() => {
    if (!dualMode || flightProgress === null) return null;
    const trapRad = (30 * Math.PI) / 180;
    const vx = speed * Math.cos(trapRad);
    const vy0 = speed * Math.sin(trapRad);
    const t = Math.min((2 * vy0) / config.gravity, flightProgress * m.flightTime);
    return { cx: OX + vx * t * scale, cy: GY - Math.max(0, vy0 * t - 0.5 * config.gravity * t * t) * scale, poly: buildPolyline(speed, 30) };
  }, [dualMode, flightProgress, speed, config.gravity, m.flightTime, scale, buildPolyline]);

  return (
    <div className="w-full select-none">
      <ProjectileStageSvg
        svgRef={svgRef}
        config={config}
        lang={lang}
        angle={angle}
        m={m}
        scale={scale}
        canDragAngle={canDragAngle}
        dragging={dragging}
        hasDraggedOnce={hasDraggedOnce}
        showVectors={showVectors}
        flightProgress={flightProgress}
        previewPoints={buildPolyline(speed, m.horizontalAngleDeg)}
        ghostShots={ghostShots}
        smokePuffs={smokePuffs}
        strobeDots={strobeDots}
        activeBall={activeBall}
        trapGhostBall={trapGhostBall}
        onToggleVectors={() => setShowVectors((v) => !v)}
        onStartDrag={(pid, el) => {
          el.setPointerCapture(pid);
          setHasDraggedOnce(true);
          setDragging(true);
          sfx.pop(true);
        }}
        onMoveDrag={updateAngleFromPointer}
        onEndDrag={() => setDragging(false)}
      />
      <ProjectileControlsBar
        config={config}
        lang={lang}
        speed={speed}
        angle={angle}
        speedSteps={speedSteps}
        canPickSpeed={canPickSpeed}
        canDragAngle={canDragAngle}
        hasGhosts={ghostShots.length > 0}
        onSelectSpeed={setSpeed}
        onStepAngle={(delta) => {
          const next = Math.min(config.angleBounds.max, Math.max(config.angleBounds.min, angle + delta));
          if (next !== angle) {
            sfx.tick(delta > 0 ? 1.12 : 0.85);
            setAngle(next);
          }
        }}
        onFire={() => startFlightAnimation(config.mode === 'exam_trap')}
        onClearGhosts={() => {
          setGhostShots([]);
          setFlightProgress(null);
        }}
      />
    </div>
  );
};

import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { ProjectileCardProps } from './ProjectileSim.schema';
import { computeProjectileMetrics } from './ProjectileSim.eval';

export interface ProjectileSimRuntimeProps {
  config: ProjectileCardProps;
  onTargetSolved?: (metrics: { speed: number; angle: number; achieved: number }) => void;
}

export const ProjectileSim: React.FC<ProjectileSimRuntimeProps> = ({
  config,
  onTargetSolved,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [speed, setSpeed] = useState(config.initialSpeed);
  const [angle, setAngle] = useState(config.initialAngle);
  const [showVectors, setShowVectors] = useState(config.showVectorComponents);

  const m = useMemo(
    () => computeProjectileMetrics(speed, angle, config.gravity, config.angleAxis),
    [speed, angle, config.gravity, config.angleAxis]
  );

  const OX = 66;
  const GY = 268;
  const SCALE = 7.4;
  const AIM_R = 76;
  const canDragAngle = !config.lockedControls.includes('angle');

  const updateAngleFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!canDragAngle || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const sx = ((clientX - rect.left) / rect.width) * 560;
      const sy = ((clientY - rect.top) / rect.height) * 316;
      const deg = (Math.atan2(Math.max(4, GY - sy), Math.max(4, sx - OX)) * 180) / Math.PI;
      const snapped = Math.min(
        config.angleBounds.max,
        Math.max(
          config.angleBounds.min,
          Math.round(deg / config.angleBounds.step) * config.angleBounds.step
        )
      );
      const nextAngle = config.angleAxis === 'vertical' ? 90 - snapped : snapped;
      setAngle(nextAngle);

      if (config.targetMetric !== 'none' && config.targetValue !== undefined) {
        const nextM = computeProjectileMetrics(speed, nextAngle, config.gravity, config.angleAxis);
        const val = config.targetMetric === 'range' ? nextM.range : nextM.maxHeight;
        if (Math.abs(val - config.targetValue) <= config.tolerance) {
          onTargetSolved?.({ speed, angle: nextAngle, achieved: val });
        }
      }
    },
    [canDragAngle, config, speed, onTargetSolved]
  );

  const rad = (m.horizontalAngleDeg * Math.PI) / 180;
  const aimX = OX + AIM_R * Math.cos(-rad);
  const aimY = GY + AIM_R * Math.sin(-rad);

  const curvePts = useMemo(() => {
    const vx = speed * Math.cos(rad);
    const vy = speed * Math.sin(rad);
    const out: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = (m.flightTime * i) / 60;
      out.push(
        `${(OX + vx * t * SCALE).toFixed(1)},${(
          GY -
          Math.max(0, vy * t - 0.5 * config.gravity * t * t) * SCALE
        ).toFixed(1)}`
      );
    }
    return out.join(' ');
  }, [speed, rad, m.flightTime, config.gravity]);

  return (
    <div className="relative rounded-2xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden select-none">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <span className="rounded-xl bg-white/90 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
          H = {m.maxHeight}m · R = {m.range}m
        </span>
        <button
          type="button"
          onClick={() => setShowVectors((v) => !v)}
          className="rounded-xl bg-indigo-600 text-white px-2.5 py-1 text-xs font-bold"
        >
          Vectors {showVectors ? 'ON' : 'OFF'}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 560 316"
        onPointerMove={(e) => dragging && updateAngleFromPointer(e.clientX, e.clientY)}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
        className="w-full h-auto block touch-none"
      >
        <rect x={0} y={0} width={560} height={GY} fill="#F8FAFC" />
        <rect x={0} y={GY} width={560} height={316 - GY} fill="#059669" />
        <polyline fill="none" stroke="#0D9488" strokeWidth={4} points={curvePts} />
        {canDragAngle && (
          <circle
            cx={aimX}
            cy={aimY}
            r={12}
            fill="#0D9488"
            stroke="#FFFFFF"
            strokeWidth={3}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);
              setDragging(true);
            }}
            className="cursor-grab active:cursor-grabbing"
          />
        )}
      </svg>

      {!config.lockedControls.includes('speed') && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
          {[10, 15, 20, 25].map((uStep) => (
            <button
              key={uStep}
              type="button"
              onClick={() => setSpeed(uStep)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-b-2 ${
                speed === uStep ? 'bg-slate-900 text-white border-slate-950' : 'bg-white border-slate-300'
              }`}
            >
              {uStep} m/s
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
