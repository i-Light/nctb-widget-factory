'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/engine/audio';
import type { KinematicsGraphProps } from './KinematicsGraphMatcher.schema';
import { computePiecewiseKinematics, isGoalHit, type VNodes } from './KinematicsGraphMatcher.eval';
import { KinematicsStageSvg, KSTAGE, type NodeKey } from './KinematicsStageSvg';
import { KinematicsControlsBar } from './KinematicsControlsBar';

export interface KinematicsRuntimeProps {
  config: KinematicsGraphProps;
  lang?: 'en' | 'bn';
  dualReplayTrigger?: number;
  onGoalSolved?: (sol: { v0: number; v1: number; v2: number; disp: number }) => void;
  onRunComplete?: (summary: { nodes: VNodes; disp: number; dist: number; runCount: number }) => void;
}

const KEYS: NodeKey[] = ['v0', 'v1', 'v2'];
const DRIVE_MS = 2400;

export const KinematicsGraphMatcher: React.FC<KinematicsRuntimeProps> = ({
  config, lang = 'en', dualReplayTrigger = 0, onGoalSolved, onRunComplete,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const solvedRef = useRef(false);
  const initialNodes = useCallback((): VNodes => [config.initialV0, config.initialV1, config.initialV2], [config]);
  const [nodes, setNodes] = useState<VNodes>(initialNodes);
  const [tp, setTp] = useState(0);
  const [driving, setDriving] = useState(false);
  const [draggingNode, setDraggingNode] = useState<NodeKey | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [xray, setXray] = useState(false);
  const [ghosts, setGhosts] = useState<Array<{ id: number; nodes: VNodes }>>([]);
  const runCountRef = useRef(0);
  const [status, setStatus] = useState<{ text: string; color: string } | null>(null);
  const T = config.stageDurationSec;
  const bn = lang === 'bn';

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setNodes(initialNodes());
    setTp(0);
    setDriving(false);
    setDraggingNode(null);
    setHasInteracted(false);
    setRevealed(false);
    setGhosts([]);
    runCountRef.current = 0;
    setStatus(null);
    solvedRef.current = false;
  }, [initialNodes]);

  useEffect(() => {
    const onVis = () => { pausedRef.current = document.visibilityState === 'hidden'; };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const finishDrive = useCallback((n: VNodes) => {
    const m = computePiecewiseKinematics(n[0], n[1], n[2], T);
    setDriving(false);
    setRevealed(true);
    if (config.mode !== 'exam_trap') {
      setGhosts((prev) => [...prev.filter((g) => g.nodes.join() !== n.join()).slice(-1), { id: Date.now(), nodes: n }]);
    }
    runCountRef.current += 1;
    onRunComplete?.({ nodes: n, disp: m.netDisplacement, dist: m.totalDistance, runCount: runCountRef.current });
    const target = config.targetDisplacementMeters;
    if (config.mode !== 'target_puzzle' || target === undefined) return;
    if (isGoalHit(config, n[0], n[1], n[2])) {
      setStatus({ text: bn ? `প্যাডে থেমেছে! s = ${m.netDisplacement} m ⚡` : `Docked on the pad! s = ${m.netDisplacement} m ⚡`, color: '#34D399' });
      if (!solvedRef.current) {
        solvedRef.current = true;
        sfx.chime();
        onGoalSolved?.({ v0: n[0], v1: n[1], v2: n[2], disp: m.netDisplacement });
      }
      return;
    }
    sfx.nudge();
    const miss = m.netDisplacement - target;
    const stillMoving = config.targetFinalVelocity !== undefined && n[2] !== config.targetFinalVelocity;
    setStatus({
      color: '#FBBF24',
      text:
        Math.abs(miss) <= config.tolerance && stillMoving
          ? bn ? `${target} m-এ পৌঁছেছে, কিন্তু এখনো ${n[2]} m/s বেগে চলছে!` : `Reached ${target} m but still moving at ${n[2]} m/s!`
          : miss > 0
          ? bn ? `${miss} m বেশি চলে গেছে!` : `Overshot the pad by ${miss} m!`
          : bn ? `প্যাড থেকে ${-miss} m আগে থেমেছে` : `Stopped ${-miss} m short of the pad`,
    });
  }, [T, bn, config, onGoalSolved, onRunComplete]);

  const drive = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const n = nodes;
    sfx.launch();
    setStatus(null);
    setDriving(true);
    let t = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!pausedRef.current) {
        const next = Math.min(2 * T, t + (dt / DRIVE_MS) * 2 * T);
        if (Math.floor(next) > Math.floor(t)) sfx.tick(0.9 + Math.floor(next) * 0.05);
        t = next;
        setTp(t);
      }
      if (t < 2 * T) rafRef.current = requestAnimationFrame(step);
      else { rafRef.current = null; finishDrive(n); }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [T, finishDrive, nodes]);

  useEffect(() => {
    if (dualReplayTrigger > 0 && config.mode === 'exam_trap') drive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dualReplayTrigger]);

  const setNode = (key: NodeKey, raw: number) => {
    const { min, max, step } = config.velocityBounds;
    const v = Number(Math.max(min, Math.min(max, min + Math.round((raw - min) / step) * step)).toFixed(2));
    const k = KEYS.indexOf(key);
    if (v === nodes[k]) return;
    sfx.tick(0.8 + ((v - min) / (max - min)) * 0.6);
    const next = [...nodes] as [number, number, number];
    next[k] = v;
    setHasInteracted(true);
    setStatus(null);
    setNodes(next);
  };

  const { CY_TOP, CY_BOT, H } = KSTAGE;
  const { min: vMin, max: vMax } = config.velocityBounds;
  const clientToStageY = (clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.height === 0) return 0;
    return ((clientY - rect.top) * H) / rect.height;
  };
  const yToV = (y: number) => vMin + ((CY_BOT - y) / (CY_BOT - CY_TOP)) * (vMax - vMin);
  const vToY = (v: number) => CY_BOT - ((v - vMin) / (vMax - vMin)) * (CY_BOT - CY_TOP);

  return (
    <div className="w-full select-none">
      <KinematicsStageSvg
        svgRef={svgRef}
        config={config}
        lang={lang}
        nodes={nodes}
        tp={tp}
        driving={driving}
        draggingNode={draggingNode}
        hasInteracted={hasInteracted}
        revealed={revealed}
        xray={xray}
        ghosts={ghosts.filter((g) => g.nodes.join() !== nodes.join())}
        status={status}
        onNodePointerDown={(key, e) => {
          if (driving) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          dragOffsetRef.current = vToY(nodes[KEYS.indexOf(key)]) - clientToStageY(e.clientY);
          setDraggingNode(key);
          setHasInteracted(true);
          sfx.pop(true);
        }}
        onStagePointerMove={(clientY) => draggingNode && setNode(draggingNode, yToV(clientToStageY(clientY) + dragOffsetRef.current))}
        onStagePointerUp={() => setDraggingNode(null)}
      />
      <KinematicsControlsBar
        config={config}
        lang={lang}
        nodes={nodes}
        driving={driving}
        revealed={revealed}
        xray={xray}
        hasGhosts={ghosts.length > 0}
        onStepNode={(key, dir) => setNode(key, nodes[KEYS.indexOf(key)] + dir * config.velocityBounds.step)}
        onDrive={drive}
        onToggleXray={() => setXray((x) => !x)}
        onClearGhosts={() => setGhosts([])}
      />
    </div>
  );
};
