'use client';

import React from 'react';
import { Flame, RotateCcw } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { ProjectileCardProps } from './ProjectileSim.schema';

export const ProjectileControlsBar: React.FC<{
  config: ProjectileCardProps;
  lang: 'en' | 'bn';
  speed: number;
  angle: number;
  speedSteps: number[];
  canPickSpeed: boolean;
  canDragAngle: boolean;
  hasGhosts: boolean;
  onSelectSpeed: (u: number) => void;
  onStepAngle: (delta: number) => void;
  onFire: () => void;
  onClearGhosts: () => void;
}> = ({
  config,
  lang,
  speed,
  angle,
  speedSteps,
  canPickSpeed,
  canDragAngle,
  hasGhosts,
  onSelectSpeed,
  onStepAngle,
  onFire,
  onClearGhosts,
}) => (
  <div className="mt-2.5 space-y-2">
    {(canPickSpeed || canDragAngle) && (
      <div className="flex items-center justify-between gap-2">
        {canPickSpeed && (
          <div className="flex flex-1 gap-1.5">
            {speedSteps.map((uStep) => (
              <button
                key={uStep}
                type="button"
                onClick={() => {
                  sfx.pop(uStep >= speed);
                  onSelectSpeed(uStep);
                }}
                className={`min-h-[44px] flex-1 rounded-xl border-b-2 px-2 text-xs font-extrabold active:translate-y-0.5 active:border-b-0 transition touch-manipulation ${
                  speed === uStep
                    ? 'border-slate-950 bg-slate-900 text-teal-300'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                u={uStep}
              </button>
            ))}
          </div>
        )}

        {canDragAngle && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onStepAngle(-config.angleBounds.step)}
              className="min-h-[44px] min-w-[44px] rounded-xl border-b-2 border-slate-300 bg-white text-xs font-extrabold text-slate-800 active:translate-y-0.5 active:border-b-0 touch-manipulation"
            >
              {`\u2212${config.angleBounds.step}\u00B0`}
            </button>
            <button
              type="button"
              onClick={() => onStepAngle(config.angleBounds.step)}
              className="min-h-[44px] min-w-[44px] rounded-xl border-b-2 border-slate-300 bg-white text-xs font-extrabold text-slate-800 active:translate-y-0.5 active:border-b-0 touch-manipulation"
            >
              {`+${config.angleBounds.step}\u00B0`}
            </button>
          </div>
        )}
      </div>
    )}

    <div className="flex gap-2">
      <button
        type="button"
        onClick={onFire}
        className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 text-sm font-extrabold tracking-wide text-white active:translate-y-1 active:border-b-0 active:scale-[0.99] transition touch-manipulation select-none"
      >
        <Flame className="h-4 w-4" />
        <span>
          {config.mode === 'exam_trap'
            ? lang === 'bn'
              ? '\u09A6\u09C1\u0987 \u09AC\u09B2\u09C7\u09B0 \u09A4\u09C1\u09B2\u09A8\u09BE \u09A6\u09C7\u0996\u09CB'
              : 'REPLAY 30\u00B0 VS 60\u00B0 BALLS'
            : lang === 'bn'
            ? `\u09AB\u09BE\u09DF\u09BE\u09B0 \u0995\u09B0\u09CB (u=${speed} m/s, \u03B8=${angle}\u00B0)`
            : `FIRE CANNON (${speed} m/s \u00B7 ${angle}\u00B0)`}
        </span>
      </button>

      {hasGhosts && (
        <button
          type="button"
          aria-label="Reset trails"
          onClick={() => {
            sfx.pop(false);
            onClearGhosts();
          }}
          className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl border-b-4 border-slate-300 bg-white text-slate-700 active:translate-y-1 active:border-b-0 touch-manipulation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);
