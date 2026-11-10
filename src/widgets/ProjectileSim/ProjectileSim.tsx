import React, { useState, useRef, useEffect } from 'react';
import { ProjectileCardPropsSchema, ProjectileCardProps } from './ProjectileSim.schema';
import { computeProjectileMetrics } from './ProjectileSim.eval';
import { sfx } from '../../engine/audio';

export const ProjectileSim: React.FC<Partial<ProjectileCardProps>> = (rawProps) => {
  const props = ProjectileCardPropsSchema.parse(rawProps);
  const [angle, setAngle] = useState(props.initialAngle);
  const [speed, setSpeed] = useState(props.initialSpeed);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const [showVectors, setShowVectors] = useState(props.showVectorComponents);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const metrics = computeProjectileMetrics(speed, angle, props.gravity, props.angleAxis);

  const handlePointerDown = (e: React.PointerEvent<SVGCircleElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const originX = rect.left + 50;
    const originY = rect.bottom - 50;
    const dx = e.clientX - originX;
    const dy = originY - e.clientY;
    let rad = Math.atan2(dy, dx);
    let deg = (rad * 180) / Math.PI;
    if (props.angleAxis === 'vertical') deg = 90 - deg;
    deg = Math.max(props.angleBounds[0], Math.min(props.angleBounds[1], deg));
    const snapped = Math.round(deg / 5) * 5;
    if (snapped !== angle) {
      setAngle(snapped);
      sfx.tick();
    }
  };

  const launch = () => {
    setIsAnimating(true);
    setAnimProgress(0);
    sfx.launch();
  };

  useEffect(() => {
    if (!isAnimating) return;
    let frameId: number;
    const startTime = performance.now();
    const duration = metrics.flightTime * 1000;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress);
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        sfx.chime();
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isAnimating, metrics.flightTime]);

  const currentT = animProgress * metrics.flightTime;
  const currentX = metrics.v0x * currentT;
  const currentY = metrics.v0y * currentT - 0.5 * props.gravity * currentT * currentT;
  const currentVy = metrics.v0y - props.gravity * currentT;

  return (
    <div className="relative w-full max-w-4xl p-6 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-cyan-400">
          ProjectileSim v2 Brilliant Flagship
        </h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">
            Peak H: {metrics.peakHeight.toFixed(1)}m
          </span>
          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">
            Range R: {metrics.range.toFixed(1)}m
          </span>
          <button
            onClick={() => setShowVectors(!showVectors)}
            className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full text-xs font-semibold hover:bg-cyan-900 transition"
          >
            Vectors: {showVectors ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="relative w-full h-80 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 400">
          <line x1="50" y1="350" x2="750" y2="350" stroke="#334155" strokeWidth="2" />
          <line x1="50" y1="50" x2="50" y2="350" stroke="#334155" strokeWidth="2" />

          {/* Aiming Arc & Pointer Handle */}
          <circle
            cx={50 + 100 * Math.cos(metrics.thetaRad)}
            cy={350 - 100 * Math.sin(metrics.thetaRad)}
            r="12"
            fill="#06b6d4"
            className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          />

          {/* Halo Indicator */}
          <circle
            cx={50 + 100 * Math.cos(metrics.thetaRad)}
            cy={350 - 100 * Math.sin(metrics.thetaRad)}
            r="20"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-spin"
          />

          {/* Trajectory Curve */}
          <path
            d={`M 50 350 Q ${50 + (metrics.range * 4) / 2} ${350 - metrics.peakHeight * 8} ${50 + metrics.range * 4} 350`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Live Animated Ball */}
          <circle
            cx={50 + currentX * 4}
            cy={350 - Math.max(0, currentY) * 4}
            r="8"
            fill="#f43f5e"
          />

          {/* Vector Arrows */}
          {showVectors && (
            <g>
              <line
                x1={50 + currentX * 4}
                y1={350 - Math.max(0, currentY) * 4}
                x2={50 + currentX * 4 + metrics.v0x * 2}
                y2={350 - Math.max(0, currentY) * 4}
                stroke="#10b981"
                strokeWidth="2"
              />
              <line
                x1={50 + currentX * 4}
                y1={350 - Math.max(0, currentY) * 4}
                x2={50 + currentX * 4}
                y2={350 - Math.max(0, currentY) * 4 - currentVy * 2}
                stroke="#eab308"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Peak v_y = 0 spark */}
          {Math.abs(currentVy) < 0.5 && isAnimating && (
            <text x={50 + currentX * 4} y={350 - currentY * 4 - 15} fill="#facc15" fontSize="12" fontWeight="bold">
              v_y = 0!
            </text>
          )}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-slate-300">Angle θ: {angle}°</label>
          <input
            type="range"
            min={props.angleBounds[0]}
            max={props.angleBounds[1]}
            step="5"
            value={angle}
            onChange={(e) => {
              setAngle(Number(e.target.value));
              sfx.tick();
            }}
            className="accent-cyan-500"
          />
        </div>
        <button
          onClick={launch}
          disabled={isAnimating}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg transition"
        >
          {isAnimating ? 'Firing...' : 'Launch Projectile'}
        </button>
      </div>
    </div>
  );
};

export default ProjectileSim;
