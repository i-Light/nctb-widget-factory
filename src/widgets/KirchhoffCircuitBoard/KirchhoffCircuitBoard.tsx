'use client';

import React, { useMemo, useState } from 'react';
import type { KirchhoffProps } from './KirchhoffCircuitBoard.schema';
import { computeCircuitMetrics } from './KirchhoffCircuitBoard.eval';

export const KirchhoffCircuitBoard: React.FC<{ config: KirchhoffProps }> = ({ config }) => {
  const [topology, setTopology] = useState<'series' | 'parallel'>(
    config.topology === 'wheatstone' ? 'parallel' : config.topology
  );
  const [r1, setR1] = useState(config.initialR1);
  const [r2, setR2] = useState(config.initialR2);

  const m = useMemo(
    () => computeCircuitMetrics(topology, config.supplyVoltage, r1, r2),
    [topology, config.supplyVoltage, r1, r2]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
        <span>V = {config.supplyVoltage} V ({topology})</span>
        <span className="text-teal-700">R_eq = {m.req} Ω · I = {m.totalCurrent} A</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="font-semibold block mb-1">R₁: {r1} Ω</span>
          <div className="flex gap-1 flex-wrap">
            {config.allowedResistorValues.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setR1(val)}
                className={`px-2 py-1 rounded border ${r1 === val ? 'bg-teal-800 text-white' : 'bg-slate-50'}`}
              >
                {val}Ω
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="font-semibold block mb-1">R₂: {r2} Ω</span>
          <div className="flex gap-1 flex-wrap">
            {config.allowedResistorValues.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setR2(val)}
                className={`px-2 py-1 rounded border ${r2 === val ? 'bg-teal-800 text-white' : 'bg-slate-50'}`}
              >
                {val}Ω
              </button>
            ))}
          </div>
        </div>
      </div>
      {!config.lockedControls.includes('topology') && (
        <div className="mt-2 flex gap-2 text-xs">
          {(['series', 'parallel'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopology(t)}
              className={`px-2.5 py-1 rounded capitalize border ${topology === t ? 'bg-teal-700 text-white' : 'bg-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
