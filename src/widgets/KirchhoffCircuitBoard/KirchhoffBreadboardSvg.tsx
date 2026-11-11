'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { KirchhoffProps } from './KirchhoffCircuitBoard.schema';
import type { CircuitMetrics } from './KirchhoffCircuitBoard.eval';
export interface KirchhoffBreadboardSvgProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  config: KirchhoffProps;
  lang: 'en' | 'bn';
  topology: 'series' | 'parallel';
  r1: number;
  r2: number;
  metrics: CircuitMetrics;
  fuseLatchedBlown: boolean;
  activeSocket: 'R1' | 'R2';
  draggingSocket: 'R1' | 'R2' | null;
  hasInteracted: boolean;
  showNodes: boolean;
  driftPhase: number;
  ghostRuns: Array<{ id: number; label: string }>;
  onToggleNodes: () => void;
  onToggleTopology: () => void;
  onSocketPointerDown: (socket: 'R1' | 'R2', pointerId: number, clientX: number, el: SVGRectElement) => void;
  onSocketPointerMove: (clientX: number) => void;
  onSocketPointerUp: (clientX: number) => void;
}
export const KirchhoffBreadboardSvg: React.FC<KirchhoffBreadboardSvgProps> = ({
  svgRef, config, lang, topology, r1, r2, metrics, fuseLatchedBlown, activeSocket, draggingSocket,
  hasInteracted, showNodes, driftPhase, ghostRuns, onToggleNodes, onToggleTopology,
  onSocketPointerDown, onSocketPointerMove, onSocketPointerUp
}) => {
  const W = 360, H = 280, sockX = 186;
  const canToggleTopo = !config.lockedControls.includes('topology');
  const canEditR1 = !config.lockedControls.includes('R1');
  const canEditR2 = !config.lockedControls.includes('R2');
  const isBlown = fuseLatchedBlown || metrics.fuseBlown;
  const effI = isBlown ? 0 : metrics.activeCurrent;
  const effI1 = isBlown ? 0 : metrics.i1;
  const effI2 = isBlown ? 0 : metrics.i2;
  const isTargetHit = !isBlown && config.targetMetric === 'totalCurrent' && config.targetValue !== undefined && Math.abs(metrics.totalCurrent - config.targetValue) <= config.tolerance;
  const glow1 = Math.min(8, 2 + (isBlown ? 0 : metrics.p1) * 0.12);
  const glow2 = Math.min(8, 2 + (isBlown ? 0 : metrics.p2) * 0.12);
  const r1Y = topology === 'parallel' ? 108 : 102;
  const r2Y = 188;
  const renderSocket = (which: 'R1' | 'R2', cx: number, cy: number, ohms: number, branchI: number, editable: boolean) => {
    const isSel = activeSocket === which && editable;
    const showPulse = which === 'R2' && !hasInteracted && config.mode === 'explore' && editable;
    return <g key={which}>
      {showPulse && <rect x={cx - 34} y={cy - 27} width={68} height={54} rx={14} fill="none" stroke="#2DD4BF" strokeWidth={2.8} className="animate-pulse-halo" />}
      <rect x={cx - 28} y={cy - 22} width={56} height={44} rx={10} fill={isSel ? '#134E4A' : '#1E293B'} stroke={editable ? isSel ? '#2DD4BF' : '#F59E0B' : '#64748B'} strokeWidth={isSel ? 2.8 : 2.2} />
      <circle cx={cx - 24} cy={cy} r={4.5} fill="#FBBF24" />
      <circle cx={cx + 24} cy={cy} r={4.5} fill="#FBBF24" />
      <text x={cx} y={cy - 3} textAnchor="middle" fill="#F8FAFC" fontSize={13} fontWeight={800}>{which === 'R1' ? 'R\u2081' : 'R\u2082'} = {ohms}\u03a9</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill="#5EEAD4" fontSize={12} fontWeight={700}>{branchI.toFixed(1)} A</text>
      {editable && <rect x={cx - 34} y={cy - 26} width={68} height={52} rx={12} fill="transparent" onPointerDown={e => { e.stopPropagation(); onSocketPointerDown(which, e.pointerId, e.clientX, e.currentTarget); }} />}
    </g>;
  };
  const dragY = draggingSocket === 'R1' ? r1Y : r2Y;
  const dragVal = draggingSocket === 'R1' ? r1 : r2;
  const dragCur = draggingSocket === 'R1' ? effI1 : effI2;
  return <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-[#0B1220] shadow-sm">
    <div className="pointer-events-none absolute top-2 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5">
      <div className="rounded-xl border border-slate-700 bg-slate-900/92 px-2.5 py-1 text-[11px] font-extrabold text-slate-100">
        <span className="text-amber-300">{config.supplyVoltage}V</span>
        <span className="mx-1.5 text-slate-600">|</span>
        <span className="text-teal-300">R={metrics.req.toFixed(1)}\u03a9</span>
        <span className="mx-1.5 text-slate-600">|</span>
        <span className={isBlown ? 'text-rose-400' : isTargetHit ? 'text-emerald-400' : 'text-sky-300'}>I={isBlown ? '0.0A (BLOWN)' : `${effI.toFixed(1)}A`}</span>
      </div>
      <button type="button" onClick={() => { sfx.pop(!showNodes); onToggleNodes(); }} className={`pointer-events-auto flex min-h-[38px] min-w-[46px] items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold active:scale-95 transition touch-manipulation ${showNodes ? 'border-teal-400 bg-teal-600 text-white' : 'border-slate-600 bg-slate-800 text-slate-200'}`}>
        <Eye className="h-3.5 w-3.5" /><span>Node V</span>
      </button>
    </div>
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} onPointerMove={e => draggingSocket && onSocketPointerMove(e.clientX)} onPointerUp={e => draggingSocket && onSocketPointerUp(e.clientX)} onPointerCancel={e => draggingSocket && onSocketPointerUp(e.clientX)} className="block h-auto w-full touch-none select-none">
      <rect x={0} y={0} width={W} height={H} fill="#0B1220" />
      <line x1={42} y1={58} x2={322} y2={58} stroke={isBlown ? '#475569' : '#38BDF8'} strokeWidth={3} />
      <line x1={42} y1={232} x2={322} y2={232} stroke="#475569" strokeWidth={3} />
      <line x1={42} y1={58} x2={42} y2={128} stroke="#38BDF8" strokeWidth={3} />
      <line x1={42} y1={162} x2={42} y2={232} stroke="#475569" strokeWidth={3} />
      <line x1={26} y1={134} x2={58} y2={134} stroke="#FBBF24" strokeWidth={3.5} />
      <line x1={33} y1={146} x2={51} y2={146} stroke="#94A3B8" strokeWidth={3.5} />
      <line x1={26} y1={156} x2={58} y2={156} stroke="#FBBF24" strokeWidth={3.5} />
      <text x={14} y={124} fill="#FDE68A" fontSize={12} fontWeight={800}>+{config.supplyVoltage}V</text>
      {config.maxFuseCurrent !== undefined && <g transform="translate(114, 58)">
        <rect x={-32} y={-12} width={64} height={24} rx={8} fill={isBlown ? '#450A0A' : '#0F172A'} stroke={isBlown ? '#F87171' : '#38BDF8'} strokeWidth={2} />
        {!isBlown ? <line x1={-24} y1={0} x2={24} y2={0} stroke="#FDE047" strokeWidth={2.4} /> : <g><line x1={-24} y1={0} x2={-7} y2={-4} stroke="#F87171" strokeWidth={2.2} /><line x1={7} y1={4} x2={24} y2={0} stroke="#F87171" strokeWidth={2.2} /><circle cx={0} cy={0} r={5} fill="#FB923C" /></g>}
        <text x={0} y={24} textAnchor="middle" fill={isBlown ? '#FCA5A5' : '#93C5FD'} fontSize={12} fontWeight={800}>{isBlown ? `BLOWN (${metrics.totalCurrent.toFixed(1)}A > ${config.maxFuseCurrent}A)` : `${config.maxFuseCurrent.toFixed(1)}A Fuse`}</text>
      </g>}
      {canToggleTopo && <g transform="translate(262, 58)" onClick={() => { sfx.pop(topology === 'series'); onToggleTopology(); }}>
        <rect x={-42} y={-16} width={84} height={32} rx={9} fill="#1E293B" stroke="#F59E0B" strokeWidth={2} />
        <text x={0} y={4} textAnchor="middle" fill="#FDE68A" fontSize={12} fontWeight={800}>{topology === 'parallel' ? 'PAR \u2225' : 'SER \u22ef'}</text>
        <rect x={-46} y={-24} width={92} height={48} fill="transparent" />
      </g>}
      {topology === 'parallel' ? <g>
        <line x1={88} y1={58} x2={88} y2={188} stroke="#38BDF8" strokeWidth={2.8} />
        <line x1={284} y1={58} x2={284} y2={232} stroke="#64748B" strokeWidth={2.8} />
        <line x1={322} y1={58} x2={322} y2={232} stroke="#475569" strokeWidth={2.5} strokeDasharray="4 4" opacity={0.35} />
        <line x1={88} y1={r1Y} x2={284} y2={r1Y} stroke="#14B8A6" strokeWidth={glow1 + 3} opacity={0.22} />
        <line x1={88} y1={r1Y} x2={284} y2={r1Y} stroke="#2DD4BF" strokeWidth={2.8} />
        <line x1={88} y1={r2Y} x2={284} y2={r2Y} stroke="#14B8A6" strokeWidth={glow2 + 3} opacity={0.22} />
        <line x1={88} y1={r2Y} x2={284} y2={r2Y} stroke="#2DD4BF" strokeWidth={2.8} />
        {!isBlown && [0, 1, 2, 3, 4].map(idx => {
          const f1 = (idx / 5 + driftPhase * effI1 * 0.45) % 1;
          const f2 = (idx / 5 + driftPhase * effI2 * 0.45) % 1;
          return <g key={idx}><circle cx={88 + f1 * 196} cy={r1Y} r={3.4} fill="#FDE047" /><circle cx={88 + f2 * 196} cy={r2Y} r={3.4} fill="#38BDF8" /></g>;
        })}
      </g> : <g>
        <line x1={186} y1={58} x2={186} y2={232} stroke="#F59E0B" strokeWidth={glow1 + 3} opacity={0.2} />
        <line x1={186} y1={58} x2={186} y2={232} stroke="#FBBF24" strokeWidth={3} />
        <line x1={322} y1={58} x2={322} y2={232} stroke="#334155" strokeWidth={2} strokeDasharray="4 4" opacity={0.35} />
        {!isBlown && [0, 1, 2, 3, 4].map(idx => <circle key={idx} cx={186} cy={62 + ((idx / 5 + driftPhase * effI * 0.55) % 1) * 166} r={3.5} fill="#FDE047" />)}
      </g>}
      {renderSocket('R1', sockX, r1Y, r1, effI1, canEditR1)}
      {renderSocket('R2', sockX, r2Y, r2, effI2, canEditR2)}
      {showNodes && <g>
        <g transform="translate(88, 56)"><rect x={-22} y={-11} width={44} height={20} rx={7} fill="#0F766E" /><text x={0} y={3} textAnchor="middle" fill="#CCFBF1" fontSize={12} fontWeight={800}>{isBlown ? '0V' : `${config.supplyVoltage}V`}</text></g>
        {topology === 'series' && !isBlown && <g transform="translate(248, 145)"><rect x={-28} y={-11} width={56} height={20} rx={7} fill="#4338CA" /><text x={0} y={3} textAnchor="middle" fill="#E0E7FF" fontSize={12} fontWeight={800}>{metrics.midNodeVoltage.toFixed(1)}V</text></g>}
        <g transform="translate(284, 232)"><rect x={-20} y={-11} width={40} height={20} rx={7} fill="#334155" /><text x={0} y={3} textAnchor="middle" fill="#E2E8F0" fontSize={12} fontWeight={800}>0V</text></g>
      </g>}
      {draggingSocket && <g transform={`translate(${sockX}, ${Math.max(46, dragY - 42)})`}>
        <rect x={-64} y={-14} width={128} height={26} rx={10} fill="#0F172A" stroke="#2DD4BF" strokeWidth={2} />
        <text x={0} y={3} textAnchor="middle" fill="#5EEAD4" fontSize={12.5} fontWeight={800}>{draggingSocket === 'R1' ? 'R\u2081' : 'R\u2082'} = {dragVal}\u03a9 \u00b7 {dragCur.toFixed(1)}A</text>
      </g>}
      <text x={W / 2} y={H - 12} textAnchor="middle" fill="#94A3B8" fontSize={12} fontWeight={700}>
        {ghostRuns.length > 0 ? `${lang === 'bn' ? '\u0986\u0997\u09c7\u09b0 \u09a4\u09c1\u09b2\u09a8\u09be:' : 'Ghost:'} ${ghostRuns[ghostRuns.length - 1].label}` : config.targetMetric === 'totalCurrent' && config.targetValue !== undefined ? `${lang === 'bn' ? '\u09b2\u0995\u09cd\u09b7\u09cd\u09af:' : 'Target:'} I = ${config.targetValue.toFixed(1)} A` : lang === 'bn' ? '\u09b8\u0995\u09c7\u099f\u09c7 \u099f\u09cd\u09af\u09be\u09aa \u09ac\u09be \u09a1\u09cd\u09b0\u09cd\u09af\u09be\u0997 \u0995\u09b0\u09c7 \u09b0\u09cb\u09a7 \u09ac\u09a6\u09b2\u09be\u0993' : 'Tap or scrub gold sockets to swap \u03a9'}
      </text>
    </svg>
  </div>;
};
