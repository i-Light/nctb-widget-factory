'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { RayOpticsProps } from './RayOpticsCanvas.schema';
import { computeThinLensMetrics, type ThinLensMetrics } from './RayOpticsCanvas.eval';

/** Stage geometry (viewBox units ≈ CSS px on a 360-wide phone). */
export const STAGE = { W: 360, H: 276, LX: 168, AX: 150, S: 2.8, HO: 34 } as const;
const { W, H, LX, AX, S, HO } = STAGE;
const MAX_DRAW_M = 2.6;

type Pt = { x: number; y: number };
type Seg = [Pt, Pt];

/** Three principal rays from the candle-flame tip, refracted per the thin-lens image point. */
export function tracePrincipalRays(fSigned: number, uCm: number, m: ThinLensMetrics) {
  const tip: Pt = { x: LX - uCm * S, y: AX - HO };
  const hits: Pt[] = [{ x: LX, y: tip.y }, { x: LX, y: AX }];
  if (Math.abs(fSigned - uCm) > 1e-6) {
    const y3 = AX + (tip.y - AX) * (fSigned / (fSigned - uCm));
    if (Math.abs(y3 - AX) < 125) hits.push({ x: LX, y: y3 });
  }
  const img: Pt | null = m.atInfinity ? null : { x: LX + m.vCm * S, y: AX - m.magnification * HO };
  const incident: Seg[] = hits.map((h) => [tip, h]);
  const refracted: Seg[] = [];
  const back: Seg[] = [];
  for (const h of hits) {
    const d = !img ? { x: LX - tip.x, y: AX - tip.y } : m.isReal ? { x: img.x - h.x, y: img.y - h.y } : { x: h.x - img.x, y: h.y - img.y };
    if (d.x <= 1e-6) continue;
    const t = (W + 24 - h.x) / d.x;
    refracted.push([h, { x: h.x + d.x * t, y: h.y + d.y * t }]);
    if (img && !m.isReal) back.push([h, img]);
  }
  return { tip, img, incident, refracted, back };
}

const Candle: React.FC<{ x: number; mag: number; tone: 'object' | 'real' | 'virtual' | 'ghost' | 'trap'; flicker?: boolean }> = ({ x, mag, tone, flicker }) => {
  const k = Math.max(-MAX_DRAW_M, Math.min(MAX_DRAW_M, mag));
  const wScale = Math.min(2.2, Math.max(0.7, Math.abs(k)));
  const dashed = tone === 'virtual' || tone === 'ghost';
  const body = tone === 'trap' ? '#F87171' : tone === 'ghost' ? '#64748B' : tone === 'object' ? '#FDE68A' : '#5EEAD4';
  const flame = tone === 'trap' ? '#FCA5A5' : tone === 'ghost' ? '#94A3B8' : '#FB923C';
  const filled = !dashed;
  return (
    <g transform={`translate(${x}, ${AX}) scale(${wScale}, ${k})`} opacity={tone === 'ghost' ? 0.45 : dashed ? 0.85 : 1}>
      <rect x={-5} y={-(HO - 13)} width={10} height={HO - 13} rx={2} fill={filled ? body : 'none'} stroke={body} strokeWidth={2} strokeDasharray={dashed ? '4 3' : undefined} vectorEffect="non-scaling-stroke" />
      <path d={`M0,${-HO} C6,${-HO + 6} 5,${-HO + 12} 0,${-HO + 13} C-5,${-HO + 12} -6,${-HO + 6} 0,${-HO} Z`} fill={filled ? flame : 'none'} stroke={flame} strokeWidth={2} vectorEffect="non-scaling-stroke" className={flicker ? 'animate-pulse' : undefined} />
    </g>
  );
};

export interface RayOpticsStageSvgProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  config: RayOpticsProps;
  lang: 'en' | 'bn';
  fAbs: number;
  uCm: number;
  metrics: ThinLensMetrics;
  dragging: boolean;
  hasInteracted: boolean;
  revealed: boolean;
  xray: boolean;
  ghosts: Array<{ id: number; f: number; u: number }>;
  replayT: number;
  onToggleXray: () => void;
  onCandlePointerDown: (e: React.PointerEvent<SVGCircleElement>) => void;
  onStagePointerMove: (clientX: number) => void;
  onStagePointerUp: () => void;
}

export const fmtCm = (n: number) => `${n < 0 ? '−' : ''}${Number.isInteger(n) ? Math.abs(n) : Math.abs(n).toFixed(1)}`;
const fmt = fmtCm;

