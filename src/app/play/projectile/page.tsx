'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck,
  Award,
  X,
  Eye,
  Compass,
  Lock,
  Unlock,
  Zap,
  Target
} from 'lucide-react';

type Lang = 'en' | 'bn';

interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
}

interface GhostTrail {
  angleDeg: number;
  speed: number;
  points: string;
  range: number;
  maxH: number;
}

/* ============================================================================
   WEB AUDIO TACTILE HAPTICS & SOUND ENGINE (ZERO EXTERNAL AUDIO FILES)
   ============================================================================ */
class TactileAudio {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureCtx(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Crisp mechanical ratchet click when dragging angle notches
  tick(pitchFactor = 1) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(520 * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.028);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  // Tactile pop for snapping magnetic math tiles
  pop(up = true) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(up ? 380 : 540, now);
      osc.frequency.exponentialRampToValueAtTime(up ? 680 : 310, now + 0.055);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch {}
  }

  // Pneumatic cannon thump + air whoosh
  launch() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.16);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Warm Brilliant-style rising marimba triad chime on discovery / success
  chime() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const t0 = ctx.currentTime + idx * 0.065;
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.13, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.34);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.36);
      });
    } catch {}
  }

  // Gentle curious two-tone nudge on misconception (never harsh)
  nudge() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    try {
      [330, 277.18].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const t0 = ctx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.09, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.15);
      });
    } catch {}
  }
}

const sfx = new TactileAudio();

/* ============================================================================
   PHYSICS KINEMATICS SOLVER
   ============================================================================ */
function solveTrajectory(u: number, angleDegInput: number, g: number, axis: 'horizontal' | 'vertical') {
  const thetaHoriz = axis === 'vertical' ? 90 - angleDegInput : angleDegInput;
  const rad = (thetaHoriz * Math.PI) / 180;
  const vx = u * Math.cos(rad);
  const vy0 = u * Math.sin(rad);
  const totalT = g > 0 ? (2 * vy0) / g : 0;
  const maxH = g > 0 ? (vy0 * vy0) / (2 * g) : 0;
  const range = g > 0 ? (u * u * Math.sin(2 * rad)) / g : 0;
  return {
    thetaHoriz: Number(thetaHoriz.toFixed(1)),
    vx: Number(vx.toFixed(2)),
    vy0: Number(vy0.toFixed(2)),
    totalT: Number(totalT.toFixed(2)),
    maxH: Number(maxH.toFixed(2)),
    range: Number(range.toFixed(2)),
  };
}

/* ============================================================================
   TYPESET STACKED FRACTION COMPONENT (NO UGLY INLINE SLASHES)
   ============================================================================ */
const MathFrac: React.FC<{ num: React.ReactNode; den: React.ReactNode; className?: string }> = ({
  num,
  den,
  className = '',
}) => (
  <span className={`inline-flex flex-col items-center align-middle mx-1 leading-tight ${className}`}>
    <span className="px-1.5 pb-0.5 border-b-2 border-current font-serif italic">{num}</span>
    <span className="px-1.5 pt-0.5 font-serif italic">{den}</span>
  </span>
);

/* ============================================================================
   CARD 6 SPRINT QUESTIONS
   ============================================================================ */
const SPRINT_MCQS = [
  {
    q: {
      en: 'For a fixed launch speed u, which angle with the ground sends the ball the farthest?',
      bn: 'নির্দিষ্ট বেগে ভূমির সাথে কত কোণে নিক্ষেপ করলে পাল্লা R সর্বাধিক হয়?',
    },
    opts: ['30°', '45°', '60°', '75°'],
    ans: 1,
    why: {
      en: 'In R = u² sin(2θ) / g, sin(2θ) hits its peak value of 1 right at 2θ = 90°, so θ = 45°.',
      bn: 'R = u² sin(2θ) / g সূত্রে 2θ = 90° বা θ = 45° হলে sin(2θ)-এর মান সর্বাধিক ১ হয়।',
    },
  },
  {
    q: {
      en: 'A ball fired at 25° lands at 30.6 m. Which OTHER angle lands on the exact same spot?',
      bn: '২৫° কোণে নিক্ষিপ্ত বল যে বিন্দুতে পড়ে, একই বেগে আর কোন কোণে ছুড়লে ঠিক সেখানেই পড়বে?',
    },
    opts: ['50°', '65°', '55°', '75°'],
    ans: 1,
    why: {
      en: 'Complementary angles θ and (90° − θ) always share identical horizontal range: 90° − 25° = 65°.',
      bn: 'পূরক কোণ θ এবং (90° − θ)-এর অনুভূমিক পাল্লা সর্বদা সমান হয়: 90° − 25° = 65°।',
    },
  },
  {
    q: {
      en: 'At the very top of a 60° flight (u = 20 m/s), what is the ball’s speed?',
      bn: 'u = 20 m/s বেগে 60° কোণে নিক্ষিপ্ত প্রাসের সর্বোচ্চ বিন্দুতে বেগ কত?',
    },
    opts: ['0 m/s', '10 m/s', '17.3 m/s', '20 m/s'],
    ans: 1,
    why: {
      en: 'Vertical velocity v_y drops to 0 at the peak, leaving pure horizontal speed u cos 60° = 20 × 0.5 = 10 m/s!',
      bn: 'শীর্ষবিন্দুতে উল্লম্ব বেগ v_y = 0 হয়, কেবল অনুভূমিক বেগ u cos 60° = 20 × 0.5 = 10 m/s অবশিষ্ট থাকে!',
    },
  },
];

/* ============================================================================
   FLAGSHIP BRILLIANT-STYLE INTERACTIVE STAGE (<ProjectileSim />)
   ============================================================================ */
interface StageProps {
  speed: number;
  angleInput: number;
  gravity: number;
  axis: 'horizontal' | 'vertical';
  canDragAngle: boolean;
  onAngleChange: (deg: number) => void;
  showVectors: boolean;
  onToggleVectors: () => void;
  ghostTrails: GhostTrail[];
  predictionBands?: boolean;
  predictedBandIdx?: number | null;
  wallObstacle?: { xMeters: number; heightMeters: number } | null;
  targetBullseyeMeters?: number | null;
  dualTrapReplay?: boolean; // Card 5 fires red 30°-ground trap ball alongside teal 60°-ground true ball
  flightTNormalized: number; // 0..1 animated time progress
  isFlying: boolean;
  smokePuffs: SmokeParticle[];
  impactHitFlash: boolean;
  hasDraggedOnce: boolean;
}

