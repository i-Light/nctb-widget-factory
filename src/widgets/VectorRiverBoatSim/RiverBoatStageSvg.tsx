'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { VectorRiverBoatProps } from './VectorRiverBoatSim.schema';
import type { RiverBoatMetrics } from './VectorRiverBoatSim.eval';
import { RiverBoatChannelBackdrop } from './RiverBoatChannelBackdrop';
import { RiverBoatVectorsHull } from './RiverBoatVectorsHull';

export interface RiverBoatStageSvgProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  config: VectorRiverBoatProps;
  lang: 'en' | 'bn';
  boatSpeed: number;
  headingDeg: number;
  metrics: RiverBoatMetrics;
  showVectors: boolean;
  canDragHelm: boolean;
  isDraggingHelm: boolean;
  hasDraggedOnce: boolean;
  streamOffset: number;
  crossingProgress: number | null;
  dualTrapMode: boolean;
  rockSplash: boolean;
  clampedLandX: number;
  helmArcPath: string;
  ghostWakes: Array<{ id: number; endX: number; endY: number; label: string }>;
  wakeDots: Array<{ x: number; y: number; r: number }>;
  misconceptionBoat: { x: number; y: number; bowSvgDeg: number } | null;
  onToggleVectors: () => void;
  onStartDrag: (pointerId: number, el: SVGCircleElement) => void;
  onMoveDrag: (clientX: number, clientY: number) => void;
  onEndDrag: () => void;
}

