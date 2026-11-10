'use client';

import React, { useMemo, useState } from 'react';
import type { KinematicsGraphProps } from './KinematicsGraphMatcher.schema';
import { computePiecewiseKinematics } from './KinematicsGraphMatcher.eval';

export const KinematicsGraphMatcher: React.FC<{ config: KinematicsGraphProps }> = ({ config }) => {
  const [v1, setV1] = useState(config.initialV1);
  const [v2, setV2] = useState(config.initialV2);
  const m = useMemo(
    () => computePiecewiseKinematics(config.initialV0, v1, v2, config.stageDurationSec),
    [config.initialV0, v1, v2, config.stageDurationSec]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs space-y-2">
      <div className="font-bold text-slate-800">
        Displacement s = {m.netDisplacement} m · Distance d = {m.totalDistance} m
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="range"
          min={config.velocityBounds.min}
          max={config.velocityBounds.max}
          step={config.velocityBounds.step}
          value={v1}
          onChange={(e) => setV1(Number(e.target.value))}
        />
        <input
          type="range"
          min={config.velocityBounds.min}
          max={config.velocityBounds.max}
          step={config.velocityBounds.step}
          value={v2}
          onChange={(e) => setV2(Number(e.target.value))}
        />
      </div>
    </div>
  );
};