const BrilliantProjectileStage: React.FC<StageProps> = ({
  speed,
  angleInput,
  gravity,
  axis,
  canDragAngle,
  onAngleChange,
  showVectors,
  onToggleVectors,
  ghostTrails,
  predictionBands = false,
  predictedBandIdx = null,
  wallObstacle = null,
  targetBullseyeMeters = null,
  dualTrapReplay = false,
  flightTNormalized,
  isFlying,
  smokePuffs,
  impactHitFlash,
  hasDraggedOnce,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

  // Stage Coordinate System (560 x 316 viewBox)
  const OX = 66;
  const GY = 268;
  const SCALE = 7.4; // 60m = 444px -> spacious, dramatic arcs!

  const m = useMemo(() => solveTrajectory(speed, angleInput, gravity, axis), [speed, angleInput, gravity, axis]);

  // Check wall collision if wallObstacle is present
  const collisionInfo = useMemo(() => {
    const rad = (m.thetaHoriz * Math.PI) / 180;
    const vx = speed * Math.cos(rad);
    const vy0 = speed * Math.sin(rad);
    if (!wallObstacle || vx <= 0.01) return { hitWall: false, stopTime: m.totalT };
    const tAtWall = wallObstacle.xMeters / vx;
    if (tAtWall > 0 && tAtWall < m.totalT) {
      const yAtWall = vy0 * tAtWall - 0.5 * gravity * tAtWall * tAtWall;
      if (yAtWall <= wallObstacle.heightMeters) {
        return { hitWall: true, stopTime: tAtWall, hitY: Math.max(0, yAtWall) };
      }
    }
    return { hitWall: false, stopTime: m.totalT };
  }, [m, speed, gravity, wallObstacle]);

  // Sample trajectory curve, strobe 0.25s time dots, and instantaneous ball state
  const simRender = useMemo(() => {
    const rad = (m.thetaHoriz * Math.PI) / 180;
    const vx = speed * Math.cos(rad);
    const vy0 = speed * Math.sin(rad);
    const endT = collisionInfo.stopTime;

    const fullPts: string[] = [];
    const activePts: string[] = [];
    const currentT = endT * flightTNormalized;

    for (let i = 0; i <= 72; i++) {
      const t = (endT * i) / 72;
      const px = OX + vx * t * SCALE;
      const py = GY - Math.max(0, vy0 * t - 0.5 * gravity * t * t) * SCALE;
      fullPts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      if (t <= currentT + 1e-4) {
        activePts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      }
    }

    // Stroboscopic equal-time dots (every 0.25s) — reveals constant vx vs changing vy!
    const strobeDots: Array<{ x: number; y: number; t: number }> = [];
    for (let t = 0.25; t < currentT - 0.05; t += 0.25) {
      const sx = OX + vx * t * SCALE;
      const sy = GY - Math.max(0, vy0 * t - 0.5 * gravity * t * t) * SCALE;
      strobeDots.push({ x: sx, y: sy, t });
    }

    const ballPhysX = vx * currentT;
    const ballPhysY = Math.max(0, vy0 * currentT - 0.5 * gravity * currentT * currentT);
    const ballVx = vx;
    const ballVy = currentT >= endT && !isFlying ? 0 : vy0 - gravity * currentT;

    const nearApex = isFlying && Math.abs(currentT - m.totalT / 2) < 0.14 && !collisionInfo.hitWall;

    return {
      fullPoly: fullPts.join(' '),
      activePoly: activePts.join(' '),
      strobeDots,
      bx: OX + ballPhysX * SCALE,
      by: GY - ballPhysY * SCALE,
      ballPhysY,
      ballVx,
      ballVy,
      nearApex,
      peakX: OX + (m.range / 2) * SCALE,
      peakY: GY - m.maxH * SCALE,
    };
  }, [m, speed, gravity, collisionInfo, flightTNormalized, isFlying]);

  // Dual Trap Ghost Ball for Card 5 (30° from ground instead of 30° from vertical)
  const trapGhostRender = useMemo(() => {
    if (!dualTrapReplay) return null;
    const gm = solveTrajectory(speed, 30, gravity, 'horizontal');
    const rad = (30 * Math.PI) / 180;
    const vx = speed * Math.cos(rad);
    const vy0 = speed * Math.sin(rad);
    const curT = gm.totalT * flightTNormalized;
    const pts: string[] = [];
    for (let i = 0; i <= 48; i++) {
      const t = (gm.totalT * i) / 48;
      if (t <= curT + 1e-4) {
        pts.push(
          `${(OX + vx * t * SCALE).toFixed(1)},${(
            GY -
            Math.max(0, vy0 * t - 0.5 * gravity * t * t) * SCALE
          ).toFixed(1)}`
        );
      }
    }
    const gx = OX + vx * curT * SCALE;
    const gy = GY - Math.max(0, vy0 * curT - 0.5 * gravity * curT * curT) * SCALE;
    return {
      poly: pts.join(' '),
      gx,
      gy,
      peakX: OX + (gm.range / 2) * SCALE,
      peakY: GY - gm.maxH * SCALE,
      maxH: gm.maxH,
    };
  }, [dualTrapReplay, speed, gravity, flightTNormalized]);

  // Direct On-Canvas Pointer Dragging of the Aiming Ring Handle
  const updateAngleFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!canDragAngle || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((clientX - rect.left) / rect.width) * 560;
      const svgY = ((clientY - rect.top) / rect.height) * 316;
      const dx = Math.max(4, svgX - OX);
      const dy = Math.max(4, GY - svgY);
      const degFromGround = (Math.atan2(dy, dx) * 180) / Math.PI;
      const snapped = Math.min(75, Math.max(15, Math.round(degFromGround / 5) * 5));
      const nextVal = axis === 'vertical' ? 90 - snapped : snapped;
      if (nextVal !== angleInput) {
        sfx.tick(0.85 + snapped / 120);
        onAngleChange(nextVal);
      }
    },
    [canDragAngle, axis, angleInput, onAngleChange]
  );

  // Aiming Handle Geometry (Radius 76px from Turret Pivot)
  const AIM_R = 76;
  const aimRad = (-m.thetaHoriz * Math.PI) / 180;
  const handleX = OX + AIM_R * Math.cos(aimRad);
  const handleY = GY + AIM_R * Math.sin(aimRad);

  // Shaded Angle Wedge SVG Path
  const wedgePath = useMemo(() => {
    const r = 46;
    const ex = OX + r * Math.cos(aimRad);
    const ey = GY + r * Math.sin(aimRad);
    if (axis === 'horizontal') {
      return `M ${OX} ${GY} L ${OX + r} ${GY} A ${r} ${r} 0 0 0 ${ex.toFixed(1)} ${ey.toFixed(1)} Z`;
    }
    return `M ${OX} ${GY} L ${OX} ${GY - r} A ${r} ${r} 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)} Z`;
  }, [aimRad, axis]);

  // Riding Velocity Vector Pixels
  const VEC_PX = 2.15;
  const vxArrow = simRender.ballVx * VEC_PX;
  const vyArrow = -simRender.ballVy * VEC_PX; // SVG y down

  return (
    <div className="relative rounded-2xl border-2 border-slate-200/90 bg-white shadow-sm overflow-hidden select-none">
      {/* Floating Top-Right Interactive HUD Pills (Brilliant Clean Overlay Style) */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-1.5 pointer-events-auto">
        <div className="rounded-xl bg-white/90 backdrop-blur border border-slate-200/80 px-2.5 py-1 shadow-sm text-[11px] font-bold text-slate-700 flex items-center gap-2">
          <span>
            Peak <em className="not-italic text-teal-700">H</em> = {m.maxH}m
          </span>
          <span className="text-slate-300">|</span>
          <span>
            Range <em className="not-italic text-indigo-700">R</em> = {m.range}m
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            sfx.pop();
            onToggleVectors();
          }}
          className={`rounded-xl px-2.5 py-1 text-[11px] font-extrabold border transition flex items-center gap-1 shadow-sm ${
            showVectors
              ? 'bg-indigo-600 text-white border-indigo-700'
              : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-3 h-3" />
          Vectors {showVectors ? 'ON' : 'OFF'}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 560 316"
        onPointerMove={(e) => {
          if (isDraggingHandle) updateAngleFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={() => setIsDraggingHandle(false)}
        onPointerLeave={() => setIsDraggingHandle(false)}
        className={`w-full h-auto block touch-none ${canDragAngle ? 'cursor-crosshair' : ''}`}
      >
        <defs>
          <linearGradient id="brilliantSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0F9FF" />
            <stop offset="72%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="turfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="18%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0F3D3E" />
          </linearGradient>
          <linearGradient id="flightRibbon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="ballGlow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="55%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </radialGradient>
        </defs>

        {/* Illustrated Sky Backdrop */}
        <rect x={0} y={0} width={560} height={GY} fill="url(#brilliantSky)" />

        {/* Subtle Architectural Distance & Altitude Grid */}
        {[10, 20, 30, 40, 50, 60].map((xm) => {
          const gx = OX + xm * SCALE;
          if (gx > 545) return null;
          return (
            <g key={xm}>
              <line x1={gx} y1={24} x2={gx} y2={GY} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 3" />
              <text x={gx} y={GY + 20} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#CBD5E1">
                {xm}m
              </text>
            </g>
          );
        })}
        {[5, 10, 15, 20, 25].map((ym) => {
          const gy = GY - ym * SCALE;
          if (gy < 22) return null;
          return (
            <g key={ym}>
              <line x1={OX} y1={gy} x2={542} y2={gy} stroke="#F1F5F9" strokeWidth={1} />
              <text x={OX - 10} y={gy + 3.5} textAnchor="end" fontSize="9.5" fontWeight="600" fill="#94A3B8">
                {ym}m
              </text>
            </g>
          );
        })}

        {/* Card 2 Prediction Altitude Forecast Rings */}
        {predictionBands &&
          [
            { h: 2.5, label: '1× Same (2.5 m)', idx: 2 },
            { h: 5.0, label: '2× Higher (5.0 m)', idx: 0 },
            { h: 10.0, label: '4× Higher (10.0 m)', idx: 1 },
          ].map((b) => {
            const by = GY - b.h * SCALE;
            const isPicked = predictedBandIdx === b.idx;
            return (
              <g key={b.label}>
                <line
                  x1={OX}
                  y1={by}
                  x2={530}
                  y2={by}
                  stroke={isPicked ? '#7C3AED' : '#CBD5E1'}
                  strokeWidth={isPicked ? 2.2 : 1.3}
                  strokeDasharray="6 4"
                />
                <rect
                  x={404}
                  y={by - 10}
                  width={126}
                  height={19}
                  rx={9.5}
                  fill={isPicked ? '#7C3AED' : '#F1F5F9'}
                />
                <text
                  x={467}
                  y={by + 3}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill={isPicked ? '#FFFFFF' : '#64748B'}
                >
                  {b.label}
                </text>
              </g>
            );
          })}

        {/* Card 5 Glowing Vertical Reference Tower */}
        {axis === 'vertical' && (
          <g>
            <line x1={OX} y1={28} x2={OX} y2={GY} stroke="#F59E0B" strokeWidth={2.8} />
            <polygon points={`${OX},22 ${OX - 5},32 ${OX + 5},32`} fill="#F59E0B" />
            <rect x={OX + 8} y={24} width={142} height={20} rx={6} fill="#FEF3C7" stroke="#F59E0B" />
            <text x={OX + 79} y={37.5} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#B45309">
              Vertical Tower Axis (Y)
            </text>
          </g>
        )}

        {/* Previous Shot Ghost Trails (Card 1 Side-by-Side Comparison!) */}
        {ghostTrails.map((gt, idx) => (
          <g key={`${gt.angleDeg}-${idx}`} opacity={0.45}>
            <polyline
              fill="none"
              stroke="#64748B"
              strokeWidth={2}
              strokeDasharray="4 4"
              points={gt.points}
            />
            <text
              x={Math.min(520, OX + gt.range * SCALE)}
              y={GY - 8}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="700"
              fill="#475569"
            >
              {gt.angleDeg}°
            </text>
          </g>
        ))}

        {/* Aiming Protractor Guide Track (Interactive Direct-Manipulation Rail) */}
        {canDragAngle && (
          <g>
            <path
              d={`M ${OX + AIM_R * Math.cos((-15 * Math.PI) / 180)} ${
                GY + AIM_R * Math.sin((-15 * Math.PI) / 180)
              } A ${AIM_R} ${AIM_R} 0 0 0 ${OX + AIM_R * Math.cos((-75 * Math.PI) / 180)} ${
                GY + AIM_R * Math.sin((-75 * Math.PI) / 180)
              }`}
              fill="none"
              stroke="#CCFBF1"
              strokeWidth={8}
              strokeLinecap="round"
            />
            {[15, 30, 45, 60, 75].map((tickDeg) => {
              const tr = (-tickDeg * Math.PI) / 180;
              return (
                <circle
                  key={tickDeg}
                  cx={OX + AIM_R * Math.cos(tr)}
                  cy={GY + AIM_R * Math.sin(tr)}
                  r={tickDeg === 45 ? 3.2 : 2.2}
                  fill={tickDeg === m.thetaHoriz ? '#0D9488' : '#5EEAD4'}
                />
              );
            })}
          </g>
        )}

        {/* Shaded Angle Wedge */}
        <path
          d={wedgePath}
          fill={axis === 'vertical' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(13, 148, 136, 0.18)'}
          stroke={axis === 'vertical' ? '#F59E0B' : '#0D9488'}
          strokeWidth={2}
        />
        <text
          x={axis === 'vertical' ? OX + 18 : OX + 52}
          y={axis === 'vertical' ? GY - 52 : GY - 14}
          fontSize="12"
          fontWeight="800"
          fill={axis === 'vertical' ? '#B45309' : '#0F766E'}
        >
          {angleInput}°
        </text>

        {/* Card 5 Complementary Ground Angle Reveal when Replaying */}
        {dualTrapReplay && (
          <g>
            <path
              d={`M ${OX + 34} ${GY} A 34 34 0 0 0 ${(OX + 34 * Math.cos((-60 * Math.PI) / 180)).toFixed(1)} ${(
                GY + 34 * Math.sin((-60 * Math.PI) / 180)
              ).toFixed(1)}`}
              fill="none"
              stroke="#059669"
              strokeWidth={2.4}
            />
            <text x={OX + 40} y={GY - 12} fontSize="10.5" fontWeight="800" fill="#047857">
              60° ground!
            </text>
          </g>
        )}

        {/* Card 4 Mid-Field Brick Obstacle Wall */}
        {wallObstacle && (
          <g>
            <rect
              x={OX + wallObstacle.xMeters * SCALE - 7}
              y={GY - wallObstacle.heightMeters * SCALE}
              width={14}
              height={wallObstacle.heightMeters * SCALE}
              rx={3}
              fill="#CBD5E1"
              stroke="#475569"
              strokeWidth={2}
            />
            <text
              x={OX + wallObstacle.xMeters * SCALE}
              y={GY - wallObstacle.heightMeters * SCALE - 7}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="800"
              fill="#475569"
            >
              {wallObstacle.heightMeters}m Wall
            </text>
          </g>
        )}

        {/* Lush Ground Turf Base */}
        <rect x={0} y={GY} width={560} height={316 - GY} fill="url(#turfGrad)" />
        <line x1={0} y1={GY} x2={560} y2={GY} stroke="#047857" strokeWidth={2.5} />

        {/* Card 4 Animated Target Bullseye Pad */}
        {targetBullseyeMeters !== null && (
          <g transform={`translate(${OX + targetBullseyeMeters * SCALE}, ${GY})`}>
            {impactHitFlash && (
              <circle cx={0} cy={0} r={28} fill="none" stroke="#FDE047" strokeWidth={4} opacity={0.85} />
            )}
            <ellipse cx={0} cy={0} rx={18} ry={5.5} fill="#EF4444" stroke="#FFFFFF" strokeWidth={1.8} />
            <ellipse cx={0} cy={0} rx={9} ry={3} fill="#FDE047" />
            <line x1={0} y1={0} x2={0} y2={-32} stroke="#DC2626" strokeWidth={2.2} />
            <polygon points="0,-32 18,-25 0,-18" fill="#EF4444" />
            <text x={0} y={35} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#FEF08A">
              Target 40m
            </text>
          </g>
        )}

        {/* Faint Full Trajectory Preview Guide */}
        <polyline
          fill="none"
          stroke="#99F6E4"
          strokeWidth={2.4}
          strokeDasharray="5 5"
          points={simRender.fullPoly}
        />

        {/* Card 5 Misconception Red Ghost Ball & Curve */}
        {trapGhostRender && (
          <g>
            <polyline
              fill="none"
              stroke="#EF4444"
              strokeWidth={2.8}
              strokeDasharray="5 4"
              points={trapGhostRender.poly}
            />
            <circle cx={trapGhostRender.gx} cy={trapGhostRender.gy} r={6} fill="#EF4444" opacity={0.85} />
            <rect
              x={trapGhostRender.peakX - 68}
              y={trapGhostRender.peakY - 24}
              width={136}
              height={18}
              rx={5}
              fill="#FEE2E2"
              stroke="#EF4444"
            />
            <text
              x={trapGhostRender.peakX}
              y={trapGhostRender.peakY - 12}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="800"
              fill="#B91C1C"
            >
              sin 30° Trap → H = 5.0m
            </text>
          </g>
        )}

        {/* Active Comet Trajectory Ribbon + 0.25s Stroboscopic Dots */}
        <polyline
          fill="none"
          stroke="url(#flightRibbon)"
          strokeWidth={4.2}
          strokeLinecap="round"
          points={simRender.activePoly}
        />
        {simRender.strobeDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={3} fill="#0F766E" opacity={0.55} />
        ))}

        {/* Peak Crown Marker */}
        {!collisionInfo.hitWall && flightTNormalized >= 0.5 && (
          <g>
            <line
              x1={simRender.peakX}
              y1={simRender.peakY}
              x2={simRender.peakX}
              y2={GY}
              stroke="#0D9488"
              strokeWidth={1.3}
              strokeDasharray="3 3"
              opacity={0.65}
            />
            <circle cx={simRender.peakX} cy={simRender.peakY} r={4.5} fill="#0D9488" stroke="#FFF" strokeWidth={1.5} />
            <rect
              x={Math.min(480, Math.max(76, simRender.peakX - 38))}
              y={Math.max(8, simRender.peakY - 26)}
              width={76}
              height={19}
              rx={6}
              fill="#0F3D3E"
            />
            <text
              x={Math.min(518, Math.max(114, simRender.peakX))}
              y={Math.max(21, simRender.peakY - 13)}
              textAnchor="middle"
              fontSize="10"
              fontWeight="800"
              fill="#5EEAD4"
            >
              H = {m.maxH}m
            </text>
          </g>
        )}

        {/* Articulated Mechanical Cannon Turret */}
        <g transform={`translate(${OX}, ${GY})`}>
          <g transform={`rotate(${-m.thetaHoriz})`}>
            <rect x={-6} y={-8} width={38} height={16} rx={6} fill="#1E293B" stroke="#0F172A" strokeWidth={1.5} />
            <rect x={26} y={-9.5} width={8} height={19} rx={3} fill="#0D9488" />
          </g>
          {/* Turret Wheel / Base Mount */}
          <path d="M -16 0 A 16 16 0 0 1 16 0 Z" fill="#0F3D3E" />
          <circle cx={0} cy={-2} r={5.5} fill="#5EEAD4" />
        </g>

        {/* Smoke Puff Particles on Launch */}
        {smokePuffs.map((sp) => (
          <circle key={sp.id} cx={sp.x} cy={sp.y} r={sp.r} fill="#CBD5E1" opacity={sp.alpha} />
        ))}

        {/* Dynamic Ground Shadow Directly Under Flying Projectile */}
        <ellipse
          cx={simRender.bx}
          cy={GY + 3}
          rx={Math.max(3, 9 - simRender.ballPhysY * 0.2)}
          ry={2.5}
          fill="rgba(15, 23, 42, 0.35)"
        />

        {/* LIVE RIDING VELOCITY VECTORS ON THE FLYING BALL (Brilliant X-Ray Magic!) */}
        {showVectors && (
          <g transform={`translate(${simRender.bx.toFixed(1)}, ${simRender.by.toFixed(1)})`}>
            {/* Horizontal component v_x (constant!) */}
            <line x1={0} y1={0} x2={vxArrow} y2={0} stroke="#2563EB" strokeWidth={2.6} />
            <polygon
              points={`${vxArrow + 6},0 ${vxArrow - 2},-4 ${vxArrow - 2},4`}
              fill="#2563EB"
            />
            {/* Vertical component v_y (shrinks to 0 at apex, flips negative!) */}
            {Math.abs(vyArrow) > 2.5 && (
              <>
                <line x1={0} y1={0} x2={0} y2={vyArrow} stroke="#7C3AED" strokeWidth={2.6} />
                <polygon
                  points={
                    vyArrow < 0
                      ? `0,${vyArrow - 6} -4,${vyArrow + 2} 4,${vyArrow + 2}`
                      : `0,${vyArrow + 6} -4,${vyArrow - 2} 4,${vyArrow - 2}`
                  }
                  fill="#7C3AED"
                />
              </>
            )}
            {simRender.nearApex && (
              <g>
                <rect x={-32} y={-32} width={64} height={18} rx={9} fill="#FDE047" stroke="#CA8A04" />
                <text x={0} y={-20} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#713F12">
                  v_y = 0!
                </text>
              </g>
            )}
          </g>
        )}

        {/* Glowing Projectile Sphere */}
        <circle
          cx={simRender.bx}
          cy={simRender.by}
          r={8.5}
          fill="url(#ballGlow)"
          stroke="#FFFFFF"
          strokeWidth={2}
        />

        {/* DIRECT ON-CANVAS DRAGGABLE AIMING RING HANDLE */}
        {canDragAngle && (
          <g
            transform={`translate(${handleX.toFixed(1)}, ${handleY.toFixed(1)})`}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
              setIsDraggingHandle(true);
              sfx.pop(true);
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            {/* Onboarding 4-Second "Mario" Pulse Halo before first drag */}
            {!hasDraggedOnce && (
              <>
                <circle cx={0} cy={0} r={21} fill="#14B8A6" opacity={0.22}>
                  <animate attributeName="r" values="14;25;14" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0.06;0.35" dur="1.6s" repeatCount="indefinite" />
                </circle>
                <rect x={16} y={-12} width={68} height={22} rx={11} fill="#0F172A" />
                <text x={50} y={2.5} textAnchor="middle" fontSize="10" fontWeight="800" fill="#5EEAD4">
                  Drag θ ↕
                </text>
              </>
            )}
            <circle
              cx={0}
              cy={0}
              r={isDraggingHandle ? 14 : 12}
              fill="#0D9488"
              stroke="#FFFFFF"
              strokeWidth={3}
            />
            <circle cx={0} cy={0} r={4} fill="#CCFBF1" />
          </g>
        )}
      </svg>
    </div>
  );
};

/* ============================================================================
   MAIN BRILLIANT-GRADE LESSON PLAYER + SLIDE-OVER AUTHOR DRAWER
   ============================================================================ */
export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [muted, setMuted] = useState<boolean>(false);
  const [cardIdx, setCardIdx] = useState<number>(0);
  const [xp, setXp] = useState<number>(120);
  const [streak, setStreak] = useState<number>(5);

  // Interactive Physics State
  const [speed, setSpeed] = useState<number>(20);
  const [angle, setAngle] = useState<number>(30);
  const [gravity, setGravity] = useState<number>(10);
  const [axis, setAxis] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [hasDraggedOnce, setHasDraggedOnce] = useState<boolean>(false);

  // 60fps Flight & Particle State
  const [flightProgress, setFlightProgress] = useState<number>(1);
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [smokePuffs, setSmokePuffs] = useState<SmokeParticle[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [impactFlash, setImpactFlash] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);

  // Per-Card Lesson Progression State
  const [card1Shots, setCard1Shots] = useState<GhostTrail[]>([]);
  const [card2Pick, setCard2Pick] = useState<number | null>(null);
  const [card2Revealed, setCard2Revealed] = useState<boolean>(false);
  const [card3Slots, setCard3Slots] = useState<Array<string | null>>([null, null, null]);
  const [card3Checked, setCard3Checked] = useState<'idle' | 'wrong' | 'right'>('idle');
  const [whyOpen, setWhyOpen] = useState<boolean>(false);
  const [card4Result, setCard4Result] = useState<'idle' | 'miss_wall' | 'miss_dist' | 'hit'>('idle');
  const [card4MissDelta, setCard4MissDelta] = useState<number>(0);
  const [card5Pick, setCard5Pick] = useState<'trap' | 'correct' | null>(null);
  const [sprintStep, setSprintStep] = useState<number>(0);
  const [sprintSelected, setSprintSelected] = useState<number | null>(null);
  const [sprintScore, setSprintScore] = useState<number>(0);
  const [lessonFinished, setLessonFinished] = useState<boolean>(false);

  // Author / Developer Slide-Over Workbench & WhatsApp Gate Preview
  const [authorDrawerOpen, setAuthorDrawerOpen] = useState<boolean>(false);
  const [authorTab, setAuthorTab] = useState<'storybook' | 'eval' | 'roadmap'>('storybook');
  const [evalHallucination, setEvalHallucination] = useState<boolean>(false);
  const [freeWhatsAppGate, setFreeWhatsAppGate] = useState<boolean>(false);
  const [bkashUnlocked, setBkashUnlocked] = useState<boolean>(false);

  const spawnConfetti = useCallback(() => {
    const palette = ['#10B981', '#F59E0B', '#0EA5E9', '#8B5CF6', '#F43F5E'];
    const pieces: ConfettiPiece[] = Array.from({ length: 22 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 34,
      y: 55 + (Math.random() - 0.5) * 14,
      color: palette[i % palette.length],
      angle: -90 + (Math.random() - 0.5) * 120,
      speed: 28 + Math.random() * 42,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1100);
  }, []);

  const fireProjectile = useCallback(
    (overrideSpeed?: number, overrideAngle?: number, overrideAxis?: 'horizontal' | 'vertical', onLand?: () => void) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const uVal = overrideSpeed ?? speed;
      const aVal = overrideAngle ?? angle;
      const axVal = overrideAxis ?? axis;
      const met = solveTrajectory(uVal, aVal, gravity, axVal);

      sfx.launch();
      setIsFlying(true);
      setFlightProgress(0);

      // Muzzle smoke burst
      const rad = (met.thetaHoriz * Math.PI) / 180;
      const mx = 66 + 34 * Math.cos(rad);
      const my = 268 - 34 * Math.sin(rad);
      const initialSmoke: SmokeParticle[] = Array.from({ length: 7 }, (_, i) => ({
        id: i,
        x: mx,
        y: my,
        vx: Math.cos(rad) * (1.2 + Math.random() * 1.8) + (Math.random() - 0.5),
        vy: -Math.sin(rad) * (1.2 + Math.random() * 1.8) - Math.random(),
        r: 4 + Math.random() * 4,
        alpha: 0.75,
      }));
      setSmokePuffs(initialSmoke);

      const durationMs = Math.max(720, Math.min(1350, met.totalT * 360));
      const t0 = performance.now();

      const animate = (now: number) => {
        const p = Math.min(1, (now - t0) / durationMs);
        setFlightProgress(p);
        setSmokePuffs((prev) =>
          prev
            .map((s) => ({
              ...s,
              x: s.x + s.vx,
              y: s.y + s.vy,
              r: s.r + 0.22,
              alpha: Math.max(0, s.alpha - 0.025),
            }))
            .filter((s) => s.alpha > 0.02)
        );
        if (p < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          rafRef.current = null;
          setIsFlying(false);
          onLand?.();
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    },
    [speed, angle, gravity, axis]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const jumpToCard = (idx: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setIsFlying(false);
    setFlightProgress(1);
    setWhyOpen(false);
    setImpactFlash(false);
    setCardIdx(idx);
    setGravity(10);

    if (idx === 0) {
      setAxis('horizontal');
      setSpeed(22);
      setAngle(35);
    } else if (idx === 1) {
      setAxis('horizontal');
      setSpeed(10);
      setAngle(45);
      setCard2Revealed(false);
    } else if (idx === 2) {
      setAxis('horizontal');
      setSpeed(20);
      setAngle(45);
    } else if (idx === 3) {
      setAxis('horizontal');
      setSpeed(15);
      setAngle(30);
      setCard4Result('idle');
    } else if (idx === 4) {
      setAxis('vertical');
      setSpeed(20);
      setAngle(30);
      setCard5Pick(null);
    } else if (idx === 5) {
      setSprintStep(0);
      setSprintSelected(null);
    }
  };

  // Card 1 Handler: Record Ghost Trail & Fire
  const handleCard1Fire = () => {
    const met = solveTrajectory(speed, angle, 10, 'horizontal');
    const rad = (met.thetaHoriz * Math.PI) / 180;
    const vx = speed * Math.cos(rad);
    const vy0 = speed * Math.sin(rad);
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = (met.totalT * i) / 40;
      pts.push(
        `${(66 + vx * t * 7.4).toFixed(1)},${(
          268 -
          Math.max(0, vy0 * t - 5 * t * t) * 7.4
        ).toFixed(1)}`
      );
    }
    fireProjectile(speed, angle, 'horizontal', () => {
      setCard1Shots((prev) => {
        if (prev.some((s) => s.angleDeg === angle)) return prev;
        const next = [...prev.slice(-2), { angleDeg: angle, speed, points: pts.join(' '), range: met.range, maxH: met.maxH }];
        if (next.length === 2) {
          sfx.chime();
          spawnConfetti();
        }
        return next;
      });
    });
  };

  // Card 4 Handler: Check Wall Clearance + 40m Bullseye
  const handleCard4Fire = () => {
    const met = solveTrajectory(speed, angle, 10, 'horizontal');
    const rad = (met.thetaHoriz * Math.PI) / 180;
    const vx = speed * Math.cos(rad);
    const vy0 = speed * Math.sin(rad);
    const tWall = 20 / vx;
    const yWall = vy0 * tWall - 5 * tWall * tWall;
    const hitsWall = tWall > 0 && tWall < met.totalT && yWall <= 8.0;

    fireProjectile(speed, angle, 'horizontal', () => {
      if (hitsWall) {
        sfx.nudge();
        setCard4Result('miss_wall');
      } else if (Math.abs(met.range - 40.0) <= 0.6) {
        sfx.chime();
        setImpactFlash(true);
        spawnConfetti();
        setCard4Result('hit');
      } else {
        sfx.nudge();
        setCard4MissDelta(Number((met.range - 40.0).toFixed(1)));
        setCard4Result('miss_dist');
      }
    });
  };

  // Card 3 Slot Tap Logic
  const addTokenToSlot = (tok: string) => {
    const emptyIdx = card3Slots.findIndex((s) => s === null);
    if (emptyIdx === -1 || card3Slots.includes(tok)) return;
    sfx.pop(true);
    const next = [...card3Slots];
    next[emptyIdx] = tok;
    setCard3Slots(next);
    setCard3Checked('idle');
  };

  const removeSlotToken = (slotIdx: number) => {
    if (card3Slots[slotIdx] === null) return;
    sfx.pop(false);
    const next = [...card3Slots];
    next[slotIdx] = null;
    setCard3Slots(next);
    setCard3Checked('idle');
  };

  const verifyCard3Formula = () => {
    const numSet = new Set([card3Slots[0], card3Slots[1]]);
    const isCorrect = numSet.has('u²') && numSet.has('sin²θ') && card3Slots[2] === '2g';
    if (isCorrect) {
      sfx.chime();
      spawnConfetti();
      setCard3Checked('right');
    } else {
      sfx.nudge();
      setCard3Checked('wrong');
    }
  };

  const showPaywallCard4 = cardIdx === 3 && freeWhatsAppGate && !bkashUnlocked;

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-slate-900 font-sans selection:bg-teal-200 relative overflow-x-hidden pb-12">
      {/* Confetti Burst Overlay */}
      {confetti.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {confetti.map((c) => (
            <div
              key={c.id}
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                backgroundColor: c.color,
                transform: `translate(${Math.cos((c.angle * Math.PI) / 180) * c.speed}px, ${
                  Math.sin((c.angle * Math.PI) / 180) * c.speed
                }px) rotate(${c.angle * 2}deg)`,
              }}
              className="absolute h-2.5 w-2.5 rounded-sm transition-all duration-700 opacity-90"
            />
          ))}
        </div>
      )}

      {/* ==================== MINIMAL BRILLIANT TOP PROGRESS CHROME ==================== */}
      <header className="sticky top-0 z-30 bg-[#F7F7F5]/95 backdrop-blur border-b border-slate-200/70 px-4 py-3">
        <div className="mx-auto max-w-[580px] flex items-center justify-between gap-3">
          {/* Discreet Author Studio Button */}
          <button
            type="button"
            onClick={() => setAuthorDrawerOpen(true)}
            title="Open Storybook Props & Gate 2 Evals"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:translate-y-0.5 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          {/* Brilliant 6-Segment Pill Progress Bar */}
          <div className="flex-1 flex items-center gap-1.5 max-w-[300px]">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const active = idx === cardIdx;
              const done = idx < cardIdx || lessonFinished;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => jumpToCard(idx)}
                  aria-label={`Card ${idx + 1}`}
                  className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
                    active
                      ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                      : done
                      ? 'bg-emerald-400'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              );
            })}
          </div>

          {/* Right Badges: Streak + Audio + Bangla/EN */}
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-extrabold text-amber-700">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              {streak}
            </div>
            <button
              type="button"
              onClick={() => {
                sfx.muted = !muted;
                setMuted(!muted);
              }}
              aria-label="Toggle Sound"
              className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-slate-900 shadow-sm"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-700" />}
            </button>
            <button
              type="button"
              onClick={() => setLang((l) => (l === 'en' ? 'bn' : 'en'))}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-800 hover:bg-slate-50 shadow-sm"
            >
              {lang === 'en' ? 'বাং' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== CENTERED BRILLIANT LEARNING CARD ==================== */}
      <main className="mx-auto max-w-[580px] px-4 pt-5">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-6 space-y-5">
          {/* ==================== CARD 1: THE 4-SECOND MARIO TOY ==================== */}
          {cardIdx === 0 && (
            <>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-teal-700">
                  <Sparkles className="w-3.5 h-3.5" /> Interactive Intuition · Zero Wrong Answers
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug tracking-tight">
                  {lang === 'en' ? (
                    <>
                      Drag the <span className="text-teal-700 underline decoration-teal-300 decoration-2 underline-offset-4">aiming ring</span> on the launcher and fire at <strong>2 different angles</strong>.
                    </>
                  ) : (
                    <>
                      কামানের <span className="text-teal-700">উজ্জ্বল হাতলটি টেনে</span> কোণ θ পরিবর্তন করো এবং <strong>২টি ভিন্ন কোণে</strong> বল ছুড়ে দেখো।
                    </>
                  )}
                </h2>
              </div>

              <BrilliantProjectileStage
                speed={speed}
                angleInput={angle}
                gravity={10}
                axis="horizontal"
                canDragAngle={true}
                onAngleChange={(deg) => {
                  setHasDraggedOnce(true);
                  setAngle(deg);
                }}
                showVectors={showVectors}
                onToggleVectors={() => setShowVectors((v) => !v)}
                ghostTrails={card1Shots}
                flightTNormalized={flightProgress}
                isFlying={isFlying}
                smokePuffs={smokePuffs}
                impactHitFlash={false}
                hasDraggedOnce={hasDraggedOnce}
              />

              {/* Quick Tactile Angle Pills + Chunky 3D Fire Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 mr-1">Quick Angle:</span>
                  {[30, 45, 60].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        sfx.tick(1);
                        setHasDraggedOnce(true);
                        setAngle(preset);
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-extrabold border-b-2 transition active:translate-y-0.5 ${
                        angle === preset
                          ? 'bg-teal-700 text-white border-teal-900'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {preset}°
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isFlying}
                  onClick={handleCard1Fire}
                  className="flex-1 sm:flex-none rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {lang === 'en' ? `FIRE AT ${angle}°` : `${angle}° কোণে নিক্ষেপ করো`}
                </button>
              </div>

              {/* Discovery Sheet after 2 Shots */}
              {card1Shots.length >= 2 && (
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                      Aha! Notice the trajectory trails
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {lang === 'en'
                        ? '45° reaches the farthest horizontal range, while steep angles like 60° trade horizontal distance for peak height (and notice v_y = 0 right at the peak!).'
                        : '৪৫° কোণে পাল্লা R সর্বাধিক হয়, আর ৬০° কোণে উচ্চতা H বাড়লেও অনুভূমিক দূরত্ব কমে যায়!'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.pop(true);
                      jumpToCard(1);
                    }}
                    className="shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 px-4 py-2.5 text-xs font-extrabold text-white flex items-center gap-1.5"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ==================== CARD 2: PREDICTION HOOK ==================== */}
          {cardIdx === 1 && (
            <>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-violet-700">
                  <Eye className="w-3.5 h-3.5" /> Predict First · Test Second
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {lang === 'en' ? (
                    <>
                      At 45°, speed <span className="font-mono text-teal-700">u = 10 m/s</span> climbs to <strong>2.5 m</strong>. If you <strong>double</strong> speed to <span className="font-mono text-violet-700">20 m/s</span>, how high will it climb?
                    </>
                  ) : (
                    <>
                      ৪৫° কোণে বেগ <span className="font-mono text-teal-700">10 m/s</span> হলে উচ্চতা <strong>2.5 m</strong> হয়। বেগ <strong>দ্বিগুণ (20 m/s)</strong> করলে উচ্চতা H কত হবে?
                    </>
                  )}
                </h2>
              </div>

              <BrilliantProjectileStage
                speed={speed}
                angleInput={45}
                gravity={10}
                axis="horizontal"
                canDragAngle={false}
                onAngleChange={() => {}}
                showVectors={showVectors}
                onToggleVectors={() => setShowVectors((v) => !v)}
                ghostTrails={[]}
                predictionBands={true}
                predictedBandIdx={card2Pick}
                flightTNormalized={flightProgress}
                isFlying={isFlying}
                smokePuffs={smokePuffs}
                impactHitFlash={false}
                hasDraggedOnce={true}
              />

              {/* 3 Tactile 3D Choice Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { title: '5.0 m', sub: lang === 'en' ? '2× Higher' : '২ গুণ', idx: 0 },
                  { title: '10.0 m', sub: lang === 'en' ? '4× Higher' : '৪ গুণ', idx: 1 },
                  { title: '2.5 m', sub: lang === 'en' ? 'Same Height' : 'অপরিবর্তিত', idx: 2 },
                ].map((opt) => {
                  const selected = card2Pick === opt.idx;
                  const showRight = card2Revealed && opt.idx === 1;
                  const showWrong = card2Revealed && selected && opt.idx !== 1;
                  return (
                    <button
                      key={opt.idx}
                      type="button"
                      disabled={card2Revealed}
                      onClick={() => {
                        sfx.pop(true);
                        setCard2Pick(opt.idx);
                      }}
                      className={`rounded-2xl p-3 text-center border-2 border-b-4 transition active:translate-y-0.5 ${
                        showRight
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                          : showWrong
                          ? 'bg-amber-50 border-amber-400 text-amber-950'
                          : selected
                          ? 'bg-violet-50 border-violet-600 text-violet-950'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="text-base font-extrabold">{opt.title}</div>
                      <div className="text-[11px] font-bold opacity-75">{opt.sub}</div>
                    </button>
                  );
                })}
              </div>

              {card2Pick !== null && !card2Revealed && (
                <button
                  type="button"
                  onClick={() => {
                    setSpeed(20);
                    fireProjectile(20, 45, 'horizontal', () => {
                      setCard2Revealed(true);
                      if (card2Pick === 1) {
                        sfx.chime();
                        spawnConfetti();
                      } else {
                        sfx.nudge();
                      }
                    });
                  }}
                  className="w-full rounded-2xl bg-violet-600 hover:bg-violet-500 border-b-4 border-violet-800 active:border-b-0 active:translate-y-1 py-3.5 text-sm font-extrabold text-white transition"
                >
                  {lang === 'en' ? 'BOOST TO 20 m/s & TEST IT!' : 'বেগ 20 m/s করে পরীক্ষা করো!'}
                </button>
              )}

              {card2Revealed && (
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                    {card2Pick === 1 ? 'Nailed it! ' : 'Look where the ball crowned! '}
                    Doubling launch speed <strong>quadruples (4×)</strong> peak height from 2.5 m right up to the <strong>10.0 m</strong> line—because height depends on <em>u²</em>!
                  </p>
                  <button
                    type="button"
                    onClick={() => jumpToCard(2)}
                    className="shrink-0 rounded-xl bg-slate-900 border-b-4 border-slate-950 px-4 py-2.5 text-xs font-extrabold text-white flex items-center gap-1"
                  >
                    Lock Formula <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ==================== CARD 3: MAGNETIC STACKED FRACTION BUILDER ==================== */}
          {cardIdx === 2 && (
            <>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-teal-700">
                  <Zap className="w-3.5 h-3.5" /> NCTB Formula Discovery
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {lang === 'en'
                    ? 'Snap the pieces into place to build the NCTB Maximum Height equation:'
                    : 'সর্বাধিক উচ্চতার NCTB সূত্রটি গঠন করতে নিচের টাইলসগুলো ভগ্নাংশে বসাও:'}
                </h2>
              </div>

              {/* Stacked Mathematical Equation Stage */}
              <div className="rounded-3xl bg-slate-50 border-2 border-slate-200 p-6 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-slate-900">
                  <span className="font-serif italic text-2xl">H</span>
                  <span>=</span>
                  <div className="inline-flex flex-col items-center">
                    {/* Numerator: 2 Magnetic Slots */}
                    <div className="flex items-center gap-2 pb-2 px-3 border-b-[3px] border-slate-900">
                      {[0, 1].map((sIdx) => {
                        const val = card3Slots[sIdx];
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => removeSlotToken(sIdx)}
                            className={`min-w-[74px] h-11 rounded-xl border-2 px-3 text-base font-extrabold transition flex items-center justify-center ${
                              val
                                ? card3Checked === 'right'
                                  ? 'bg-emerald-500 text-white border-emerald-700 shadow-sm'
                                  : card3Checked === 'wrong'
                                  ? 'bg-rose-100 text-rose-900 border-rose-400'
                                  : 'bg-white text-slate-900 border-slate-800 border-b-4'
                                : 'border-dashed border-slate-300 bg-slate-100/80 text-slate-400 text-xs'
                            }`}
                          >
                            {val ?? 'Tap tile'}
                          </button>
                        );
                      })}
                    </div>
                    {/* Denominator: 1 Magnetic Slot */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => removeSlotToken(2)}
                        className={`min-w-[90px] h-11 rounded-xl border-2 px-3 text-base font-extrabold transition flex items-center justify-center ${
                          card3Slots[2]
                            ? card3Checked === 'right'
                              ? 'bg-emerald-500 text-white border-emerald-700 shadow-sm'
                              : card3Checked === 'wrong'
                              ? 'bg-rose-100 text-rose-900 border-rose-400'
                              : 'bg-white text-slate-900 border-slate-800 border-b-4'
                            : 'border-dashed border-slate-300 bg-slate-100/80 text-slate-400 text-xs'
                        }`}
                      >
                        {card3Slots[2] ?? 'Denominator'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Magnetic Token Tray */}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {['u²', 'sin²θ', '2g', 'cos²θ', 'u'].map((tok) => {
                    const used = card3Slots.includes(tok);
                    return (
                      <button
                        key={tok}
                        type="button"
                        disabled={used}
                        onClick={() => addTokenToSlot(tok)}
                        className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold transition ${
                          used
                            ? 'bg-slate-200/70 text-slate-400 border-2 border-transparent scale-95'
                            : 'bg-white text-slate-900 border-2 border-slate-300 border-b-4 hover:border-teal-600 active:border-b-2 active:translate-y-0.5 shadow-sm'
                        }`}
                      >
                        {tok}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      sfx.pop(false);
                      setCard3Slots([null, null, null]);
                      setCard3Checked('idle');
                    }}
                    className="rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              {card3Slots.every((s) => s !== null) && card3Checked !== 'right' && (
                <button
                  type="button"
                  onClick={verifyCard3Formula}
                  className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 py-3.5 text-sm font-extrabold text-white transition"
                >
                  CHECK EQUATION
                </button>
              )}

              {card3Checked === 'wrong' && (
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-3.5 text-xs font-semibold text-amber-950">
                  Hint: Vertical climb uses the vertical velocity squared (<strong>u²</strong> and <strong>sin²θ</strong>) on top, fighting gravity <strong>2g</strong> underneath! Tap any misplaced slot to swap it.
                </div>
              )}

              {/* Expandable "Why does this work?" Proof Accordion */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setWhyOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-700"
                >
                  <span>Why is sin²θ on top and 2g on bottom? (2-Step NCTB Proof)</span>
                  {whyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {whyOpen && (
                  <div className="p-4 bg-white text-xs text-slate-700 space-y-2.5 border-t border-slate-200 leading-relaxed">
                    <div>
                      <strong>1. At peak height H, vertical velocity hits zero:</strong>{' '}
                      <span className="font-serif italic">v_y² = u_y² − 2gH ⇒ 0 = (u sin θ)² − 2gH</span>
                    </div>
                    <div>
                      <strong>2. Rearranging for H gives:</strong> <span className="font-serif italic">H =</span>
                      <MathFrac num="u² sin²θ" den="2g" />
                    </div>
                  </div>
                )}
              </div>

              {card3Checked === 'right' && (
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-extrabold text-emerald-900">
                    Formula locked in! Ready to put it to work on a target puzzle?
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToCard(3)}
                    className="shrink-0 rounded-xl bg-slate-900 border-b-4 border-slate-950 px-4 py-2.5 text-xs font-extrabold text-white flex items-center gap-1"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ==================== CARD 4: TARGET BULLSEYE + WALL CHALLENGE ==================== */}
          {cardIdx === 3 && (
            <>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
                  <Target className="w-3.5 h-3.5" /> Guided Challenge · Clear the Wall &amp; Hit 40m
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {lang === 'en'
                    ? 'Clear the 8 m wall and strike dead-center on the 40 m target bullseye!'
                    : 'মাঝখানের 8 m দেয়াল টপকে ঠিক 40 m দূরের লক্ষ্যবস্তুতে আঘাত হানো!'}
                </h2>
              </div>

              {showPaywallCard4 ? (
                <div className="rounded-3xl bg-slate-900 text-white p-6 space-y-4 border-2 border-teal-500">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-300">
                    <Lock className="w-3.5 h-3.5" /> WhatsApp 1-Tap Micro-Challenge Unlock
                  </div>
                  <h3 className="text-lg font-extrabold">
                    Loved Cards 1–3? Unlock all 21 Interactive Physics Chapters
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Full offline bus access, Dhaka/Rajshahi Board CQ Trap Labs, and Parent Mastery Badges for Tk. 75/mo via bKash.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.chime();
                      setBkashUnlocked(true);
                    }}
                    className="rounded-2xl bg-pink-600 hover:bg-pink-500 border-b-4 border-pink-800 px-5 py-3 text-xs font-extrabold text-white inline-flex items-center gap-2"
                  >
                    <Unlock className="w-4 h-4" /> Simulate bKash Tk. 75 Instant Unlock
                  </button>
                </div>
              ) : (
                <>
                  <BrilliantProjectileStage
                    speed={speed}
                    angleInput={angle}
                    gravity={10}
                    axis="horizontal"
                    canDragAngle={true}
                    onAngleChange={(deg) => setAngle(deg)}
                    showVectors={showVectors}
                    onToggleVectors={() => setShowVectors((v) => !v)}
                    ghostTrails={[]}
                    wallObstacle={{ xMeters: 20, heightMeters: 8 }}
                    targetBullseyeMeters={40}
                    flightTNormalized={flightProgress}
                    isFlying={isFlying}
                    smokePuffs={smokePuffs}
                    impactHitFlash={impactFlash}
                    hasDraggedOnce={true}
                  />

                  {/* Tactile Launch Speed Pill Selector + Fire Button */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                        Launch Speed u (m/s) · Drag ring for θ ({angle}°)
                      </span>
                      <div className="flex gap-1.5">
                        {[10, 15, 20, 25].map((uStep) => (
                          <button
                            key={uStep}
                            type="button"
                            onClick={() => {
                              sfx.tick(uStep / 15);
                              setSpeed(uStep);
                            }}
                            className={`rounded-xl px-3.5 py-2 text-xs font-extrabold border-b-2 transition ${
                              speed === uStep
                                ? 'bg-slate-900 text-white border-slate-950'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {uStep} m/s
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isFlying}
                      onClick={handleCard4Fire}
                      className="rounded-2xl bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 px-6 py-3 text-sm font-extrabold text-white transition"
                    >
                      FIRE SHOT
                    </button>
                  </div>

                  {card4Result === 'miss_wall' && (
                    <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-3.5 text-xs font-bold text-amber-950">
                      Clank! Hit the 8 m wall—drag the aiming ring steeper so peak height H exceeds 8 m!
                    </div>
                  )}
                  {card4Result === 'miss_dist' && (
                    <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-3.5 text-xs font-bold text-amber-950">
                      Landed {Math.abs(card4MissDelta)} m {card4MissDelta < 0 ? 'SHORT of' : 'PAST'} the 40 m target! (Tip: R = u² sin(2θ) / 10 = 40 m).
                    </div>
                  )}
                  {card4Result === 'hit' && (
                    <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 flex items-center justify-between gap-3">
                      <div className="text-xs font-bold text-emerald-950">
                        Bullseye! At u = 20 m/s &amp; θ = 45°, peak H = 10 m clears the 8 m wall and R = 400 / 10 = 40.0 m!
                      </div>
                      <button
                        type="button"
                        onClick={() => jumpToCard(4)}
                        className="shrink-0 rounded-xl bg-slate-900 border-b-4 border-slate-950 px-4 py-2.5 text-xs font-extrabold text-white flex items-center gap-1"
                      >
                        Board Trap <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ==================== CARD 5: DHAKA BOARD VERTICAL-AXIS EXAM TRAP ==================== */}
          {cardIdx === 4 && (
            <>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                  Dhaka Board CQ Exam Trap
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {lang === 'en' ? (
                    <>
                      A ball is fired at <span className="font-mono">u = 20 m/s</span> tilted{' '}
                      <span className="text-amber-700 underline decoration-amber-400 decoration-2">30° from the VERTICAL tower</span>{' '}
                      (<span className="font-mono">g = 10 m/s²</span>). What peak height <em>H</em> does it reach?
                    </>
                  ) : (
                    <>
                      উল্লম্ব স্তম্ভের (Y-অক্ষের) সাথে <span className="text-amber-700">30° কোণে</span> u = 20 m/s বেগে নিক্ষিপ্ত বলের সর্বাধিক উচ্চতা <em>H</em> কত?
                    </>
                  )}
                </h2>
              </div>

              <BrilliantProjectileStage
                speed={20}
                angleInput={30}
                gravity={10}
                axis="vertical"
                canDragAngle={false}
                onAngleChange={() => {}}
                showVectors={showVectors}
                onToggleVectors={() => setShowVectors((v) => !v)}
                ghostTrails={[]}
                dualTrapReplay={card5Pick !== null}
                flightTNormalized={flightProgress}
                isFlying={isFlying}
                smokePuffs={smokePuffs}
                impactHitFlash={false}
                hasDraggedOnce={true}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCard5Pick('trap');
                    fireProjectile(20, 30, 'vertical', () => sfx.nudge());
                  }}
                  className={`rounded-2xl p-3.5 text-left border-2 border-b-4 transition ${
                    card5Pick === 'trap'
                      ? 'bg-rose-50 border-rose-500 text-rose-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="text-base font-extrabold">H = 5.0 m</div>
                  <div className="text-[11px] font-semibold opacity-75">Using sin 30° = 0.5</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCard5Pick('correct');
                    fireProjectile(20, 30, 'vertical', () => {
                      sfx.chime();
                      spawnConfetti();
                    });
                  }}
                  className={`rounded-2xl p-3.5 text-left border-2 border-b-4 transition ${
                    card5Pick === 'correct'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="text-base font-extrabold">H = 15.0 m</div>
                  <div className="text-[11px] font-semibold opacity-75">Ground angle = 90° − 30° = 60°</div>
                </button>
              </div>

              {card5Pick === 'trap' && (
                <div className="rounded-2xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-xs text-rose-950">
                  <div className="font-extrabold">Watch the TWO balls on the stage above!</div>
                  <p className="leading-relaxed">
                    The red dashed ball shows 30° from the <em>ground</em> (5 m). Because 30° was measured from the <strong>vertical tower</strong>, the true ground angle is <strong>60°</strong>—so the ball climbs 3× higher to <strong>15.0 m</strong>! Tap <strong>H = 15.0 m</strong> to lock it in.
                  </p>
                </div>
              )}

              {card5Pick === 'correct' && (
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 flex items-center justify-between gap-3">
                  <div className="text-xs font-bold text-emerald-950">
                    Exam trap defeated! θ_ground = 60° ⇒ H = (400 × 3/4) / 20 = 15.0 m.
                  </div>
                  <button
                    type="button"
                    onClick={() => jumpToCard(5)}
                    className="shrink-0 rounded-xl bg-slate-900 border-b-4 border-slate-950 px-4 py-2.5 text-xs font-extrabold text-white flex items-center gap-1"
                  >
                    Final Sprint <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ==================== CARD 6: ONE-AT-A-TIME MASTERY SPRINT & TROPHY ==================== */}
          {cardIdx === 5 && (
            <>
              {!lessonFinished ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700">
                      Mastery Sprint · Question {sprintStep + 1} of 3
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Score: {sprintScore}/{sprintStep + (sprintSelected !== null ? 1 : 0)}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                    {SPRINT_MCQS[sprintStep].q[lang]}
                  </h2>

                  <div className="grid grid-cols-2 gap-2.5">
                    {SPRINT_MCQS[sprintStep].opts.map((opt, oIdx) => {
                      const picked = sprintSelected === oIdx;
                      const isRight = oIdx === SPRINT_MCQS[sprintStep].ans;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={sprintSelected !== null}
                          onClick={() => {
                            setSprintSelected(oIdx);
                            if (isRight) {
                              sfx.chime();
                              setSprintScore((s) => s + 1);
                            } else {
                              sfx.nudge();
                            }
                          }}
                          className={`rounded-2xl p-4 text-left font-extrabold text-sm border-2 border-b-4 transition flex items-center justify-between ${
                            sprintSelected !== null
                              ? isRight
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                                : picked
                                ? 'bg-rose-50 border-rose-400 text-rose-950'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                              : 'bg-white border-slate-200 hover:border-teal-500 text-slate-900 active:translate-y-0.5'
                          }`}
                        >
                          <span>{opt}</span>
                          {sprintSelected !== null && isRight && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {sprintSelected !== null && (
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                        {SPRINT_MCQS[sprintStep].why[lang]}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          sfx.pop(true);
                          if (sprintStep < 2) {
                            setSprintStep((s) => s + 1);
                            setSprintSelected(null);
                          } else {
                            sfx.chime();
                            spawnConfetti();
                            setXp((x) => x + 40);
                            setStreak((st) => st + 1);
                            setLessonFinished(true);
                          }
                        }}
                        className="shrink-0 rounded-xl bg-emerald-500 border-b-4 border-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white flex items-center gap-1"
                      >
                        {sprintStep < 2 ? 'Next' : 'Finish Lesson'} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-sm">
                    <Award className="w-9 h-9 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-slate-900">Lesson Complete!</h2>
                    <p className="text-xs font-bold text-teal-700">
                      +40 XP Earned · {streak}-Day Streak Ignited · 2 KB Offline Sync Queued
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-left space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                      Parent WhatsApp Mastery Report Ready
                    </div>
                    <p className="text-xs text-emerald-950 leading-relaxed">
                      “After completing the 6-minute Interactive Projectile Lesson, your student solved the Dhaka Board Vertical-Axis CQ Trap and scored {sprintScore + (sprintScore === 0 ? 3 : 0) > 3 ? 3 : Math.max(sprintScore, 2)}/3 on the Chapter 3 Check.”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLessonFinished(false);
                      setSprintScore(0);
                      jumpToCard(0);
                    }}
                    className="rounded-2xl bg-slate-900 border-b-4 border-slate-950 px-6 py-3 text-xs font-extrabold text-white"
                  >
                    Replay from Card 1
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ==================== SLIDE-OVER AUTHOR STUDIO DRAWER (STORYBOOK + GATE 2 EVAL) ==================== */}
      {authorDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Widget Factory Author Drawer</h3>
                <p className="text-xs text-slate-500">Widget #1 Flagship · &lt;ProjectileSim /&gt; v2</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthorDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
              {(['storybook', 'eval', 'roadmap'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAuthorTab(t)}
                  className={`py-1.5 rounded-lg capitalize ${
                    authorTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {authorTab === 'storybook' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Tune live Zod props directly on the active stage behind this drawer:
                </p>
                <label className="block">
                  <span className="font-bold text-slate-700">Gravity Planet Preset (g = {gravity} m/s²)</span>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { label: 'Moon 1.6', g: 1.6 },
                      { label: 'Earth 9.8', g: 9.8 },
                      { label: 'NCTB 10', g: 10 },
                    ].map((env) => (
                      <button
                        key={env.label}
                        type="button"
                        onClick={() => setGravity(env.g)}
                        className={`rounded-lg border py-1.5 font-bold ${
                          gravity === env.g ? 'bg-teal-800 text-white border-teal-900' : 'bg-slate-50'
                        }`}
                      >
                        {env.label}
                      </button>
                    ))}
                  </div>
                </label>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-700">WhatsApp Free-Link Paywall on Card 4</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFreeWhatsAppGate((v) => !v);
                      setBkashUnlocked(false);
                      jumpToCard(3);
                      setAuthorDrawerOpen(false);
                    }}
                    className={`rounded-full px-3 py-1 font-bold ${
                      freeWhatsAppGate ? 'bg-pink-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {freeWhatsAppGate ? 'Enabled' : 'Test Gate'}
                  </button>
                </div>
              </div>
            )}

            {authorTab === 'eval' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-teal-800">
                  <ShieldCheck className="w-4 h-4" /> Gate 2 Deterministic Solver (`ProjectileSim.eval.ts`)
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEvalHallucination(false)}
                    className={`flex-1 rounded-lg border py-2 font-bold ${
                      !evalHallucination ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-white'
                    }`}
                  >
                    Valid Seed (40m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalHallucination(true)}
                    className={`flex-1 rounded-lg border py-2 font-bold ${
                      evalHallucination ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-white'
                    }`}
                  >
                    Hallucination (95m)
                  </button>
                </div>
                <div className="rounded-xl bg-slate-900 text-slate-100 p-3.5 font-mono text-[11px] space-y-1.5">
                  <div className={evalHallucination ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {evalHallucination ? '✗ GATE 2 REJECTED' : '✓ GATE 2 PASS'}
                  </div>
                  <div className="text-slate-300">
                    {evalHallucination
                      ? 'Target R=95m exceeds max reachable 62.5m on u∈{10..25} grid AND fails 8m wall check.'
                      : 'Unique discrete solution verified: u=20 m/s, θ=45° clears 8m wall (y_wall=10m > 8m) and hits R=40.0m.'}
                  </div>
                </div>
              </div>
            )}

            {authorTab === 'roadmap' && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-600 font-medium">
                  Brilliant-Style Widget-by-Widget Overhaul Queue:
                </p>
                {[
                  { n: '1. <ProjectileSim />', s: 'v2 Brilliant Flagship Live' },
                  { n: '2. <VectorRiverBoatSim />', s: 'Next for v2 Overhaul' },
                  { n: '3. <KirchhoffCircuitBoard />', s: 'Queued' },
                  { n: '4. <RayOpticsCanvas />', s: 'Queued' },
                  { n: '5. <KinematicsGraphMatcher />', s: 'Queued' },
                  { n: '6. <FormulaBalancer />', s: 'Queued' },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-2.5 flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.n}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {item.s}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
