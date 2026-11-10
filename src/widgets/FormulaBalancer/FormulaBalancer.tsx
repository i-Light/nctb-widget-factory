'use client';

import React, { useMemo, useState } from 'react';
import type { FormulaBalancerProps } from './FormulaBalancer.schema';
import { computeScalingRatio } from './FormulaBalancer.eval';

export const FormulaBalancer: React.FC<{ config: FormulaBalancerProps }> = ({ config }) => {
  const [nf, setNf] = useState(config.initialNumFactor);
  const [df, setDf] = useState(config.initialDenFactor);
  const ratio = useMemo(
    () => computeScalingRatio(nf, df, config.numeratorPower, config.denominatorPower),
    [nf, df, config.numeratorPower, config.denominatorPower]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs space-y-2">
      <div className="font-bold text-slate-800">Output Ratio F′ / F = {ratio}×</div>
      <div className="flex gap-2">
        {config.allowedNumFactors.map((v) => (
          <button key={v} type="button" onClick={() => setNf(v)} className="px-2 py-1 border rounded">
            Mass ×{v}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {config.allowedDenFactors.map((v) => (
          <button key={v} type="button" onClick={() => setDf(v)} className="px-2 py-1 border rounded">
            Dist ×{v}
          </button>
        ))}
      </div>
    </div>
  );
};
