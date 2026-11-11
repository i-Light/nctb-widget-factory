'use client';

import React from 'react';
import { Flame, Gauge, RotateCcw, ShieldAlert, Zap } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { KirchhoffProps } from './KirchhoffCircuitBoard.schema';
export interface KirchhoffControlsBarProps {
  config: KirchhoffProps;
  lang: 'en' | 'bn';
  topology: 'series' | 'parallel';
  r1: number;
  r2: number;
  activeSocket: 'R1' | 'R2';
  fuseBlown: boolean;
  activeCurrent: number;
  hasGhosts: boolean;
  onSelectSocket: (s: 'R1' | 'R2') => void;
  onAssignResistor: (ohms: number) => void;
  onToggleTopology: () => void;
  onResetFuse: () => void;
  onEnergize: () => void;
  onClearGhosts: () => void;
}
export const KirchhoffControlsBar: React.FC<KirchhoffControlsBarProps> = ({
  config,
  lang,
  topology,
  r1,
  r2,
  activeSocket,
  fuseBlown,
  activeCurrent,
  hasGhosts,
  onSelectSocket,
  onAssignResistor,
  onToggleTopology,
  onResetFuse,
  onEnergize,
  onClearGhosts
}) => {
  if (config.topology === 'wheatstone') {
    return <div className="mt-2.5">
        <button type="button" onClick={onEnergize} className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 text-sm font-extrabold tracking-wide text-white active:translate-y-1 active:border-b-0 transition touch-manipulation select-none">
          <Gauge className="h-4 w-4" />
          <span>
            {lang === 'bn' ? 'দুই গ্যালভানোমিটার তুলনা দেখো (শ্রেণি বনাম শান্ট)' : 'REPLAY DUAL BRIDGE (SERIES VS SHUNT)'}
          </span>
        </button>
      </div>;
  }
  const canEditR1 = !config.lockedControls.includes('R1');
  const canEditR2 = !config.lockedControls.includes('R2');
  const canEditAnyR = canEditR1 || canEditR2;
  const canToggleTopo = !config.lockedControls.includes('topology');
  const currentSelVal = activeSocket === 'R1' ? r1 : r2;
  return <div className="mt-2 space-y-2">
      {fuseBlown && <div className="flex items-center justify-between gap-2 rounded-2xl border-2 border-rose-500 bg-rose-50 p-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-rose-950">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
            <span>
              {lang === 'bn' ? `${config.maxFuseCurrent}A কাঁচের ফিউজ পুড়ে গেছে! রিসেট করো।` : `${config.maxFuseCurrent}A glass fuse blown! Tap breaker to reset.`}
            </span>
          </div>
          <button type="button" onClick={() => {
        sfx.pop(true);
        onResetFuse();
      }} className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl border-b-4 border-rose-800 bg-rose-600 px-3 text-xs font-extrabold text-white active:translate-y-1 active:border-b-0 touch-manipulation">
            <Flame className="h-3.5 w-3.5" />
            <span>{lang === 'bn' ? 'ফিউজ রিসেট' : 'RESET FUSE'}</span>
          </button>
        </div>}

      {(canEditAnyR || canToggleTopo) && <div className="flex items-center justify-between gap-1.5">
          {canEditR1 && <button type="button" onClick={() => {
        sfx.pop(true);
        onSelectSocket('R1');
      }} className={`min-h-[44px] flex-1 rounded-xl border-b-2 px-2 text-xs font-extrabold active:translate-y-0.5 active:border-b-0 transition touch-manipulation ${activeSocket === 'R1' ? 'border-teal-800 bg-teal-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
              Socket R₁ ({r1}Ω)
            </button>}
          {canEditR2 && <button type="button" onClick={() => {
        sfx.pop(true);
        onSelectSocket('R2');
      }} className={`min-h-[44px] flex-1 rounded-xl border-b-2 px-2 text-xs font-extrabold active:translate-y-0.5 active:border-b-0 transition touch-manipulation ${activeSocket === 'R2' ? 'border-teal-800 bg-teal-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
              Socket R₂ ({r2}Ω)
            </button>}
          {canToggleTopo && <button type="button" onClick={() => {
        sfx.pop(topology === 'series');
        onToggleTopology();
      }} className="min-h-[44px] rounded-xl border-b-2 border-amber-700 bg-amber-500 px-3 text-xs font-extrabold text-slate-950 active:translate-y-0.5 active:border-b-0 transition touch-manipulation">
              {topology === 'parallel' ? lang === 'bn' ? 'সমান্তরাল ∥' : 'Parallel ∥' : lang === 'bn' ? 'শ্রেণি ⋯' : 'Series ⋯'}
            </button>}
        </div>}

      {canEditAnyR && <div className="flex gap-1.5">
          {config.allowedResistorValues.map(val => <button key={val} type="button" onClick={() => {
        sfx.pop(val <= currentSelVal);
        onAssignResistor(val);
      }} className={`min-h-[44px] flex-1 rounded-xl border-b-2 text-xs font-extrabold active:translate-y-0.5 active:border-b-0 transition touch-manipulation ${currentSelVal === val ? 'border-slate-950 bg-slate-900 text-amber-300' : 'border-slate-300 bg-white text-slate-800'}`}>
              {val} Ω
            </button>)}
        </div>}

      <div className="flex gap-2">
        <button type="button" onClick={onEnergize} className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 text-sm font-extrabold tracking-wide text-white active:translate-y-1 active:border-b-0 transition touch-manipulation select-none">
          <Zap className="h-4 w-4" />
          <span>
            {lang === 'bn' ? `প্রবাহ লগ করো (I = ${activeCurrent.toFixed(1)} A)` : `PULSE & LOG (I = ${activeCurrent.toFixed(1)} A)`}
          </span>
        </button>

        {hasGhosts && <button type="button" aria-label="Clear ghost readings" onClick={() => {
        sfx.pop(false);
        onClearGhosts();
      }} className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl border-b-4 border-slate-300 bg-white text-slate-700 active:translate-y-1 active:border-b-0 touch-manipulation">
            <RotateCcw className="h-4 w-4" />
          </button>}
      </div>
    </div>;
};
