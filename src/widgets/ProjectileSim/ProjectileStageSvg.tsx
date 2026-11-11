'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { sfx } from '@/engine/audio';
import type { ProjectileCardProps } from './ProjectileSim.schema';
import type { PhysicsMetrics } from './ProjectileSim.eval';

export interface ProjectileStageSvgProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  config: ProjectileCardProps;
  lang: 'en' | 'bn';
  angle: number;
  m: PhysicsMetrics;
  scale: number;
  canDragAngle: boolean;
  dragging: boolean;
  hasDraggedOnce: boolean;
  showVectors: boolean;
  flightProgress: number | null;
  previewPoints: string;
  ghostShots: Array<{ id: number; label: string; points: string }>;
  smokePuffs: Array<{ id: number; dx: number; dy: number; r: number }>;
  strobeDots: Array<{ x: number; y: number }>;
  activeBall: { cx: number; cy: number; vx: number; vyNow: number; atApex: boolean };
  trapGhostBall: { cx: number; cy: number; poly: string } | null;
  onToggleVectors: () => void;
  onStartDrag: (pointerId: number, target: SVGCircleElement) => void;
  onMoveDrag: (clientX: number, clientY: number) => void;
  onEndDrag: () => void;
}

export const ProjectileStageSvg: React.FC<ProjectileStageSvgProps> = ({
  svgRef,
  config,
  lang,
  angle,
  m,
  scale,
  canDragAngle,
  dragging,
  hasDraggedOnce,
  showVectors,
  flightProgress,
  previewPoints,
  ghostShots,
  smokePuffs,
  strobeDots,
  activeBall,
  trapGhostBall,
  onToggleVectors,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
}) => {
  const W = 360;
  const H = 268;
  const OX = 42;
  const GY = 228;
  const AIM_R = 58;

  const rad = (m.horizontalAngleDeg * Math.PI) / 180;
  const aimX = OX + AIM_R * Math.cos(rad);
  const aimY = GY - AIM_R * Math.sin(rad);
  const floatBadgeX = Math.max(46, Math.min(W - 46, aimX));
  const floatBadgeY = Math.max(22, aimY - 40);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
      <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1.5">
        <div className="rounded-xl border border-slate-200 bg-white/92 px-2.5 py-1 text-[11px] font-bold text-slate-800 backdrop-blur">
          <span className="text-teal-700">H={m.maxHeight.toFixed(1)}m</span>
          <span className="mx-1.5 text-slate-300">|</span>
          <span className="text-indigo-700">R={m.range.toFixed(1)}m</span>
        </div>

        <button
          type="button"
          onClick={() => {
            sfx.pop(!showVectors);
            onToggleVectors();
          }}
          className={`pointer-events-auto flex min-h-[38px] min-w-[42px] items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold active:scale-95 transition touch-manipulation ${
            showVectors
              ? 'border-teal-700 bg-teal-600 text-white'
              : 'border-slate-300 bg-white/95 text-slate-700'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{lang === 'bn' ? '\u09ad\u09c7\u0995\u09cd\u099f\u09b0' : 'Vec'}</span>
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={(e) => dragging && onMoveDrag(e.clientX, e.clientY)}
        onPointerUp={onEndDrag}
        onPointerCancel={onEndDrag}
        className="block h-auto w-full touch-none select-none"
      >
        <defs>
          <linearGradient id="projSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0FDFA" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={W} height={GY} fill="url(#projSky)" />
        <rect x={0} y={GY} width={W} height={H - GY} fill="#059669" />
        <line x1={0} y1={GY} x2={W} y2={GY} stroke="#047857" strokeWidth={2.5} />

        {[20, 40, 60].map((meter) => {
          const tx = OX + meter * scale;
          if (tx > W - 16) return null;
          return (
            <g key={meter}>
              <line x1={tx} y1={GY} x2={tx} y2={GY + 6} stroke="#ECFDF5" strokeWidth={2} />
              <text x={tx} y={GY + 20} textAnchor="middle" fill="#ECFDF5" fontSize={12} fontWeight={700}>
                {meter}m
              </text>
            </g>
          );
        })}

        {config.mode === 'predict' &&
          [
            { mult: '1× (2.5m)', hM: 2.5, color: '#94A3B8' },
            { mult: '2× (5.0m)', hM: 5.0, color: '#7C3AED' },
            { mult: '4× (10.0m)', hM: 10.0, color: '#0D9488' },
          ].map((band) => {
            const by = GY - band.hM * scale;
            if (by < 34) return null;
            return (
              <g key={band.mult}>
                <line x1={OX} y1={by} x2={W - 14} y2={by} stroke={band.color} strokeDasharray="4 4" strokeWidth={1.5} opacity={0.7} />
                <text x={W - 16} y={by - 4} textAnchor="end" fill={band.color} fontSize={12} fontWeight={700}>
                  {band.mult}
                </text>
              </g>
            );
          })}

        {config.angleAxis === 'vertical' && (
          <g>
            <line x1={OX} y1={GY} x2={OX} y2={GY - 92} stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="5 3" />
            <text x={OX + 6} y={GY - 80} fill="#D97706" fontSize={12} fontWeight={800}>
              Y-Axis (30°)
            </text>
          </g>
        )}

        {config.targetMetric === 'range' && config.targetValue !== undefined && (
          <g transform={`translate(${OX + config.targetValue * scale}, ${GY})`}>
            <ellipse cx={0} cy={2} rx={12} ry={4} fill="#FDE68A" stroke="#D97706" strokeWidth={1.5} />
            <line x1={0} y1={0} x2={0} y2={-30} stroke="#DC2626" strokeWidth={2.5} />
            <polygon points="0,-30 18,-23 0,-16" fill="#EF4444" />
            <text x={0} y={-35} textAnchor="middle" fill="#B91C1C" fontSize={12} fontWeight={800}>
              {config.targetValue}m
            </text>
          </g>
        )}

        {ghostShots.map((g) => (
          <polyline key={g.id} fill="none" stroke="#64748B" strokeWidth={2} strokeDasharray="4 4" opacity={0.45} points={g.points} />
        ))}

        <polyline
          fill="none"
          stroke="#0D9488"
          strokeWidth={flightProgress !== null ? 3 : 2.5}
          strokeDasharray={flightProgress !== null ? undefined : '6 4'}
          opacity={flightProgress !== null ? 0.9 : 0.65}
          points={previewPoints}
        />

        {trapGhostBall && (
          <g>
            <polyline fill="none" stroke="#EF4444" strokeWidth={2.5} strokeDasharray="4 4" points={trapGhostBall.poly} />
            <circle cx={trapGhostBall.cx} cy={trapGhostBall.cy} r={7} fill="#EF4444" stroke="#FFFFFF" strokeWidth={2} />
            <text x={Math.min(W - 48, trapGhostBall.cx + 10)} y={Math.max(46, trapGhostBall.cy - 8)} fill="#DC2626" fontSize={12} fontWeight={800}>
              30° (H=5m)
            </text>
          </g>
        )}

        {strobeDots.map((d, idx) => (
          <circle key={idx} cx={d.x} cy={d.y} r={3} fill="#0F766E" opacity={0.65} />
        ))}

        {flightProgress !== null &&
          flightProgress < 0.45 &&
          smokePuffs.map((p) => (
            <circle key={p.id} cx={OX + p.dx * (1 + flightProgress * 2)} cy={GY + p.dy * (1 + flightProgress * 2)} r={p.r} fill="#CBD5E1" opacity={Math.max(0, 0.65 - flightProgress * 1.4)} />
          ))}

        <path d={`M ${OX + AIM_R} ${GY} A ${AIM_R} ${AIM_R} 0 0 0 ${OX} ${GY - AIM_R}`} fill="none" stroke="#99F6E4" strokeWidth={3} />
        <line x1={OX} y1={GY} x2={aimX} y2={aimY} stroke="#0F3D3E" strokeWidth={5} strokeLinecap="round" />
        <circle cx={OX} cy={GY} r={9} fill="#0F3D3E" />

        {flightProgress !== null && (
          <g>
            <ellipse cx={activeBall.cx} cy={GY + 2} rx={Math.max(3, 9 - (GY - activeBall.cy) * 0.03)} ry={2.5} fill="#064E3B" opacity={0.45} />
            {showVectors && (
              <g>
                <line x1={activeBall.cx} y1={activeBall.cy} x2={activeBall.cx + activeBall.vx * 1.6} y2={activeBall.cy} stroke="#2563EB" strokeWidth={2.5} />
                <circle cx={activeBall.cx + activeBall.vx * 1.6} cy={activeBall.cy} r={3} fill="#2563EB" />
                <line x1={activeBall.cx} y1={activeBall.cy} x2={activeBall.cx} y2={activeBall.cy - activeBall.vyNow * 1.6} stroke="#7C3AED" strokeWidth={2.5} />
                {activeBall.atApex && (
                  <g transform={`translate(${Math.min(W - 52, Math.max(52, activeBall.cx))}, ${Math.max(46, activeBall.cy - 22)})`}>
                    <rect x={-38} y={-13} width={76} height={20} rx={8} fill="#0F172A" />
                    <text x={0} y={1} textAnchor="middle" fill="#5EEAD4" fontSize={12} fontWeight={800}>
                      v_y = 0!
                    </text>
                  </g>
                )}
              </g>
            )}
            <circle cx={activeBall.cx} cy={activeBall.cy} r={7.5} fill="#0D9488" stroke="#FFFFFF" strokeWidth={2} />
          </g>
        )}

        {canDragAngle && (
          <g>
            {!hasDraggedOnce && config.mode === 'explore' && (
              <g>
                <circle cx={aimX} cy={aimY} r={22} fill="none" stroke="#14B8A6" strokeWidth={3} className="animate-pulse-halo" />
                <g transform={`translate(${Math.min(W - 56, aimX + 36)}, ${Math.max(46, aimY - 8)})`}>
                  <rect x={-34} y={-12} width={68} height={22} rx={9} fill="#0F172A" />
                  <text x={0} y={3} textAnchor="middle" fill="#5EEAD4" fontSize={12} fontWeight={800}>
                    {lang === 'bn' ? '\u03b8 \u099f\u09be\u09a8\u09cb \u2195' : 'Drag \u03b8 \u2195'}
                  </text>
                </g>
              </g>
            )}
            <circle cx={aimX} cy={aimY} r={14} fill="#10B981" stroke="#FFFFFF" strokeWidth={3} />
            <circle
              cx={aimX}
              cy={aimY}
              r={28}
              fill="transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onStartDrag(e.pointerId, e.currentTarget);
              }}
            />
          </g>
        )}

        {dragging ? (
          <g transform={`translate(${floatBadgeX}, ${floatBadgeY})`}>
            <rect x={-40} y={-14} width={80} height={24} rx={10} fill="#0F172A" />
            <text x={0} y={2} textAnchor="middle" fill="#5EEAD4" fontSize={12.5} fontWeight={800}>
              θ = {angle}°
            </text>
          </g>
        ) : (
          <text x={OX + 28} y={GY - 10} fill="#0F3D3E" fontSize={12.5} fontWeight={800}>
            {angle}°
          </text>
        )}
      </svg>
    </div>
  );
};