export const RiverBoatStageSvg: React.FC<RiverBoatStageSvgProps> = ({
  svgRef,
  config,
  lang,
  boatSpeed,
  headingDeg,
  metrics,
  showVectors,
  canDragHelm,
  isDraggingHelm,
  hasDraggedOnce,
  streamOffset,
  crossingProgress,
  dualTrapMode,
  rockSplash,
  clampedLandX,
  helmArcPath,
  ghostWakes,
  wakeDots,
  misconceptionBoat,
  onToggleVectors,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
}) => {
  const W = 360;
  const H = 272;
  const startX = 156;
  const northBankY = 44;
  const southBankY = 224;
  const HELM_R = 64;

  const streamRad = (metrics.streamAngleDeg * Math.PI) / 180;
  const knobX = startX + HELM_R * Math.cos(streamRad);
  const knobY = southBankY - HELM_R * Math.sin(streamRad);

  const activeFrac = crossingProgress ?? 0;
  const boatX = dualTrapMode ? startX : startX + (clampedLandX - startX) * activeFrac;
  const boatY = southBankY - (southBankY - northBankY) * activeFrac;
  const hullRotateSvgDeg = 90 - metrics.streamAngleDeg;
  const isZeroDriftAligned = Math.abs(metrics.vx) < 0.08 && metrics.reachesOppositeBank;

  const VEC_SCALE = 4.6;
  const uxPx = config.initialStreamSpeed * VEC_SCALE;
  const vxThrustPx = boatSpeed * Math.cos(streamRad) * VEC_SCALE;
  const vyThrustPx = -boatSpeed * Math.sin(streamRad) * VEC_SCALE;
  const rxPx = uxPx + vxThrustPx;
  const ryPx = vyThrustPx;

  const badgeX = Math.max(52, Math.min(W - 52, knobX));
  const badgeY = Math.max(54, knobY - 42);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
      <div className="pointer-events-none absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5">
        <div className="rounded-xl border border-slate-200 bg-white/92 px-2.5 py-1 text-[11px] font-bold text-slate-800 backdrop-blur">
          <span className="text-sky-700">
            t={Number.isFinite(metrics.crossingTimeSec) ? `${metrics.crossingTimeSec.toFixed(2)}s` : '\u221e'}
          </span>
          <span className="mx-1.5 text-slate-300">|</span>
          <span className={Math.abs(metrics.lateralDriftMeters) <= config.tolerance ? 'text-emerald-700 font-extrabold' : 'text-amber-700'}>
            x={Number.isFinite(metrics.lateralDriftMeters) ? `${metrics.lateralDriftMeters >= 0 ? '+' : ''}${metrics.lateralDriftMeters.toFixed(1)}m` : '\u221e'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            sfx.pop(!showVectors);
            onToggleVectors();
          }}
          className={`pointer-events-auto flex min-h-[38px] min-w-[42px] items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold active:scale-95 transition touch-manipulation ${
            showVectors ? 'border-teal-700 bg-teal-600 text-white' : 'border-slate-300 bg-white/95 text-slate-700'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{lang === 'bn' ? '\u09ad\u09c7\u0995\u09cd\u099f\u09b0' : 'Vec'}</span>
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={(e) => isDraggingHelm && onMoveDrag(e.clientX, e.clientY)}
        onPointerUp={onEndDrag}
        onPointerCancel={onEndDrag}
        className="block h-auto w-full touch-none select-none"
      >
        <RiverBoatChannelBackdrop config={config} lang={lang} streamOffset={streamOffset} rockSplash={rockSplash} />

        {ghostWakes.map((gw) => (
          <g key={gw.id} opacity={0.55}>
            <line x1={startX} y1={southBankY} x2={gw.endX} y2={gw.endY} stroke="#475569" strokeWidth={2.2} strokeDasharray="5 4" />
            <circle cx={gw.endX} cy={gw.endY} r={4} fill="#475569" />
            <text x={Math.max(38, Math.min(W - 38, gw.endX))} y={Math.max(58, gw.endY + 15)} textAnchor="middle" fill="#334155" fontSize={12} fontWeight={700}>
              {gw.label}
            </text>
          </g>
        ))}

        {metrics.reachesOppositeBank && !dualTrapMode && (
          <line x1={startX} y1={southBankY} x2={clampedLandX} y2={northBankY} stroke={isZeroDriftAligned ? '#059669' : '#0D9488'} strokeWidth={2.5} strokeDasharray={crossingProgress !== null ? undefined : '6 4'} opacity={0.8} />
        )}

        {wakeDots.map((wd, idx) => (
          <circle key={idx} cx={wd.x} cy={wd.y} r={wd.r} fill="#FFFFFF" opacity={0.78} />
        ))}

        {canDragHelm && (
          <g>
            <path d={helmArcPath} fill="none" stroke="#2DD4BF" strokeWidth={4} strokeLinecap="round" opacity={0.75} />
            <line x1={startX} y1={southBankY} x2={knobX} y2={knobY} stroke="#7C3AED" strokeWidth={2.5} strokeDasharray="3 3" />
          </g>
        )}

        {misconceptionBoat && (
          <g>
            <line x1={startX} y1={southBankY} x2={misconceptionBoat.x} y2={misconceptionBoat.y} stroke="#EF4444" strokeWidth={2.5} strokeDasharray="4 4" />
            <g transform={`translate(${misconceptionBoat.x}, ${misconceptionBoat.y}) rotate(${misconceptionBoat.bowSvgDeg})`}>
              <polygon points="0,-13 8,9 0,6 -8,9" fill="#FEE2E2" stroke="#EF4444" strokeWidth={2} />
            </g>
            <g transform={`translate(${Math.max(74, misconceptionBoat.x)}, ${misconceptionBoat.y - 22})`}>
              <rect x={-68} y={-12} width={136} height={20} rx={8} fill="#991B1B" />
              <text x={0} y={2} textAnchor="middle" fill="#FEE2E2" fontSize={12} fontWeight={800}>
                120\u00b0 from width (Trap!)
              </text>
            </g>
          </g>
        )}

        <RiverBoatVectorsHull
          boatX={boatX}
          boatY={boatY}
          showVectors={showVectors}
          uxPx={uxPx}
          vxThrustPx={vxThrustPx}
          vyThrustPx={vyThrustPx}
          rxPx={rxPx}
          ryPx={ryPx}
          isZeroDriftAligned={isZeroDriftAligned}
          dualTrapMode={dualTrapMode}
          hullRotateSvgDeg={hullRotateSvgDeg}
        />

        <rect x={startX - 14} y={southBankY} width={28} height={12} rx={3} fill="#F59E0B" />

        {canDragHelm && (
          <g>
            {!hasDraggedOnce && config.mode === 'explore' && (
              <g>
                <circle cx={knobX} cy={knobY} r={22} fill="none" stroke="#2DD4BF" strokeWidth={3} className="animate-pulse-halo" />
                <g transform={`translate(${Math.min(W - 56, knobX + 42)}, ${Math.max(60, knobY - 12)})`}>
                  <rect x={-36} y={-12} width={72} height={22} rx={9} fill="#0F172A" />
                  <text x={0} y={3} textAnchor="middle" fill="#5EEAD4" fontSize={12} fontWeight={800}>
                    {lang === 'bn' ? '\u03b1 \u0998\u09c1\u09b0\u09be\u0993 \u21ba' : 'Drag \u03b1 \u21ba'}
                  </text>
                </g>
              </g>
            )}
            <circle cx={knobX} cy={knobY} r={14} fill="#0D9488" stroke="#FFFFFF" strokeWidth={3} />
            <circle
              cx={knobX}
              cy={knobY}
              r={28}
              fill="transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onStartDrag(e.pointerId, e.currentTarget);
              }}
            />
          </g>
        )}

        {isDraggingHelm && (
          <g transform={`translate(${badgeX}, ${badgeY})`}>
            <rect x={-44} y={-14} width={88} height={24} rx={10} fill="#0F172A" />
            <text x={0} y={2} textAnchor="middle" fill="#5EEAD4" fontSize={12.5} fontWeight={800}>
              {config.angleReference === 'perpendicular' ? `\u03b8\u22a5 = ${headingDeg}\u00b0` : `\u03b1 = ${headingDeg}\u00b0`}
            </text>
          </g>
        )}

        <text x={startX} y={H - 10} textAnchor="middle" fill="#CCFBF1" fontSize={12.5} fontWeight={800}>
          {config.angleReference === 'perpendicular'
            ? `\u03b8_width = ${headingDeg}\u00b0 (\u03b1 = ${metrics.streamAngleDeg}\u00b0)`
            : `\u03b1 = ${headingDeg}\u00b0 \u00b7 v = ${boatSpeed} m/s`}
        </text>
      </svg>
    </div>
  );
};engine/audio';
import type { VectorRiverBoatProps } from './VectorRiverBoatSim.schema';
import type { RiverBoatMetrics } from './VectorRiverBoatSim.eval';
import { RiverBoatChannelBackdrop } from './RiverBoatChannelBackdrop';
import { RiverBoatVectorsHull } from './RiverBoatVectorsHull';

export interface RiverBoatStageSvgProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  config: VectorRiverBoatProps;
  lang: 'en' | 'bn';
  boatSpeed: number;
  headingDeg: number;
  metrics: RiverBoatMetrics;
  showVectors: boolean;
  canDragHelm: boolean;
  isDraggingHelm: boolean;
  hasDraggedOnce: boolean;
  streamOffset: number;
  crossingProgress: number | null;
  dualTrapMode: boolean;
  rockSplash: boolean;
  clampedLandX: number;
  helmArcPath: string;
  ghostWakes: Array<{ id: number; endX: number; endY: number; label: string }>;
  wakeDots: Array<{ x: number; y: number; r: number }>;
  misconceptionBoat: { x: number; y: number; bowSvgDeg: number } | null;
  onToggleVectors: () => void;
  onStartDrag: (pointerId: number, el: SVGCircleElement) => void;
  onMoveDrag: (clientX: number, clientY: number) => void;
  onEndDrag: () => void;
}

export const RiverBoatStageSvg: React.FC<RiverBoatStageSvgProps> = ({
  svgRef,
  config,
  lang,
  boatSpeed,
  headingDeg,
  metrics,
  showVectors,
  canDragHelm,
  isDraggingHelm,
  hasDraggedOnce,
  streamOffset,
  crossingProgress,
  dualTrapMode,
  rockSplash,
  clampedLandX,
  helmArcPath,
  ghostWakes,
  wakeDots,
  misconceptionBoat,
  onToggleVectors,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
}) => {
  const W = 360;
  const H = 272;
  const startX = 156;
  const northBankY = 44;
  const southBankY = 224;
  const HELM_R = 64;

  const streamRad = (metrics.streamAngleDeg * Math.PI) / 180;
  const knobX = startX + HELM_R * Math.cos(streamRad);
  const knobY = southBankY - HELM_R * Math.sin(streamRad);

  const activeFrac = crossingProgress ?? 0;
  const boatX = dualTrapMode ? startX : startX + (clampedLandX - startX) * activeFrac;
  const boatY = southBankY - (southBankY - northBankY) * activeFrac;
  const hullRotateSvgDeg = 90 - metrics.streamAngleDeg;
  const isZeroDriftAligned = Math.abs(metrics.vx) < 0.08 && metrics.reachesOppositeBank;

  const VEC_SCALE = 4.6;
  const uxPx = config.initialStreamSpeed * VEC_SCALE;
  const vxThrustPx = boatSpeed * Math.cos(streamRad) * VEC_SCALE;
  const vyThrustPx = -boatSpeed * Math.sin(streamRad) * VEC_SCALE;
  const rxPx = uxPx + vxThrustPx;
  const ryPx = vyThrustPx;

  const badgeX = Math.max(52, Math.min(W - 52, knobX));
  const badgeY = Math.max(54, knobY - 42);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
      <div className="pointer-events-none absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5">
        <div className="rounded-xl border border-slate-200 bg-white/92 px-2.5 py-1 text-[11px] font-bold text-slate-800 backdrop-blur">
          <span className="text-sky-700">
            t={Number.isFinite(metrics.crossingTimeSec) ? `${metrics.crossingTimeSec.toFixed(2)}s` : '∞'}
          </span>
          <span className="mx-1.5 text-slate-300">|</span>
          <span className={Math.abs(metrics.lateralDriftMeters) <= config.tolerance ? 'text-emerald-700 font-extrabold' : 'text-amber-700'}>
            x={Number.isFinite(metrics.lateralDriftMeters) ? `${metrics.lateralDriftMeters >= 0 ? '+' : ''}${metrics.lateralDriftMeters.toFixed(1)}m` : '∞'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            sfx.pop(!showVectors);
            onToggleVectors();
          }}
          className={`pointer-events-auto flex min-h-[38px] min-w-[42px] items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold active:scale-95 transition touch-manipulation ${
            showVectors ? 'border-teal-700 bg-teal-600 text-white' : 'border-slate-300 bg-white/95 text-slate-700'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{lang === 'bn' ? 'ভেক্টর' : 'Vec'}</span>
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={(e) => isDraggingHelm && onMoveDrag(e.clientX, e.clientY)}
        onPointerUp={onEndDrag}
        onPointerCancel={onEndDrag}
        className="block h-auto w-full touch-none select-none"
      >
        <RiverBoatChannelBackdrop config={config} lang={lang} streamOffset={streamOffset} rockSplash={rockSplash} />

        {ghostWakes.map((gw) => (
          <g key={gw.id} opacity={0.55}>
            <line x1={startX} y1={southBankY} x2={gw.endX} y2={gw.endY} stroke="#475569" strokeWidth={2.2} strokeDasharray="5 4" />
            <circle cx={gw.endX} cy={gw.endY} r={4} fill="#475569" />
            <text x={Math.max(38, Math.min(W - 38, gw.endX))} y={Math.max(58, gw.endY + 15)} textAnchor="middle" fill="#334155" fontSize={12} fontWeight={700}>
              {gw.label}
            </text>
          </g>
        ))}

        {metrics.reachesOppositeBank && !dualTrapMode && (
          <line x1={startX} y1={southBankY} x2={clampedLandX} y2={northBankY} stroke={isZeroDriftAligned ? '#059669' : '#0D9488'} strokeWidth={2.5} strokeDasharray={crossingProgress !== null ? undefined : '6 4'} opacity={0.8} />
        )}

        {wakeDots.map((wd, idx) => (
          <circle key={idx} cx={wd.x} cy={wd.y} r={wd.r} fill="#FFFFFF" opacity={0.78} />
        ))}

        {canDragHelm && (
          <g>
            <path d={helmArcPath} fill="none" stroke="#2DD4BF" strokeWidth={4} strokeLinecap="round" opacity={0.75} />
            <line x1={startX} y1={southBankY} x2={knobX} y2={knobY} stroke="#7C3AED" strokeWidth={2.5} strokeDasharray="3 3" />
          </g>
        )}

        {misconceptionBoat && (
          <g>
            <line x1={startX} y1={southBankY} x2={misconceptionBoat.x} y2={misconceptionBoat.y} stroke="#EF4444" strokeWidth={2.5} strokeDasharray="4 4" />
            <g transform={`translate(${misconceptionBoat.x}, ${misconceptionBoat.y}) rotate(${misconceptionBoat.bowSvgDeg})`}>
              <polygon points="0,-13 8,9 0,6 -8,9" fill="#FEE2E2" stroke="#EF4444" strokeWidth={2} />
            </g>
            <g transform={`translate(${Math.max(74, misconceptionBoat.x)}, ${misconceptionBoat.y - 22})`}>
              <rect x={-68} y={-12} width={136} height={20} rx={8} fill="#991B1B" />
              <text x={0} y={2} textAnchor="middle" fill="#FEE2E2" fontSize={12} fontWeight={800}>
                120° from width (Trap!)
              </text>
            </g>
          </g>
        )}

        <RiverBoatVectorsHull
          boatX={boatX}
          boatY={boatY}
          showVectors={showVectors}
          uxPx={uxPx}
          vxThrustPx={vxThrustPx}
          vyThrustPx={vyThrustPx}
          rxPx={rxPx}
          ryPx={ryPx}
          isZeroDriftAligned={isZeroDriftAligned}
          dualTrapMode={dualTrapMode}
          hullRotateSvgDeg={hullRotateSvgDeg}
        />

        <rect x={startX - 14} y={southBankY} width={28} height={12} rx={3} fill="#F59E0B" />

        {canDragHelm && (
          <g>
            {!hasDraggedOnce && config.mode === 'explore' && (
              <g>
                <circle cx={knobX} cy={knobY} r={22} fill="none" stroke="#2DD4BF" strokeWidth={3} className="animate-pulse-halo" />
                <g transform={`translate(${Math.min(W - 56, knobX + 42)}, ${Math.max(60, knobY - 12)})`}>
                  <rect x={-36} y={-12} width={72} height={22} rx={9} fill="#0F172A" />
                  <text x={0} y={3} textAnchor="middle" fill="#5EEAD4" fontSize={12} fontWeight={800}>
                    {lang === 'bn' ? 'α ঘুরাও ↺' : 'Drag α ↺'}
                  </text>
                </g>
              </g>
            )}
            <circle cx={knobX} cy={knobY} r={14} fill="#0D9488" stroke="#FFFFFF" strokeWidth={3} />
            <circle
              cx={knobX}
              cy={knobY}
              r={28}
              fill="transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onStartDrag(e.pointerId, e.currentTarget);
              }}
            />
          </g>
        )}

        {isDraggingHelm && (
          <g transform={`translate(${badgeX}, ${badgeY})`}>
            <rect x={-44} y={-14} width={88} height={24} rx={10} fill="#0F172A" />
            <text x={0} y={2} textAnchor="middle" fill="#5EEAD4" fontSize={12.5} fontWeight={800}>
              {config.angleReference === 'perpendicular' ? `θ⊥ = ${headingDeg}°` : `α = ${headingDeg}°`}
            </text>
          </g>
        )}

        <text x={startX} y={H - 10} textAnchor="middle" fill="#CCFBF1" fontSize={12.5} fontWeight={800}>
          {config.angleReference === 'perpendicular'
            ? `θ_width = ${headingDeg}° (α = ${metrics.streamAngleDeg}°)`
            : `α = ${headingDeg}° · v = ${boatSpeed} m/s`}
        </text>
      </svg>
    </div>
  );
};
