'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '@/engine/audio';
import type { KirchhoffProps } from './KirchhoffCircuitBoard.schema';
import { computeCircuitMetrics } from './KirchhoffCircuitBoard.eval';
import { KirchhoffBreadboardSvg } from './KirchhoffBreadboardSvg';
import { KirchhoffWheatstoneSvg } from './KirchhoffWheatstoneSvg';
import { KirchhoffControlsBar } from './KirchhoffControlsBar';
export interface KirchhoffRuntimeProps {
  config: KirchhoffProps;
  lang?: 'en' | 'bn';
  dualReplayTrigger?: number;
  onGoalSolved?: (sol: { r1: number; r2: number; req: number; current: number }) => void;
  onCircuitRunComplete?: (summary: { topology: 'series' | 'parallel'; r1: number; r2: number; current: number; runCount: number }) => void;
}
export const KirchhoffCircuitBoard: React.FC<KirchhoffRuntimeProps> = ({
  config, lang = 'en', dualReplayTrigger = 0, onGoalSolved, onCircuitRunComplete
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const springRafRef = useRef<number | null>(null);
  const pausedRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartIdxRef = useRef<number>(0);
  const solvedEmittedRef = useRef<boolean>(false);
  const [topology, setTopology] = useState<'series' | 'parallel'>(config.topology === 'wheatstone' ? 'parallel' : config.topology);
  const [r1, setR1] = useState(config.initialR1);
  const [r2, setR2] = useState(config.initialR2);
  const [activeSocket, setActiveSocket] = useState<'R1' | 'R2'>(config.lockedControls.includes('R2') ? 'R1' : 'R2');
  const [draggingSocket, setDraggingSocket] = useState<'R1' | 'R2' | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showNodes, setShowNodes] = useState(config.showNodeVoltages);
  const [fuseLatchedBlown, setFuseLatchedBlown] = useState(false);
  const [driftPhase, setDriftPhase] = useState(0);
  const [ghostRuns, setGhostRuns] = useState<Array<{ id: number; label: string }>>([]);
  const [runCount, setRunCount] = useState(0);
  const [dualReplayActive, setDualReplayActive] = useState(false);
  const [needleDeg, setNeedleDeg] = useState(22);
  useEffect(() => {
    if (springRafRef.current !== null) cancelAnimationFrame(springRafRef.current);
    setTopology(config.topology === 'wheatstone' ? 'parallel' : config.topology);
    setR1(config.initialR1);
    setR2(config.initialR2);
    setActiveSocket(config.lockedControls.includes('R2') ? 'R1' : 'R2');
    setDraggingSocket(null);
    setShowNodes(config.showNodeVoltages);
    setFuseLatchedBlown(false);
    setGhostRuns([]);
    setRunCount(0);
    setDualReplayActive(false);
    setNeedleDeg(22);
    solvedEmittedRef.current = false;
  }, [config.mode, config.topology, config.supplyVoltage, config.initialR1, config.initialR2, config.maxFuseCurrent, config.targetMetric, config.targetValue, config.showNodeVoltages, config.lockedControls]);
  useEffect(() => {
    const onVis = () => { pausedRef.current = document.visibilityState === 'hidden'; };
    document.addEventListener('visibilitychange', onVis);
    let lastTs = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(48, now - lastTs);
      lastTs = now;
      if (!pausedRef.current) setDriftPhase(prev => (prev + dt * 0.42 / 1000) % 100);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (springRafRef.current !== null) cancelAnimationFrame(springRafRef.current);
    };
  }, []);
  const metrics = useMemo(() => computeCircuitMetrics(topology, config.supplyVoltage, r1, r2, config.maxFuseCurrent), [topology, config.supplyVoltage, r1, r2, config.maxFuseCurrent]);
  const checkStateAfterChange = useCallback((nextTopo: 'series' | 'parallel', nextR1: number, nextR2: number) => {
    const nextM = computeCircuitMetrics(nextTopo, config.supplyVoltage, nextR1, nextR2, config.maxFuseCurrent);
    if (nextM.fuseBlown) { setFuseLatchedBlown(true); sfx.nudge(); return; }
    if (!fuseLatchedBlown && config.targetMetric !== 'none' && config.targetMetric !== 'bridgeBalance' && config.targetValue !== undefined) {
      const val = config.targetMetric === 'totalCurrent' ? nextM.totalCurrent : nextM.req;
      if (Math.abs(val - config.targetValue) <= config.tolerance && !solvedEmittedRef.current) {
        solvedEmittedRef.current = true;
        sfx.chime();
        onGoalSolved?.({ r1: nextR1, r2: nextR2, req: nextM.req, current: nextM.totalCurrent });
      }
    }
  }, [config.maxFuseCurrent, config.supplyVoltage, config.targetMetric, config.targetValue, config.tolerance, fuseLatchedBlown, onGoalSolved]);
  const applySocketValue = useCallback((socket: 'R1' | 'R2', val: number) => {
    setHasInteracted(true);
    const nextR1 = socket === 'R1' ? val : r1;
    const nextR2 = socket === 'R2' ? val : r2;
    if (socket === 'R1') setR1(val); else setR2(val);
    checkStateAfterChange(topology, nextR1, nextR2);
  }, [checkStateAfterChange, r1, r2, topology]);
  const triggerWheatstoneSpringReplay = useCallback(() => {
    if (springRafRef.current !== null) cancelAnimationFrame(springRafRef.current);
    sfx.launch();
    setDualReplayActive(true);
    let pos = 26, vel = -140, lastTs = performance.now();
    const stepSpring = (now: number) => {
      const dt = Math.min(0.032, (now - lastTs) / 1000);
      lastTs = now;
      if (!pausedRef.current) { vel += (-150 * pos - 11.5 * vel) * dt; pos += vel * dt; setNeedleDeg(pos); }
      if (Math.abs(pos) > 0.15 || Math.abs(vel) > 0.6) springRafRef.current = requestAnimationFrame(stepSpring);
      else { setNeedleDeg(0); springRafRef.current = null; }
    };
    springRafRef.current = requestAnimationFrame(stepSpring);
  }, []);
  useEffect(() => { if (dualReplayTrigger > 0 && config.topology === 'wheatstone') triggerWheatstoneSpringReplay(); }, [dualReplayTrigger, config.topology, triggerWheatstoneSpringReplay]);
  const handleEnergize = useCallback(() => {
    if (config.topology === 'wheatstone') { triggerWheatstoneSpringReplay(); return; }
    sfx.launch();
    const isBlown = fuseLatchedBlown || metrics.fuseBlown;
    const cur = isBlown ? 0 : metrics.activeCurrent;
    const tag = `${topology === 'parallel' ? `${r1}\u2225${r2}\u03a9` : `${r1}+${r2}\u03a9`} \u2192 ${cur.toFixed(1)}A`;
    setGhostRuns(prev => [...prev.slice(-1), { id: Date.now(), label: tag }]);
    const nextRuns = runCount + 1;
    setRunCount(nextRuns);
    onCircuitRunComplete?.({ topology, r1, r2, current: cur, runCount: nextRuns });
    checkStateAfterChange(topology, r1, r2);
  }, [checkStateAfterChange, config.topology, fuseLatchedBlown, metrics, onCircuitRunComplete, r1, r2, runCount, topology, triggerWheatstoneSpringReplay]);
  return <div className="w-full select-none">
    {config.topology === 'wheatstone' ? <KirchhoffWheatstoneSvg config={config} lang={lang} showNodes={showNodes} dualReplayActive={dualReplayActive} needleDeg={needleDeg} trapNeedleDeg={-34} driftPhase={driftPhase} onToggleNodes={() => setShowNodes(v => !v)} /> : <KirchhoffBreadboardSvg svgRef={svgRef} config={config} lang={lang} topology={topology} r1={r1} r2={r2} metrics={metrics} fuseLatchedBlown={fuseLatchedBlown} activeSocket={activeSocket} draggingSocket={draggingSocket} hasInteracted={hasInteracted} showNodes={showNodes} driftPhase={driftPhase} ghostRuns={ghostRuns} onToggleNodes={() => setShowNodes(v => !v)} onToggleTopology={() => { const nextT = topology === 'parallel' ? 'series' : 'parallel'; setHasInteracted(true); setTopology(nextT); checkStateAfterChange(nextT, r1, r2); }} onSocketPointerDown={(sock, pid, clientX, el) => { el.setPointerCapture(pid); setHasInteracted(true); setActiveSocket(sock); setDraggingSocket(sock); dragStartXRef.current = clientX; dragStartIdxRef.current = Math.max(0, config.allowedResistorValues.indexOf(sock === 'R1' ? r1 : r2)); sfx.pop(true); }} onSocketPointerMove={clientX => { if (!draggingSocket || fuseLatchedBlown) return; const pool = config.allowedResistorValues; const nextIdx = Math.max(0, Math.min(pool.length - 1, dragStartIdxRef.current + Math.round((clientX - dragStartXRef.current) / 26))); const nextVal = pool[nextIdx]; if (nextVal !== (draggingSocket === 'R1' ? r1 : r2)) { sfx.tick(0.85 + nextIdx * 0.12); applySocketValue(draggingSocket, nextVal); } }} onSocketPointerUp={clientX => { if (draggingSocket && !fuseLatchedBlown && Math.abs(clientX - dragStartXRef.current) < 8) { const pool = config.allowedResistorValues; const curVal = draggingSocket === 'R1' ? r1 : r2; const nextVal = pool[(pool.indexOf(curVal) + 1) % pool.length]; if (nextVal !== curVal) { sfx.tick(1.0); applySocketValue(draggingSocket, nextVal); } } setDraggingSocket(null); }} />}
    <KirchhoffControlsBar config={config} lang={lang} topology={topology} r1={r1} r2={r2} activeSocket={activeSocket} fuseBlown={fuseLatchedBlown || metrics.fuseBlown} activeCurrent={fuseLatchedBlown || metrics.fuseBlown ? 0 : metrics.activeCurrent} hasGhosts={ghostRuns.length > 0} onSelectSocket={setActiveSocket} onAssignResistor={ohms => { if (!fuseLatchedBlown) applySocketValue(activeSocket, ohms); }} onToggleTopology={() => { const nextT = topology === 'parallel' ? 'series' : 'parallel'; setHasInteracted(true); setTopology(nextT); checkStateAfterChange(nextT, r1, r2); }} onResetFuse={() => { setFuseLatchedBlown(false); solvedEmittedRef.current = false; setR1(config.initialR1); setR2(config.initialR2); }} onEnergize={handleEnergize} onClearGhosts={() => setGhostRuns([])} />
  </div>;
};
