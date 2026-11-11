'use client';

import React from 'react';
import type { VectorRiverBoatProps } from './VectorRiverBoatSim.schema';

const STREAMLINE_ROWS = [68, 98, 128, 158, 188, 210] as const;

export const RiverBoatChannelBackdrop: React.FC<{
  config: VectorRiverBoatProps;
  lang: 'en' | 'bn';
  streamOffset: number;
  rockSplash: boolean;
}> = ({ config, lang, streamOffset, rockSplash }) => {
  const W = 360;
  const H = 272;
  const startX = 156;
  const northBankY = 44;
  const southBankY = 224;
  const pxPerMeterX = 1.48;

  return (
    <>
      <defs>
        <linearGradient id="riverWaterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="50%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={W} height={northBankY} fill="#065F46" />
      <line x1={0} y1={northBankY} x2={W} y2={northBankY} stroke="#047857" strokeWidth={3} />
      <rect x={0} y={northBankY} width={W} height={southBankY - northBankY} fill="url(#riverWaterGrad)" />
      <rect x={0} y={southBankY} width={W} height={H - southBankY} fill="#0F3D3E" />
      <line x1={0} y1={southBankY} x2={W} y2={southBankY} stroke="#14B8A6" strokeWidth={2.5} />

      {[-60, 0, 40, 80].map((mTick) => {
        const tx = startX + mTick * pxPerMeterX;
        if (tx < 18 || tx > W - 18) return null;
        return (
          <g key={mTick}>
            <line x1={tx} y1={northBankY - 6} x2={tx} y2={northBankY} stroke="#A7F3D0" strokeWidth={2} />
            <text x={tx} y={16} textAnchor="middle" fill={mTick === 0 ? '#6EE7B7' : '#ECFDF5'} fontSize={12} fontWeight={800}>
              {mTick > 0 ? `+${mTick}m` : `${mTick}m`}
            </text>
          </g>
        );
      })}

      <g transform={`translate(${startX}, ${northBankY})`}>
        <rect x={-16} y={-18} width={32} height={18} rx={4} fill="#10B981" stroke="#ECFDF5" strokeWidth={2} />
        <circle cx={0} cy={-9} r={5} fill="#ECFDF5" />
        <circle cx={0} cy={-9} r={2.2} fill="#047857" />
      </g>

      {STREAMLINE_ROWS.map((ry, idx) => {
        const shift = (streamOffset * (idx % 2 === 0 ? 1 : 0.78)) % 90;
        return (
          <g key={ry} opacity={0.52}>
            {[0, 90, 180, 270, 360].map((baseX) => (
              <line key={baseX} x1={baseX + shift - 60} y1={ry} x2={baseX + shift - 24} y2={ry} stroke="#0284C7" strokeWidth={2} strokeLinecap="round" />
            ))}
          </g>
        );
      })}

      <g transform="translate(12, 56)">
        <rect x={0} y={0} width={92} height={22} rx={8} fill="#0369A1" opacity={0.9} />
        <text x={46} y={15} textAnchor="middle" fill="#F0F9FF" fontSize={12} fontWeight={800}>
          u = {config.initialStreamSpeed} m/s →
        </text>
      </g>

      <line
        x1={startX}
        y1={southBankY}
        x2={startX}
        y2={northBankY}
        stroke={config.angleReference === 'perpendicular' ? '#F59E0B' : '#64748B'}
        strokeWidth={config.angleReference === 'perpendicular' ? 2.8 : 1.6}
        strokeDasharray="5 4"
        opacity={config.angleReference === 'perpendicular' ? 0.95 : 0.55}
      />
      {config.angleReference === 'perpendicular' && (
        <text x={startX + 7} y={104} fill="#B45309" fontSize={12} fontWeight={800}>
                    {lang === 'bn' ? '\u09AA\u09CD\u09B0\u09B8\u09CD\u09A5 (d)' : 'Width (0°)'}
        </text>
      )}

      {config.downstreamRockMeters !== undefined && (
        <g transform={`translate(${startX + config.downstreamRockMeters * pxPerMeterX}, ${southBankY - (southBankY - northBankY) * 0.74})`}>
          <ellipse cx={18} cy={2} rx={34} ry={13} fill="#FEF2F2" stroke="#F87171" strokeDasharray="3 3" strokeWidth={1.5} />
          <polygon points="-8,6 0,-10 11,5" fill="#475569" stroke="#1E293B" strokeWidth={1.5} />
          <polygon points="6,8 18,-12 31,7" fill="#64748B" stroke="#1E293B" strokeWidth={1.5} />
          <polygon points="24,7 34,-6 43,7" fill="#475569" stroke="#1E293B" strokeWidth={1.5} />
          <text x={18} y={22} textAnchor="middle" fill="#B91C1C" fontSize={12} fontWeight={800}>
                        {lang === 'bn' ? `\u09AA\u09BE\u09A5\u09B0 +${config.downstreamRockMeters}m` : `Rocks +${config.downstreamRockMeters}m`}
          </text>
          {rockSplash && <circle cx={6} cy={0} r={18} fill="none" stroke="#EF4444" strokeWidth={3} />}
        </g>
      )}
    </>
  );
};
