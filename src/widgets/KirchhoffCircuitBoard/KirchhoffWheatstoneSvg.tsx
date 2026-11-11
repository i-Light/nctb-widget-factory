'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { KirchhoffProps } from './KirchhoffCircuitBoard.schema';
export interface KirchhoffWheatstoneSvgProps {
  config: KirchhoffProps;
  lang: 'en' | 'bn';
  showNodes: boolean;
  dualReplayActive: boolean;
  needleDeg: number;
  trapNeedleDeg: number;
  driftPhase: number;
  onToggleNodes: () => void;
}
export const KirchhoffWheatstoneSvg: React.FC<KirchhoffWheatstoneSvgProps> = ({
  config,
  lang,
  showNodes,
  dualReplayActive,
  needleDeg,
  trapNeedleDeg,
  driftPhase,
  onToggleNodes
}) => {
  const W = 360;
  const H = 280;
  const arms = config.bridgeArms ?? {
    P: 4,
    Q: 8,
    R: 6,
    SInitial: 24
  };
  const sReq = Number((arms.Q / arms.P * arms.R).toFixed(1));
  const ax = 180;
  const ay = 36;
  const bx = 54;
  const by = 144;
  const cx = 180;
  const cy = 248;
  const dx = 306;
  const dy = 144;
  const radMain = (needleDeg - 90) * Math.PI / 180;
  const nx = 180 + 24 * Math.cos(radMain);
  const ny = 144 + 24 * Math.sin(radMain);
  const radTrap = (trapNeedleDeg - 90) * Math.PI / 180;
  const tx = 180 + 24 * Math.cos(radTrap);
  const ty = 144 + 24 * Math.sin(radTrap);
  const armPill = (mx: number, my: number, label: string, highlight = false) => <g transform={`translate(${mx}, ${my})`}>
      <rect x={-36} y={-13} width={72} height={26} rx={8} fill={highlight ? '#064E3B' : '#1E293B'} stroke={highlight ? '#10B981' : '#F59E0B'} strokeWidth={2} />
      <text x={0} y={4} textAnchor="middle" fill="#F8FAFC" fontSize={12} fontWeight={800}>
        {label}
      </text>
    </g>;
  return <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-[#0B1220] shadow-sm">
      <div className="pointer-events-none absolute top-2 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5">
        <div className="rounded-xl border border-slate-700 bg-slate-900/92 px-2.5 py-1 text-[11px] font-extrabold text-slate-100">
          <span className="text-amber-300">P/Q = {arms.P}/{arms.Q}</span>
          <span className="mx-1.5 text-slate-600">|</span>
          <span className={dualReplayActive ? 'text-emerald-400' : 'text-sky-300'}>
            {dualReplayActive ? `I_g = 0.00 A (S=${sReq}\u03a9)` : `Need S = ${sReq}\u03a9`}
          </span>
        </div>

        <button type="button" onClick={() => {
        sfx.pop(!showNodes);
        onToggleNodes();
      }} className={`pointer-events-auto flex min-h-[38px] min-w-[46px] items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold active:scale-95 transition touch-manipulation ${showNodes ? 'border-teal-400 bg-teal-600 text-white' : 'border-slate-600 bg-slate-800 text-slate-200'}`}>
          <Eye className="h-3.5 w-3.5" />
          <span>Node V</span>
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-none select-none">
        <rect x={0} y={0} width={W} height={H} fill="#0B1220" />
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#38BDF8" strokeWidth={3} />
        <line x1={bx} y1={by} x2={cx} y2={cy} stroke="#38BDF8" strokeWidth={3} />
        <line x1={ax} y1={ay} x2={dx} y2={dy} stroke="#2DD4BF" strokeWidth={3} />
        <line x1={dx} y1={dy} x2={cx} y2={cy} stroke={dualReplayActive ? '#10B981' : '#F59E0B'} strokeWidth={3.2} />
        {dualReplayActive && <path d={`M ${dx} ${dy} Q 342 222 ${cx} ${cy}`} fill="none" stroke="#10B981" strokeWidth={2.6} strokeDasharray="5 3" />}
        <line x1={bx} y1={by} x2={dx} y2={dy} stroke={dualReplayActive ? '#10B981' : '#FB7185'} strokeWidth={2.4} strokeDasharray={dualReplayActive ? '4 4' : undefined} />
        {[0, 1, 2].map(idx => {
        const f = (idx / 3 + driftPhase * 0.8) % 1;
        return <g key={idx}>
              <circle cx={ax + (bx - ax) * f} cy={ay + (by - ay) * f} r={3.2} fill="#FDE047" />
              <circle cx={bx + (cx - bx) * f} cy={by + (cy - by) * f} r={3.2} fill="#FDE047" />
              <circle cx={ax + (dx - ax) * f} cy={ay + (dy - ay) * f} r={3.2} fill="#5EEAD4" />
              <circle cx={dx + (cx - dx) * f} cy={dy + (cy - dy) * f} r={3.2} fill="#5EEAD4" />
            </g>;
      })}
        {armPill(108, 84, `P = ${arms.P}\u03a9`)}
        {armPill(108, 204, `Q = ${arms.Q}\u03a9`)}
        {armPill(252, 84, `R = ${arms.R}\u03a9`)}
        {armPill(254, 204, dualReplayActive ? `24\u222524=${sReq}\u03a9` : `S\u2081 = ${arms.SInitial}\u03a9`, dualReplayActive)}
        <circle cx={180} cy={144} r={35} fill="#0F172A" stroke={dualReplayActive ? '#10B981' : '#94A3B8'} strokeWidth={3} />
        <line x1={180} y1={113} x2={180} y2={120} stroke="#10B981" strokeWidth={2.5} />
        <line x1={160} y1={119} x2={164} y2={125} stroke="#EF4444" strokeWidth={2} />
        <line x1={200} y1={119} x2={196} y2={125} stroke="#EF4444" strokeWidth={2} />
        {dualReplayActive && <g>
            <line x1={180} y1={144} x2={tx} y2={ty} stroke="#EF4444" strokeWidth={3} strokeDasharray="3 2" />
            <g transform="translate(180, 95)">
              <rect x={-72} y={-11} width={144} height={20} rx={8} fill="#7F1D1D" />
              <text x={0} y={3} textAnchor="middle" fill="#FEE2E2" fontSize={12} fontWeight={800}>
                Series +12\u03a9 \u2192 36\u03a9 (Trap!)
              </text>
            </g>
          </g>}
        <line x1={180} y1={144} x2={nx} y2={ny} stroke={dualReplayActive ? '#34D399' : '#FBBF24'} strokeWidth={3.2} strokeLinecap="round" />
        <circle cx={180} cy={144} r={4.5} fill="#F8FAFC" />
        <text x={180} y={166} textAnchor="middle" fill="#E2E8F0" fontSize={12.5} fontWeight={800}>
          {dualReplayActive ? 'G: 0.00A' : 'G \u2260 0'}
        </text>
        {showNodes && <g>
            <g transform={`translate(${bx}, ${by - 24})`}>
              <rect x={-30} y={-10} width={60} height={20} rx={7} fill="#0F766E" />
              <text x={0} y={4} textAnchor="middle" fill="#CCFBF1" fontSize={12} fontWeight={800}>
                V_B=8V
              </text>
            </g>
            <g transform={`translate(${dx}, ${dy - 24})`}>
              <rect x={-32} y={-10} width={64} height={20} rx={7} fill={dualReplayActive ? '#0F766E' : '#991B1B'} />
              <text x={0} y={4} textAnchor="middle" fill="#F8FAFC" fontSize={12} fontWeight={800}>
                {dualReplayActive ? 'V_D=8V' : 'V_D=9.6V'}
              </text>
            </g>
          </g>}
        <text x={W / 2} y={H - 8} textAnchor="middle" fill="#94A3B8" fontSize={12} fontWeight={700}>
          {dualReplayActive ? lang === 'bn' ? '24\u03a9 \u2225 24\u03a9 = 12\u03a9 \u09b6\u09be\u09a8\u09cd\u099f\u09c7 I_g = 0 (\u09b6\u09cd\u09b0\u09c7\u09a3\u09bf\u09a4\u09c7 36\u03a9 \u09ab\u09be\u0981\u09a6!)' : '24\u03a9 \u2225 24\u03a9 = 12\u03a9 balances G=0 (Series 36\u03a9 slams red!)' : `${config.supplyVoltage}V Bridge \u00b7 A(12V) \u2192 C(0V)`}
        </text>
      </svg>
    </div>;
};
