'use client';

import React from 'react';
import { Minus, Plus, RotateCcw, ScanEye, Sparkles } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { RayOpticsProps } from './RayOpticsCanvas.schema';

export interface RayOpticsControlsBarProps {
  config: RayOpticsProps;
  lang: 'en' | 'bn';
  fAbs: number;
  uCm: number;
  vLabel: string;
  revealed: boolean;
  hasGhosts: boolean;
  onPickFocal: (f: number) => void;
  onStepU: (dir: -1 | 1) => void;
  onPrimary: () => void;
  onClearGhosts: () => void;
}

const diopter = (f: number) => {
  const p = 100 / f;
  return `+${Number.isInteger(p) ? p : p.toFixed(2)}D`;
};

export const RayOpticsControlsBar: React.FC<RayOpticsControlsBarProps> = ({
  config, lang, fAbs, uCm, vLabel, revealed, hasGhosts, onPickFocal, onStepU, onPrimary, onClearGhosts,
}) => {
  const bn = lang === 'bn';
  const canF = !config.lockedControls.includes('focalLength') && config.allowedFocalLengths.length > 1;
  const canU = !config.lockedControls.includes('objectDist');
  const { min, max } = config.objectDistBounds;
  const primaryLabel =
    config.mode === 'exam_trap'
      ? bn ? '±m দ্বৈত রিপ্লে দেখো' : 'REPLAY ±m OVERLAY'
      : config.mode === 'predict' && !revealed
      ? bn ? 'রশ্মি আঁকো' : 'TRACE RAYS'
      : bn ? `রশ্মি লগ করো (v = ${vLabel})` : `TRACE & LOG (v = ${vLabel})`;
  const stepBtn = 'flex min-h-[44px] min-w-[52px] items-center justify-center rounded-xl border-b-2 border-slate-300 bg-white text-slate-800 active:translate-y-0.5 active:border-b-0 transition touch-manipulation disabled:opacity-40';

  return (
    <div className="mt-2 space-y-2">
      {canF && (
        <div className="flex gap-1.5">
          {config.allowedFocalLengths.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => { sfx.pop(f < fAbs); onPickFocal(f); }}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-xl border-b-2 text-xs font-extrabold leading-tight active:translate-y-0.5 active:border-b-0 transition touch-manipulation ${f === fAbs ? 'border-slate-950 bg-slate-900 text-amber-300' : 'border-slate-300 bg-white text-slate-800'}`}
            >
              <span>{diopter(f)}</span>
              <span className={`text-[11px] font-bold ${f === fAbs ? 'text-slate-300' : 'text-slate-500'}`}>f = {f} cm</span>
            </button>
          ))}
        </div>
      )}

      {canU && (
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Move candle closer" disabled={uCm <= min} onClick={() => onStepU(-1)} className={stepBtn}>
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-800">
            {bn ? `বস্তু দূরত্ব u = ${uCm} cm` : `Object distance u = ${uCm} cm`}
          </div>
          <button type="button" aria-label="Move candle farther" disabled={uCm >= max} onClick={() => onStepU(1)} className={stepBtn}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrimary}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 text-sm font-extrabold tracking-wide text-white active:translate-y-1 active:border-b-0 transition touch-manipulation select-none"
        >
          {config.mode === 'exam_trap' ? <Sparkles className="h-4 w-4" /> : <ScanEye className="h-4 w-4" />}
          <span>{primaryLabel}</span>
        </button>
        {hasGhosts && (
          <button
            type="button"
            aria-label="Clear ghost images"
            onClick={() => { sfx.pop(false); onClearGhosts(); }}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl border-b-4 border-slate-300 bg-white text-slate-700 active:translate-y-1 active:border-b-0 touch-manipulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