export const RayOpticsStageSvg: React.FC<RayOpticsStageSvgProps> = ({
  svgRef, config, lang, fAbs, uCm, metrics, dragging, hasInteracted, revealed, xray, ghosts, replayT,
  onToggleXray, onCandlePointerDown, onStagePointerMove, onStagePointerUp,
}) => {
  const bn = lang === 'bn';
  const m = metrics;
  const fSigned = m.f;
  const canDrag = !config.lockedControls.includes('objectDist');
  const hideImage = config.mode === 'predict' && !revealed;
  const rays = tracePrincipalRays(fSigned, uCm, m);
  const xo = rays.tip.x;
  const imgOffStage = !rays.img || rays.img.x > W - 6 || rays.img.x < 6;
  const screenCm = config.targetGoal === 'screen_focus' ? config.screenDistanceCm : undefined;

  const vText = m.atInfinity ? '∞' : `${fmt(m.vCm)} cm`;
  const mText = m.atInfinity ? '∞' : `${m.magnification > 0 ? '+' : '−'}${Math.abs(m.magnification).toFixed(1)}×`;

  // Card 4 cinema screen blur halo (the sharp image itself is the main image candle landing on the screen)
  let screenNode: React.ReactNode = null;
  let screenStatus: { text: string; color: string } | null = null;
  if (screenCm !== undefined) {
    const xs = LX + screenCm * S;
    const sharp = m.isReal && Math.abs(m.vCm - screenCm) <= config.screenToleranceCm;
    const hit = sharp && config.targetMagnificationAbs !== undefined && Math.abs(Math.abs(m.magnification) - config.targetMagnificationAbs) <= config.tolerance;
    const yc = AX + (HO * screenCm) / uCm;
    const blur = m.isReal ? Math.min(46, (60 * Math.abs(m.vCm - screenCm)) / Math.abs(m.vCm)) : 46;
    const mAbs = Math.abs(m.magnification).toFixed(1);
    if (sharp) {
      screenStatus = hit
        ? { text: bn ? `স্পষ্ট ${mAbs}× বিম্ব! ✓` : `SHARP ${mAbs}× on screen ✓`, color: '#34D399' }
        : { text: bn ? `স্পষ্ট, কিন্তু ${mAbs}× — দরকার ${config.targetMagnificationAbs}×` : `Sharp, but ${mAbs}× — need ${config.targetMagnificationAbs?.toFixed(1)}×`, color: '#FBBF24' };
    }
    screenNode = (
      <g>
        <rect x={xs - 3} y={AX - 96} width={6} height={192} rx={3} fill={hit ? '#10B981' : '#CBD5E1'} opacity={0.9} />
        {!sharp && <ellipse cx={xs - 6} cy={m.isReal ? Math.max(AX - 90, Math.min(AX + 90, yc)) : AX} rx={6 + blur * 0.25} ry={Math.max(8, blur)} fill="url(#ro-blur)" />}
      </g>
    );
  }

  // Card 5 simultaneous ±m overlay
  let replayNode: React.ReactNode = null;
  const d = config.replayObjectDistsCm;
  if (d && replayT > 0) {
    const items = [
      { u: d.real, tone: 'real' as const },
      { u: d.virtual, tone: 'virtual' as const },
      { u: d.trap, tone: 'trap' as const },
    ];
    replayNode = (
      <g>
        {items.map(({ u, tone }) => {
          const mm = computeThinLensMetrics(config.lensType, fAbs, u);
          if (mm.atInfinity) return null;
          const xi = LX + mm.vCm * S;
          const yi = AX - mm.magnification * HO * replayT;
          const color = tone === 'trap' ? '#FCA5A5' : '#5EEAD4';
          const labelY = mm.magnification < 0 ? Math.min(H - 26, yi + 16) : Math.max(52, yi - 10);
          return (
            <g key={tone}>
              {u !== uCm && <Candle x={LX - u * S} mag={1} tone={tone === 'trap' ? 'trap' : 'ghost'} />}
              <Candle x={xi} mag={mm.magnification * replayT} tone={tone} />
              <text x={Math.max(44, Math.min(W - 44, xi))} y={labelY} textAnchor="middle" fill={color} fontSize={12} fontWeight={800}>
                {`u=${u} → ${mm.magnification > 0 ? '+' : '−'}${Math.abs(mm.magnification)}×`}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  const zoneCaption = () => {
    if (config.lensType === 'concave') return bn ? 'অবতল: সর্বদা অবাস্তব, সোজা, খর্বিত' : 'Concave: always virtual, upright, diminished';
    const f = fAbs;
    if (m.atInfinity) return bn ? 'u = F: বিম্ব অসীমে!' : 'u = F: image at ∞!';
    if (uCm < f) return bn ? 'u < F: অবাস্তব, সোজা, বিবর্ধিত' : 'u < F: virtual, upright, magnified';
    if (Math.abs(uCm - 2 * f) < 1e-6) return bn ? 'u = 2F: বাস্তব, উল্টো, সমান আকার' : 'u = 2F: real, inverted, same size';
    if (uCm < 2 * f) return bn ? 'F < u < 2F: বাস্তব, উল্টো, বিবর্ধিত' : 'F < u < 2F: real, inverted, magnified';
    return bn ? 'u > 2F: বাস্তব, উল্টো, খর্বিত' : 'u > 2F: real, inverted, diminished';
  };
  const caption = (() => {
    if (xray && !hideImage) return m.atInfinity ? `1/${uCm} + 1/∞ = 1/${fSigned}` : `1/${uCm} + 1/(${fmt(m.vCm)}) = 1/${fSigned}`;
    if (hideImage) return bn ? 'অনুমান করো, তারপর রশ্মি আঁকো!' : 'Predict first, then trace the rays!';
    if (config.mode === 'exam_trap') return replayT > 0 ? (bn ? 'সবুজ = ২× (বাস্তব ও অবাস্তব) · লাল = 2F ফাঁদ 1×' : 'teal = 2× (real & virtual) · red = 2F trap 1×') : bn ? 'উত্তর বেছে ±m রিপ্লে দেখো' : 'Pick an answer to replay ±m';
    if (screenStatus) return screenStatus.text;
    if (screenCm !== undefined) return bn ? `পর্দা v = ${screenCm} cm · দরকার স্পষ্ট ${config.targetMagnificationAbs}×` : `Screen at v = ${screenCm} cm · need sharp ${config.targetMagnificationAbs?.toFixed(1)}×`;
    return zoneCaption();
  })();

  const markers = [-2, -1, 1, 2].map((k) => ({ k, x: LX + k * fAbs * S })).filter((p) => p.x > 4 && p.x < W - 4);
  const lensPath =
    config.lensType === 'convex'
      ? `M${LX},${AX - 92} Q${LX + 16},${AX} ${LX},${AX + 92} Q${LX - 16},${AX} ${LX},${AX - 92} Z`
      : `M${LX - 10},${AX - 92} L${LX + 10},${AX - 92} Q${LX + 2},${AX} ${LX + 10},${AX + 92} L${LX - 10},${AX + 92} Q${LX - 2},${AX} ${LX - 10},${AX - 92} Z`;
  const readoutX = Math.max(66, Math.min(W - 66, xo));

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-[#0F172A] shadow-sm">
      <div className="pointer-events-none absolute top-2 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5">
        <div className="min-w-0 whitespace-nowrap rounded-xl border border-slate-700 bg-slate-900/92 px-2.5 py-1 text-[11px] font-extrabold text-slate-100">
          <span className="text-amber-300">f={fAbs} cm</span>
          <span className="mx-1.5 text-slate-600">|</span>
          <span className="text-sky-300">v={hideImage ? '?' : vText}</span>
          <span className="mx-1.5 text-slate-600">|</span>
          <span className={m.isReal ? 'text-teal-300' : 'text-violet-300'}>m={hideImage ? '?' : mText}</span>
        </div>
        <button type="button" onClick={() => { sfx.pop(!xray); onToggleXray(); }} className={`pointer-events-auto flex min-h-[38px] min-w-[46px] shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border px-2.5 py-1 text-[11px] font-extrabold active:scale-95 transition touch-manipulation ${xray ? 'border-teal-400 bg-teal-600 text-white' : 'border-slate-600 bg-slate-800 text-slate-200'}`}>
          <Eye className="h-3.5 w-3.5" /><span>X-Ray</span>
        </button>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={(e) => dragging && onStagePointerMove(e.clientX)}
        onPointerUp={() => dragging && onStagePointerUp()}
        onPointerCancel={() => dragging && onStagePointerUp()}
        className="block h-auto w-full touch-none select-none"
      >
        <defs>
          <radialGradient id="ro-blur">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity={0.75} />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="#0F172A" />
        {canDrag && <rect x={LX - config.objectDistBounds.max * S - 6} y={AX + 4} width={(config.objectDistBounds.max - config.objectDistBounds.min) * S + 12} height={6} rx={3} fill="#1E293B" />}
        <line x1={0} y1={AX} x2={W} y2={AX} stroke="#475569" strokeWidth={1.5} strokeDasharray="6 5" />
        {markers.map(({ k, x }) => (
          <g key={k}>
            <circle cx={x} cy={AX} r={3.5} fill={Math.abs(k) === 1 ? '#FBBF24' : '#A78BFA'} />
            {replayT === 0 && <text x={x} y={AX + 24} textAnchor="middle" fill={Math.abs(k) === 1 ? '#FDE68A' : '#C4B5FD'} fontSize={12} fontWeight={800}>
              {`${Math.abs(k) === 2 ? '2' : ''}F${k > 0 ? '′' : ''}`}
            </text>}
          </g>
        ))}
        <path d={lensPath} fill="#38BDF8" fillOpacity={0.18} stroke="#7DD3FC" strokeWidth={2} />
        {screenNode}
        {ghosts.map((g) => {
          const gm = computeThinLensMetrics(config.lensType, g.f, g.u);
          if (gm.atInfinity) return null;
          const gx = LX + gm.vCm * S;
          return gx > 4 && gx < W - 4 ? <Candle key={g.id} x={gx} mag={gm.magnification} tone="ghost" /> : null;
        })}
        {rays.incident.map(([a, b], i) => <line key={`i${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FDE047" strokeWidth={2} />)}
        {!hideImage && rays.refracted.map(([a, b], i) => <line key={`r${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FDE047" strokeWidth={2} opacity={0.9} />)}
        {!hideImage && rays.back.map(([a, b], i) => <line key={`b${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#C4B5FD" strokeWidth={1.8} strokeDasharray="5 4" />)}
        {!hideImage && rays.img && !imgOffStage && <Candle x={rays.img.x} mag={m.magnification} tone={m.isReal ? 'real' : 'virtual'} />}
        {!hideImage && imgOffStage && (
          <g transform={`translate(${m.atInfinity || m.vCm > 0 ? W - 62 : 62}, ${AX - 62})`}>
            <rect x={-56} y={-13} width={112} height={26} rx={9} fill={m.atInfinity ? '#7C2D12' : '#1E293B'} stroke="#FBBF24" strokeWidth={1.5} className={m.atInfinity ? 'animate-pulse' : undefined} />
            <text x={0} y={4} textAnchor="middle" fill="#FDE68A" fontSize={12} fontWeight={800}>
              {m.atInfinity ? (bn ? 'বিম্ব অসীমে!' : 'Image at ∞!') : m.vCm > 0 ? `v = ${fmt(m.vCm)} cm →` : `← v = ${fmt(m.vCm)} cm`}
            </text>
          </g>
        )}
        {hideImage && (
          <g transform={`translate(${LX + 2 * fAbs * S}, ${AX + 56})`}>
            <circle r={18} fill="#1E293B" stroke="#FBBF24" strokeWidth={2} className="animate-pulse" />
            <text y={6} textAnchor="middle" fill="#FDE68A" fontSize={18} fontWeight={900}>?</text>
          </g>
        )}
        {replayNode}
        <Candle x={xo} mag={1} tone="object" flicker />
        {canDrag && !hasInteracted && config.mode === 'explore' && (
          <circle cx={xo} cy={AX - HO / 2} r={30} fill="none" stroke="#2DD4BF" strokeWidth={2.8} className="animate-pulse-halo" />
        )}
        {canDrag && <circle cx={xo} cy={AX - HO / 2} r={28} fill="transparent" style={{ touchAction: 'none' }} onPointerDown={onCandlePointerDown} />}
        {dragging && (
          <g transform={`translate(${readoutX}, ${Math.max(18, AX - HO - 42)})`}>
            <rect x={-62} y={-14} width={124} height={26} rx={10} fill="#0F172A" stroke="#2DD4BF" strokeWidth={2} />
            <text x={0} y={4} textAnchor="middle" fill="#5EEAD4" fontSize={12.5} fontWeight={800}>{`u = ${uCm} cm · v = ${vText}`}</text>
          </g>
        )}
        <text x={W / 2} y={H - 8} textAnchor="middle" fill={screenStatus && !xray ? screenStatus.color : '#94A3B8'} fontSize={12} fontWeight={screenStatus && !xray ? 800 : 700}>{caption}</text>
      </svg>
    </div>
  );
};
