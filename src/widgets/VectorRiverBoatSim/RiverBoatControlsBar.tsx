'use client';

import React from 'react';
import { Compass, Navigation, RotateCcw, AlertTriangle } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { VectorRiverBoatProps } from './VectorRiverBoatSim.schema';

export const RiverBoatControlsBar: React.FC<{
  config: VectorRiverBoatProps;
  lang: 'en' | 'bn';
  boatSpeed: number;
  headingDeg: number;
  boatSpeedPills: number[];
  canPickBoatSpeed: boolean;
  canDragHelm: boolean;
  rockSplash: boolean;
  hasGhosts: boolean;
  onSelectSpeed: (v: number) => void;
  onStepHeading: (delta: number) => void;
  onLaunch: () => void;
  onClearGhosts: () => void;
}> = ({
  config,
  lang,
  boatSpeed,
  headingDeg,
  boatSpeedPills,
  canPickBoatSpeed,
  canDragHelm,
  rockSplash,
  hasGhosts,
  onSelectSpeed,
  onStepHeading,
  onLaunch,
  onClearGhosts,
}) => (
  <>
    {rockSplash && (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
        <span>
          {lang === 'bn'
            ? `স্রোত নৌকাকে +${config.downstreamRockMeters}m পাথরে ভাসিয়ে নিয়েছে! উজানে (α > ৯০°) ঘুরাও।`
            : `Current pushed you into the +${config.downstreamRockMeters}m rocks! Steer upstream (α > 90°).`}
        </span>
      </div>
    )}

    <div className="mt-2.5 space-y-2">
      {(canPickBoatSpeed || canDragHelm) && (
        <div className="flex items-center justify-between gap-2">
          {canPickBoatSpeed && (
            <div className="flex flex-1 gap-1.5">
              {boatSpeedPills.map((vPill) => (
                <button
                  key={vPill}
                  type="button"
                  onClick={() => {
                    sfx.pop(vPill >= boatSpeed);
                    onSelectSpeed(vPill);
                  }}
                  className={`min-h-[44px] flex-1 rounded-xl border-b-2 px-2 text-xs font-extrabold active:translate-y-0.5 active:border-b-0 transition touch-manipulation ${
                    boatSpeed === vPill
                      ? 'border-slate-950 bg-slate-900 text-teal-300'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  v = {vPill} m/s
                </button>
              ))}
            </div>
          )}

          {canDragHelm && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onStepHeading(-config.headingBounds.step)}
                className="min-h-[44px] min-w-[44px] rounded-xl border-b-2 border-slate-300 bg-white text-xs font-extrabold text-slate-800 active:translate-y-0.5 active:border-b-0 touch-manipulation"
              >
                −{config.headingBounds.step}°
              </button>
              <button
                type="button"
                onClick={() => onStepHeading(config.headingBounds.step)}
                className="min-h-[44px] min-w-[44px] rounded-xl border-b-2 border-slate-300 bg-white text-xs font-extrabold text-slate-800 active:translate-y-0.5 active:border-b-0 touch-manipulation"
              >
                +{config.headingBounds.step}°
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onLaunch}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 text-sm font-extrabold tracking-wide text-white active:translate-y-1 active:border-b-0 active:scale-[0.99] transition touch-manipulation select-none"
        >
          {config.mode === 'exam_trap' ? <Compass className="h-4 w-4" /> : <Navigation className="h-4 w-4" />}
          <span>
            {config.mode === 'exam_trap'
              ? lang === 'bn'
                ? 'দুই নৌকার তুলনা দেখো (১২০° বনাম ৩০°)'
                : 'REPLAY DUAL BOATS (120° VS 30°)'
              : lang === 'bn'
              ? `নদী পার হও (v=${boatSpeed} m/s, α=${headingDeg}°)`
              : `CROSS RIVER (v=${boatSpeed} · α=${headingDeg}°)`}
          </span>
        </button>

        {hasGhosts && (
          <button
            type="button"
            aria-label="Clear wake trails"
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
  </>
);
