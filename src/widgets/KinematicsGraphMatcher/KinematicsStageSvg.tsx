'use client';

import React from 'react';
import type { KinematicsGraphProps } from './KinematicsGraphMatcher.schema';
import { computePiecewiseKinematics, motionAt, velocityAt, type VNodes } from './KinematicsGraphMatcher.eval';

/** Portrait stack: EV highway (y 10–50) over the v-t chart (y 96–256). */
export const KSTAGE = { W: 360, H: 290, CX0: 40, CX1: 326, CY_TOP: 96, CY_BOT: 256 } as const;
const { W, H, CX0, CX1, CY_TOP, CY_BOT } = KSTAGE;
const NODE_KEYS = ['v0', 'v1', 'v2'] as const;
export type NodeKey = (typeof NODE_KEYS)[number];

const sgn = (x: number, digits = 0) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x).toFixed(digits)}`;

/** Signed-area runs of the v-t curve from 0 to tp, split at every zero crossing. */
export function areaRuns(n: VNodes, T: number, tp: number) {
  const cuts = new Set<number>([0, Math.min(tp, T), Math.min(tp, 2 * T), tp]);
  for (let k = 0; k < 2; k++) {
    const [a, b] = [n[k], n[k + 1]];
    if (a * b < 0) cuts.add(k * T + (Math.abs(a) / (Math.abs(a) + Math.abs(b))) * T);
  }
  const ts = [...cuts].filter((t) => t >= 0 && t <= tp + 1e-9).sort((x, y) => x - y);
  const runs: Array<{ pts: Array<[number, number]>; sign: number; area: number; t0: number; t1: number }> = [];
  for (let i = 0; i < ts.length - 1; i++) {
    const [ta, tb] = [ts[i], ts[i + 1]];
    if (tb - ta < 1e-9) continue;
    const sign = Math.sign(velocityAt(n, T, (ta + tb) / 2));
    if (sign === 0) continue;
    const last = runs[runs.length - 1];
    const seg: Array<[number, number]> = [[ta, velocityAt(n, T, ta)], [tb, velocityAt(n, T, tb)]];
    if (last && last.sign === sign && Math.abs(last.t1 - ta) < 1e-9) {
      last.pts.push(seg[1]);
      last.t1 = tb;
    } else runs.push({ pts: seg, sign, area: 0, t0: ta, t1: tb });
  }
  for (const r of runs) r.area = motionAt(n, T, r.t1).displacement - motionAt(n, T, r.t0).displacement;
  return runs;
}

const Car: React.FC<{ x: number; y: number; dir: number; tone: 'real' | 'ghost' | 'trap' }> = ({ x, y, dir, tone }) => {
  const body = tone === 'trap' ? '#F87171' : tone === 'ghost' ? 'none' : '#2DD4BF';
  const stroke = tone === 'trap' ? '#FCA5A5' : tone === 'ghost' ? '#64748B' : '#CCFBF1';
  return (
    <g transform={`translate(${x}, ${y}) scale(${dir < 0 ? -1 : 1}, 1)`} opacity={tone === 'ghost' ? 0.6 : 1}>
      <rect x={-14} y={-7} width={28} height={12} rx={5} fill={body} stroke={stroke} strokeWidth={1.5} strokeDasharray={tone === 'ghost' ? '3 2' : undefined} />
      <rect x={-2} y={-5} width={9} height={6} rx={2} fill={tone === 'ghost' ? 'none' : '#0F172A'} opacity={0.7} />
      <circle cx={-8} cy={6} r={3.5} fill="#0F172A" stroke={stroke} strokeWidth={1.2} />
      <circle cx={8} cy={6} r={3.5} fill="#0F172A" stroke={stroke} strokeWidth={1.2} />
    </g>
  );
};

export interface KinematicsStageSvgProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  config: KinematicsGraphProps;
  lang: 'en' | 'bn';
  nodes: VNodes;
  tp: number;
  driving: boolean;
  draggingNode: NodeKey | null;
  hasInteracted: boolean;
  revealed: boolean;
  xray: boolean;
  ghosts: Array<{ id: number; nodes: VNodes }>;
  status: { text: string; color: string } | null;
  onNodePointerDown: (node: NodeKey, e: React.PointerEvent<SVGCircleElement>) => void;
  onStagePointerMove: (clientY: number) => void;
  onStagePointerUp: () => void;
}

export const KinematicsStageSvg: React.FC<KinematicsStageSvgProps> = ({
  svgRef, config, lang, nodes, tp, driving, draggingNode, hasInteracted, revealed, xray, ghosts, status,
  onNodePointerDown, onStagePointerMove, onStagePointerUp,
}) => {
  const bn = lang === 'bn';
  const T = config.stageDurationSec;
  const { min: vMin, max: vMax, step } = config.velocityBounds;
  const { min: sMin, max: sMax } = config.trackMeters;
  const tx = (t: number) => CX0 + (t / (2 * T)) * (CX1 - CX0);
  const vy = (v: number) => CY_BOT - ((v - vMin) / (vMax - vMin)) * (CY_BOT - CY_TOP);
  const sx = (s: number) => 22 + ((Math.max(sMin, Math.min(sMax, s)) - sMin) / (sMax - sMin)) * 316;
  const zeroY = vy(Math.max(vMin, Math.min(vMax, 0)));
  const isTrap = config.mode === 'exam_trap';
  const hideAreas = config.mode === 'predict' && !revealed;
  const areaT = hideAreas ? 0 : driving || tp > 0 ? tp : 2 * T;
  const showAreaLabels = (xray || isTrap) && !driving && areaT > 0;
  const now = motionAt(nodes, T, tp);
  const full = computePiecewiseKinematics(nodes[0], nodes[1], nodes[2], T);
  const curve = (n: VNodes) => n.map((v, k) => `${tx(k * T)},${vy(v)}`).join(' ');

  const gridVs: number[] = [];
  const labelStep = (vMax - vMin) / step > 5 ? step * 2 : step;
  for (let v = vMin; v <= vMax + 1e-9; v += labelStep) gridVs.push(Number(v.toFixed(2)));

  const hud = driving
    ? `t ${tp.toFixed(1)} s · v ${sgn(now.velocity, 1)} m/s · s ${sgn(now.displacement)} m · d ${now.distance.toFixed(0)} m`
    : hideAreas
    ? `a₁ ${sgn(full.a1, 1)} · a₂ ${sgn(full.a2, 1)} m/s² · s = ? m`
    : `a₁ ${sgn(full.a1, 1)} · a₂ ${sgn(full.a2, 1)} m/s² · s ${sgn(full.netDisplacement)} m · d ${full.totalDistance.toFixed(0)} m`;

  const caption = (() => {
    if (status) return status.text;
    if (isTrap) return tp > 0 ? (bn ? `সবুজ সরণ s = ${sgn(now.displacement)} m · লাল ওডোমিটার d = ${now.distance.toFixed(0)} m` : `teal s = ${sgn(now.displacement)} m · red odometer d = ${now.distance.toFixed(0)} m`) : bn ? 'উত্তর বেছে বাঁক-ফেরা রিপ্লে দেখো' : 'Pick an answer to replay the turnaround';
    if (hideAreas) return bn ? 'অনুমান করো, তারপর DRIVE!' : 'Predict first, then DRIVE!';
    if (config.targetDisplacementMeters !== undefined) return bn ? `লক্ষ্য: ${config.targetDisplacementMeters} m প্যাডে থামো` : `Goal: stop on the ${config.targetDisplacementMeters} m pad`;
    if (NODE_KEYS.every((k) => config.lockedNodes.includes(k))) {
      return bn ? `v-t ক্ষেত্রফল = সরণ = ${sgn(full.netDisplacement)} m` : `Area under v-t = displacement = ${sgn(full.netDisplacement)} m`;
    }
    return bn ? 'বিন্দু টেনে আকার বদলাও, তারপর DRIVE' : 'Drag the dots to reshape v-t, then DRIVE';
  })();

  const strobe: number[] = [];
  if (tp > 0) for (let t = 0; t <= tp + 1e-9; t += 1) strobe.push(motionAt(nodes, T, t).displacement);
  const carDir = Math.abs(now.velocity) > 1e-6 ? Math.sign(now.velocity) : Math.sign(nodes[2] || nodes[1] || nodes[0] || 1);

  const dragIdx = draggingNode ? NODE_KEYS.indexOf(draggingNode) : -1;
  const pad = config.targetDisplacementMeters;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-[#0F172A] shadow-sm">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={(e) => draggingNode && onStagePointerMove(e.clientY)}
        onPointerUp={() => draggingNode && onStagePointerUp()}
        onPointerCancel={() => draggingNode && onStagePointerUp()}
        className="block h-auto w-full touch-none select-none"
      >
        <rect x={0} y={0} width={W} height={H} fill="#0F172A" />
        {/* EV highway */}
        <rect x={10} y={10} width={W - 20} height={40} rx={8} fill="#1E293B" />
        <line x1={16} y1={30} x2={W - 16} y2={30} stroke="#475569" strokeWidth={1.5} strokeDasharray="8 6" />
        {pad !== undefined && (
          <g>
            <rect x={sx(pad) - 9} y={12} width={18} height={36} rx={4} fill="#065F46" stroke="#34D399" strokeWidth={2} />
            <text x={sx(pad)} y={35} textAnchor="middle" fill="#A7F3D0" fontSize={12} fontWeight={900}>{'⚡'}</text>
          </g>
        )}
        {[sMin, ...(sMin < 0 ? [0] : []), ...(pad !== undefined ? [pad] : []), sMax].map((s) => (
          <text key={s} x={sx(s)} y={64} textAnchor="middle" fill={s === pad ? '#6EE7B7' : '#94A3B8'} fontSize={12} fontWeight={700}>{`${s} m`}</text>
        ))}
        {strobe.map((s, i) => <circle key={i} cx={sx(s)} cy={46} r={2.4} fill="#FDE047" opacity={0.85} />)}
        {ghosts.map((g) => (
          <Car key={g.id} x={sx(computePiecewiseKinematics(g.nodes[0], g.nodes[1], g.nodes[2], T).netDisplacement)} y={30} dir={1} tone="ghost" />
        ))}
        {isTrap && tp > 0 && <Car x={sx(now.distance)} y={40} dir={1} tone="trap" />}
        <Car x={sx(now.displacement)} y={isTrap ? 21 : 30} dir={carDir} tone="real" />
        {driving && Math.abs(now.velocity) > 0.05 && (
          <line
            x1={sx(now.displacement) + carDir * 15}
            y1={isTrap ? 21 : 30}
            x2={sx(now.displacement) + carDir * 15 + now.velocity * 1.8}
            y2={isTrap ? 21 : 30}
            stroke={now.velocity > 0 ? '#34D399' : '#FB7185'}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        <text x={W / 2} y={84} textAnchor="middle" fill="#E2E8F0" fontSize={12} fontWeight={800}>{hud}</text>

        {/* v-t chart */}
        {gridVs.map((v) => (
          <g key={v}>
            <line x1={CX0} y1={vy(v)} x2={CX1} y2={vy(v)} stroke={v === 0 ? '#94A3B8' : '#1E293B'} strokeWidth={v === 0 ? 1.6 : 1} />
            <text x={CX0 - 6} y={vy(v) + 4} textAnchor="end" fill="#94A3B8" fontSize={12} fontWeight={700}>{v}</text>
          </g>
        ))}
        <line x1={CX0} y1={CY_TOP} x2={CX0} y2={CY_BOT} stroke="#94A3B8" strokeWidth={1.6} />
        {[0, T, 2 * T].map((t) => (
          <text key={t} x={tx(t)} y={272} textAnchor="middle" fill="#94A3B8" fontSize={12} fontWeight={700}>{t === 0 ? 't = 0' : `${t} s`}</text>
        ))}
        {areaRuns(nodes, T, areaT).map((r, i) => (
          <polygon
            key={i}
            points={[`${tx(r.t0)},${zeroY}`, ...r.pts.map(([t, v]) => `${tx(t)},${vy(v)}`), `${tx(r.t1)},${zeroY}`].join(' ')}
            fill={r.sign > 0 ? '#10B981' : '#F43F5E'}
            fillOpacity={0.35}
          />
        ))}
        {showAreaLabels &&
          areaRuns(nodes, T, areaT).map((r, i) => {
            const tm = (r.t0 + r.t1) / 2;
            return Math.abs(r.area) >= 1 ? (
              <text key={`l${i}`} x={tx(tm)} y={(zeroY + vy(velocityAt(nodes, T, tm))) / 2 + 4} textAnchor="middle" fill={r.sign > 0 ? '#A7F3D0' : '#FECDD3'} fontSize={12} fontWeight={900}>
                {`${sgn(r.area)} m`}
              </text>
            ) : null;
          })}
        {ghosts.map((g) => <polyline key={g.id} points={curve(g.nodes)} fill="none" stroke="#64748B" strokeWidth={2} strokeDasharray="5 4" />)}
        <polyline points={curve(nodes)} fill="none" stroke="#FDE047" strokeWidth={3} strokeLinejoin="round" />
        {driving && <line x1={tx(tp)} y1={CY_TOP - 4} x2={tx(tp)} y2={CY_BOT} stroke="#F8FAFC" strokeWidth={1.5} strokeDasharray="3 3" />}

        {NODE_KEYS.map((key, k) => {
          const x = tx(k * T);
          const y = vy(nodes[k]);
          const editable = !config.lockedNodes.includes(key);
          if (!editable) return <circle key={key} cx={x} cy={y} r={5} fill="#CBD5E1" />;
          return (
            <g key={key}>
              {key === 'v1' && !hasInteracted && config.mode === 'explore' && (
                <circle cx={x} cy={y} r={26} fill="none" stroke="#2DD4BF" strokeWidth={2.8} className="animate-pulse-halo" />
              )}
              <circle cx={x} cy={y} r={13} fill={draggingNode === key ? '#14B8A6' : '#0F766E'} stroke="#F8FAFC" strokeWidth={2.5} />
              <text x={x} y={y + 4} textAnchor="middle" fill="#F8FAFC" fontSize={12} fontWeight={900}>{['v₀', 'v₁', 'v₂'][k]}</text>
              <circle cx={x} cy={y} r={28} fill="transparent" style={{ touchAction: 'none' }} onPointerDown={(e) => onNodePointerDown(key, e)} />
            </g>
          );
        })}
        {dragIdx >= 0 && (
          <g transform={`translate(${Math.max(66, Math.min(W - 66, tx(dragIdx * T)))}, ${Math.max(18, vy(nodes[dragIdx]) - 42)})`}>
            <rect x={-60} y={-14} width={120} height={26} rx={10} fill="#0F172A" stroke="#2DD4BF" strokeWidth={2} />
            <text x={0} y={4} textAnchor="middle" fill="#5EEAD4" fontSize={12.5} fontWeight={800}>{`(${dragIdx * T} s, ${nodes[dragIdx]} m/s)`}</text>
          </g>
        )}
        <text x={W / 2} y={H - 4} textAnchor="middle" fill={status?.color ?? '#94A3B8'} fontSize={12} fontWeight={status ? 800 : 700}>{caption}</text>
      </svg>
    </div>
  );
};
