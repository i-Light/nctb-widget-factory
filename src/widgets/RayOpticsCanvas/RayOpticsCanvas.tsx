'use client';

import React, { useMemo, useState } from 'react';
import type { RayOpticsProps } from './RayOpticsCanvas.schema';
import { computeThinLensMetrics } from './RayOpticsCanvas.eval';

export const RayOpticsCanvas: React.FC<{ config: RayOpticsProps }> = ({ config }) => {
  const [fCm, setFCm] = useState(config.initialFocalLengthCm);
  const [uCm, setUCm] = useState(config.initialObjectDistCm);
  const m = useMemo(
    () => computeThinLensMetrics(config.lensType, fCm, uCm),
    [config.lensType, fCm, uCm]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs space-y-2">
      <div className="font-bold text-slate-800">
        {config.lensType.toUpperCase()} Lens (f = {m.f} cm, P = {m.powerDiopter} D) →{' '}
        {m.atInfinity ? 'Rays Parallel (Image at ∞)' : `v = ${m.vCm} cm, m = ${m.magnification}×`}
      </div>
      <input
        type="range"
        min={config.objectDistBounds.min}
        max={config.objectDistBounds.max}
        step={config.objectDistBounds.step}
        value={uCm}
        onChange={(e) => setUCm(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
    </div>
  );
};
