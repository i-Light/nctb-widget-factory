'use client';

import React, { useMemo, useState } from 'react';
import type { VectorRiverBoatProps } from './VectorRiverBoatSim.schema';
import { computeRiverBoatMetrics } from './VectorRiverBoatSim.eval';

export interface VectorRiverBoatRuntimeProps {
  config: VectorRiverBoatProps;
  onGoalSolved?: (sol: { boatSpeed: number; headingDeg: number; drift: number }) => void;
}

export const VectorRiverBoatSim: React.FC<VectorRiverBoatRuntimeProps> = ({
  config,
  onGoalSolved,
}) => {
  const [boatSpeed, setBoatSpeed] = useState(config.initialBoatSpeed);
  const [headingDeg, setHeadingDeg] = useState(config.initialHeadingDeg);

  const metrics = useMemo(
    () =>
      computeRiverBoatMetrics(
        config.riverWidth,
        config.initialStreamSpeed,
        boatSpeed,
        headingDeg,
        config.angleReference
      ),
    [config, boatSpeed, headingDeg]
  );

  const startX = 200;
  const southBankY = 204;
  const northBankY = 44;
  const pxPerMeter = (southBankY - northBankY) / config.riverWidth;
  const landX = Math.max(24, Math.min(396, startX + metrics.lateralDriftMeters * pxPerMeter));

  const checkSolved = (nextV: number, nextH: number) => {
    const m = computeRiverBoatMetrics(
      config.riverWidth,
      config.initialStreamSpeed,
      nextV,
      nextH,
      config.angleReference
    );
    if (
      config.targetGoal === 'zero_drift' &&
      Math.abs(m.lateralDriftMeters) <= config.tolerance
    ) {
      onGoalSolved?.({
        boatSpeed: nextV,
        headingDeg: nextH,
        drift: m.lateralDriftMeters,
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <svg viewBox="0 0 420 236" className="w-full h-auto rounded-xl bg-sky-50">
        <rect x={0} y={northBankY} width={420} height={southBankY - northBankY} fill="#e0f2fe" />
        <line x1={0} y1={northBankY} x2={420} y2={northBankY} stroke="#0f766e" strokeWidth={3} />
        <line x1={0} y1={southBankY} x2={420} y2={southBankY} stroke="#0f766e" strokeWidth={3} />
        <line x1={startX} y1={southBankY} x2={startX} y2={northBankY} stroke="#94a3b8" strokeDasharray="4 4" />
        <line x1={startX} y1={southBankY} x2={landX} y2={northBankY} stroke="#0d9488" strokeWidth={3} />
        <circle cx={startX} cy={southBankY} r={6} fill="#0f3d3e" />
        <circle cx={landX} cy={northBankY} r={6} fill="#f97316" />
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <label className="block">
          <span className="font-semibold text-slate-700">Boat Speed v: {boatSpeed} m/s</span>
          <input
            type="range"
            disabled={config.lockedControls.includes('boatSpeed')}
            min={config.boatSpeedBounds.min}
            max={config.boatSpeedBounds.max}
            step={config.boatSpeedBounds.step}
            value={boatSpeed}
            onChange={(e) => {
              const nv = Number(e.target.value);
              setBoatSpeed(nv);
              checkSolved(nv, headingDeg);
            }}
            className="w-full accent-teal-600 min-h-[36px]"
          />
        </label>
        <label className="block">
          <span className="font-semibold text-slate-700">Heading α: {headingDeg}°</span>
          <input
            type="range"
            disabled={config.lockedControls.includes('heading')}
            min={config.headingBounds.min}
            max={config.headingBounds.max}
            step={config.headingBounds.step}
            value={headingDeg}
            onChange={(e) => {
              const nh = Number(e.target.value);
              setHeadingDeg(nh);
              checkSolved(boatSpeed, nh);
            }}
            className="w-full accent-teal-600 min-h-[36px]"
          />
        </label>
      </div>
    </div>
  );
};
