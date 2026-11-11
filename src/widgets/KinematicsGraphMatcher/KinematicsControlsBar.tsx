'use client';

import React from 'react';
import { Car, Eye, Minus, Plus, RotateCcw } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { KinematicsGraphProps } from './KinematicsGraphMatcher.schema';
import type { VNodes } from './KinematicsGraphMatcher.eval';
import type { NodeKey } from './KinematicsStageSvg';

export interface KinematicsControlsBarProps {
  config: KinematicsGraphProps;
  lang: 'en' | 'bn';
  nodes: VNodes;
  driving: boolean;
  revealed: boolean;
  xray: boolean;
  hasGhosts: boolean;
  onStepNode: (node: NodeKey, dir: -1 | 1) => void;
  onDrive: () => void;
  onToggleXray: () => void;
  onClearGhosts: () => void;
}

const LABELS: Record<NodeKey, string> = { v0: 'v₀', v1: 'v₁', v2: 'v₂' };
const KEYS: NodeKey[] = ['v0', 'v1', 'v2'];

export const KinematicsControlsBar: React.FC<KinematicsControlsBarProps> = ({
  config, lang, nodes, driving, revealed, xray, hasGhosts, onStepNode, onDrive, onToggleXray, onClearGhosts,
}) => {
  const bn = lang === 'bn';
  const editable = KEYS.filter((k) => !config.lockedNodes.includes(k));
  const { min, max } = config.velocityBounds;
  const stepBtn = 'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-b-2 border-slate-300 bg-white text-slate-800 active:translate-y-0.5 active:border-b-0 transition touch-manipulation disabled:opacity-40';
  const driveLabel =
    config.mode === 'exam_trap'
      ? bn ? 'যাত্রা রিপ্লে' : 'REPLAY TRIP'
      : config.mode === 'predict' && !revealed
      ? bn ? 'চালাও ও দেখো' : 'DRIVE & REVEAL'
      : bn ? `চালাও 0 → ${2 * config.stageDurationSec} s` : `DRIVE 0 → ${2 * config.stageDurationSec} s`;

  return (
    <div className="mt-2 space-y-2">
      {editable.length > 0 && (
        <div className="flex gap-2">
          {editable.map((k) => {
            const v = nodes[KEYS.indexOf(k)];
            return (
              <div key={k} className="flex flex-1 items-center gap-1">
                <button type="button" aria-label={`Decrease ${k}`} disabled={driving || v <= min} onClick={() => onStepNode(k, -1)} className={stepBtn}>
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex min-h-[44px] flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-800">
                  {`${LABELS[k]} = ${v}`}
                </div>
                <button type="button" aria-label={`Increase ${k}`} disabled={driving || v >= max} onClick={() => onStepNode(k, 1)} className={stepBtn}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={driving}
          onClick={onDrive}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 text-sm font-extrabold tracking-wide text-white active:translate-y-1 active:border-b-0 transition touch-manipulation select-none disabled:opacity-60"
        >
          <Car className="h-4 w-4" />
          <span>{driveLabel}</span>
        </button>
        <button
          type="button"
          aria-label="Toggle area X-Ray"
          aria-pressed={xray}
          onClick={() => { sfx.pop(!xray); onToggleXray(); }}
          className={`flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl border-b-4 touch-manipulation active:translate-y-1 active:border-b-0 ${xray ? 'border-teal-800 bg-teal-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
        >
          <Eye className="h-4 w-4" />
        </button>
        {hasGhosts && (
          <button
            type="button"
            aria-label="Clear ghost runs"
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
