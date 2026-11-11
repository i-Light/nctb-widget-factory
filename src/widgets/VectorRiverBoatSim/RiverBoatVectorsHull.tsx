'use client';

import React from 'react';

export const RiverBoatVectorsHull: React.FC<{
  boatX: number;
  boatY: number;
  showVectors: boolean;
  uxPx: number;
  vxThrustPx: number;
  vyThrustPx: number;
  rxPx: number;
  ryPx: number;
  isZeroDriftAligned: boolean;
  dualTrapMode: boolean;
  hullRotateSvgDeg: number;
}> = ({
  boatX,
  boatY,
  showVectors,
  uxPx,
  vxThrustPx,
  vyThrustPx,
  rxPx,
  ryPx,
  isZeroDriftAligned,
  dualTrapMode,
  hullRotateSvgDeg,
}) => (
  <g transform={`translate(${boatX}, ${boatY})`}>
    {showVectors && (
      <g>
        <line x1={vxThrustPx} y1={vyThrustPx} x2={rxPx} y2={ryPx} stroke="#0284C7" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.75} />
        <line x1={uxPx} y1={0} x2={rxPx} y2={ryPx} stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.75} />
        <line x1={0} y1={0} x2={uxPx} y2={0} stroke="#0284C7" strokeWidth={2.8} />
        <circle cx={uxPx} cy={0} r={3} fill="#0284C7" />
        <line x1={0} y1={0} x2={vxThrustPx} y2={vyThrustPx} stroke="#7C3AED" strokeWidth={2.8} />
        <circle cx={vxThrustPx} cy={vyThrustPx} r={3} fill="#7C3AED" />
        <line x1={0} y1={0} x2={rxPx} y2={ryPx} stroke="#059669" strokeWidth={3.2} />
        <circle cx={rxPx} cy={ryPx} r={3.5} fill="#059669" />
        {isZeroDriftAligned && (
          <g transform={`translate(0, ${Math.min(-34, ryPx - 14)})`}>
            <rect x={-64} y={-12} width={128} height={20} rx={8} fill="#0F172A" />
            <text x={0} y={2} textAnchor="middle" fill="#34D399" fontSize={12} fontWeight={800}>
              R_x = 0 · Zero Drift!
            </text>
          </g>
        )}
      </g>
    )}
    <g transform={`rotate(${dualTrapMode ? -30 : hullRotateSvgDeg})`}>
      <polygon points="0,-14 9,10 0,6 -9,10" fill="#10B981" stroke="#0F172A" strokeWidth={2} />
      <circle cx={0} cy={0} r={3} fill="#ECFDF5" />
    </g>
  </g>
);
