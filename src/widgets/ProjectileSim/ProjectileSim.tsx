'use client';

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
