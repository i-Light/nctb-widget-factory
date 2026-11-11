'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { sfx } from './audio';
import { PhoneTopHeaderBar } from './PhoneTopHeaderBar';
import { PhoneProofBottomSheet, PhoneStudioBottomSheet } from './PhoneCardDrawers';
import { PhoneCardActionPanel } from './PhoneCardActionPanel';
import { PhoneSprintCard } from './PhoneSprintCard';
import { ProjectileSim } from '@/widgets/ProjectileSim/ProjectileSim';
import { evaluateProjectileLesson } from '@/widgets/ProjectileSim/ProjectileSim.eval';
import { VectorRiverBoatSim } from '@/widgets/VectorRiverBoatSim/VectorRiverBoatSim';
import { evaluateRiverBoatLesson, verifyRiverBoatPuzzle } from '@/widgets/VectorRiverBoatSim/VectorRiverBoatSim.eval';
import { KirchhoffCircuitBoard } from '@/widgets/KirchhoffCircuitBoard/KirchhoffCircuitBoard';
import { evaluateKirchhoffLesson, verifyKirchhoffPuzzle } from '@/widgets/KirchhoffCircuitBoard/KirchhoffCircuitBoard.eval';
import { RayOpticsCanvas } from '@/widgets/RayOpticsCanvas/RayOpticsCanvas';
import { evaluateRayOpticsLesson, verifyRayOpticsPuzzle } from '@/widgets/RayOpticsCanvas/RayOpticsCanvas.eval';
import { KinematicsGraphMatcher } from '@/widgets/KinematicsGraphMatcher/KinematicsGraphMatcher';
import { evaluateKinematicsLesson, verifyKinematicsGraphPuzzle } from '@/widgets/KinematicsGraphMatcher/KinematicsGraphMatcher.eval';
import type { KinematicsLessonManifest, KirchhoffLessonManifest, LessonManifest, RayOpticsLessonManifest, RiverBoatLessonManifest } from './schema';
type SupportedManifest = LessonManifest | RiverBoatLessonManifest | KirchhoffLessonManifest | RayOpticsLessonManifest | KinematicsLessonManifest;
type Lang = 'en' | 'bn';
export interface PhoneCardRunnerProps {
  manifest: SupportedManifest;
}
export const PhoneCardRunner: React.FC<PhoneCardRunnerProps> = ({
  manifest
}) => {
  const storageKey = `nctb_phone_progress_${manifest.lessonId}`;
  const [lang, setLang] = useState<Lang>('en');
  const [cardIdx, setCardIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [streak, setStreak] = useState(3);
  const [xpEarned, setXpEarned] = useState(0);
  const [toyRuns, setToyRuns] = useState(0);
  const [selectedPredIdx, setSelectedPredIdx] = useState<number | null>(null);
  const [filledTokens, setFilledTokens] = useState<Array<string | null>>([]);
  const [formulaChecked, setFormulaChecked] = useState<boolean | null>(null);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [selectedTrapIdx, setSelectedTrapIdx] = useState<number | null>(null);
  const [dualReplayCount, setDualReplayCount] = useState(0);
  const [mcqIdx, setMcqIdx] = useState(0);
  const [mcqChoice, setMcqChoice] = useState<number | null>(null);
  const [mcqScore, setMcqScore] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [proofSheetOpen, setProofSheetOpen] = useState(false);
  const [studioSheetOpen, setStudioSheetOpen] = useState(false);
  const [simulatedHallucination, setSimulatedHallucination] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = (JSON.parse(raw) as {
          cardIdx?: number;
          lang?: Lang;
        });
        if (typeof parsed.cardIdx === 'number' && parsed.cardIdx >= 0 && parsed.cardIdx < 6) {
          setCardIdx(parsed.cardIdx);
        }
        if (parsed.lang === 'en' || parsed.lang === 'bn') setLang(parsed.lang);
      }
    } catch {}
  }, [storageKey]);
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({
        cardIdx,
        lang
      }));
    } catch {}
  }, [storageKey, cardIdx, lang]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const card = manifest.cards[cardIdx];
  useEffect(() => {
    setToyRuns(0);
    setSelectedPredIdx(null);
    setPuzzleSolved(false);
    setSelectedTrapIdx(null);
    setDualReplayCount(0);
    setFormulaChecked(null);
    setProofSheetOpen(false);
    if (card.cardStage === 'formula_lock_in') {
      setFilledTokens(Array.from({
        length: card.correctTokenOrder.length
      }, () => null));
    }
    if (card.cardStage === 'skills_check') {
      setMcqIdx(0);
      setMcqChoice(null);
      setMcqScore(0);
      setLessonFinished(false);
    }
  }, [cardIdx, card]);
  const evalSummary = useMemo(() => {
    if (manifest.widgetType === 'VectorRiverBoatSim') return evaluateRiverBoatLesson(manifest);
    if (manifest.widgetType === 'KirchhoffCircuitBoard') return evaluateKirchhoffLesson(manifest);
    if (manifest.widgetType === 'RayOpticsCanvas') return evaluateRayOpticsLesson(manifest);
    if (manifest.widgetType === 'KinematicsGraphMatcher') return evaluateKinematicsLesson(manifest);
    return evaluateProjectileLesson(manifest);
  }, [manifest]);
  const renderWidget = () => {
    if (card.cardStage === 'skills_check') return null;
    if (manifest.widgetType === 'VectorRiverBoatSim') {
      const rbCard = manifest.cards[cardIdx];
      if (rbCard.cardStage === 'skills_check') return null;
      return <VectorRiverBoatSim config={rbCard.widgetProps} lang={lang} dualReplayTrigger={dualReplayCount} onCrossingComplete={({
        runCount
      }) => setToyRuns(runCount)} onGoalSolved={() => setPuzzleSolved(true)} />;
    }
    if (manifest.widgetType === 'KirchhoffCircuitBoard') {
      const kcCard = manifest.cards[cardIdx];
      if (kcCard.cardStage === 'skills_check') return null;
      return <KirchhoffCircuitBoard config={kcCard.widgetProps} lang={lang} dualReplayTrigger={dualReplayCount} onCircuitRunComplete={({
        runCount
      }) => setToyRuns(runCount)} onGoalSolved={() => setPuzzleSolved(true)} />;
    }
    if (manifest.widgetType === 'RayOpticsCanvas') {
      const roCard = manifest.cards[cardIdx];
      if (roCard.cardStage === 'skills_check') return null;
      return <RayOpticsCanvas config={roCard.widgetProps} lang={lang} dualReplayTrigger={dualReplayCount} onRunComplete={({
        runCount
      }) => setToyRuns(runCount)} onGoalSolved={() => setPuzzleSolved(true)} />;
    }
    if (manifest.widgetType === 'KinematicsGraphMatcher') {
      const kgCard = manifest.cards[cardIdx];
      if (kgCard.cardStage === 'skills_check') return null;
      return <KinematicsGraphMatcher config={kgCard.widgetProps} lang={lang} dualReplayTrigger={dualReplayCount} onRunComplete={({
        runCount
      }) => setToyRuns(runCount)} onGoalSolved={() => setPuzzleSolved(true)} />;
    }
    const pjCard = manifest.cards[cardIdx];
    if (pjCard.cardStage === 'skills_check') return null;
    return <ProjectileSim config={pjCard.widgetProps} lang={lang} dualReplayTrigger={dualReplayCount} onRunComplete={({
      runCount
    }) => setToyRuns(runCount)} onTargetSolved={() => setPuzzleSolved(true)} />;
  };
  const handleShareMastery = async () => {
    sfx.pop(true);
    const shareText = lang === 'bn' ? `আমি NCTB Physics Lab-এ "${manifest.lessonTitle.bn}" অধ্যায়ের ৬টি কার্ড সম্পন্ন করেছি! (+${xpEarned} XP)` : `I mastered all 6 cards of "${manifest.lessonTitle.en}" in NCTB Physics Lab! (+${xpEarned} XP)`;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: manifest.lessonTitle[lang],
          text: shareText
        });
        return;
      }
    } catch {}
    if (typeof window !== 'undefined') {
      window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
    }
  };
  const runHallucinationDemo = () => {
    sfx.nudge();
    if (manifest.widgetType === 'VectorRiverBoatSim') {
      const c4 = manifest.cards[3];
      if (c4.cardStage === 'guided_manipulation') {
        const res = verifyRiverBoatPuzzle({
          ...c4.widgetProps,
          initialStreamSpeed: 10
        });
        setSimulatedHallucination(res.reason ?? 'Gate 2 blocked unsolvable u >= v config.');
      }
    } else if (manifest.widgetType === 'KirchhoffCircuitBoard') {
      const c4 = manifest.cards[3];
      if (c4.cardStage === 'guided_manipulation') {
        const res = verifyKirchhoffPuzzle({
          ...c4.widgetProps,
          targetValue: 8.0,
          maxFuseCurrent: 7.0
        });
        setSimulatedHallucination(res.reason ?? 'Gate 2 blocked 8.0A target exceeding 7.0A fuse.');
      }
    } else if (manifest.widgetType === 'RayOpticsCanvas') {
      const c4 = manifest.cards[3];
      if (c4.cardStage === 'guided_manipulation') {
        const res = verifyRayOpticsPuzzle({
          ...c4.widgetProps,
          lensType: 'concave'
        });
        setSimulatedHallucination(res.reason ?? 'Gate 2 blocked concave real-image screen puzzle.');
      }
    } else if (manifest.widgetType === 'KinematicsGraphMatcher') {
      const c4 = manifest.cards[3];
      if (c4.cardStage === 'guided_manipulation') {
        const res = verifyKinematicsGraphPuzzle({
          ...c4.widgetProps,
          targetDisplacementMeters: 65
        });
        setSimulatedHallucination(res.reason ?? 'Gate 2 blocked unreachable 65 m charging pad.');
      }
    } else {
      const broken = structuredClone(manifest);
      const c4 = broken.cards[3];
      if (c4.cardStage === 'guided_manipulation') c4.widgetProps.targetValue = 95;
      const res = evaluateProjectileLesson(broken);
      setSimulatedHallucination(res.errors[0] ?? 'Gate 2 blocked unreachable range.');
    }
  };
  const activeWhySteps = 'seeWhySteps' in card ? card.seeWhySteps : undefined;
  return <div className="relative flex min-h-[100dvh] w-full flex-col justify-between bg-[#F7F7F5] px-3.5 py-2 select-none">
      <PhoneTopHeaderBar cardCount={manifest.cards.length} cardIdx={cardIdx} streak={streak} muted={muted} lang={lang} onSelectCard={setCardIdx} onToggleMute={() => {
      const next = !muted;
      sfx.muted = next;
      setMuted(next);
      if (!next) sfx.pop(true);
    }} onToggleLang={() => {
      sfx.pop(true);
      setLang(l => l === 'bn' ? 'en' : 'bn');
    }} onOpenStudio={() => {
      sfx.pop(true);
      setStudioSheetOpen(true);
    }} />

      <main className="my-1.5 flex flex-1 flex-col justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-teal-800">
            <span>
              {lang === 'bn' ? `কার্ড ${card.cardNumber}/৬` : `Card ${card.cardNumber} of 6`}
            </span>
            {card.cardStage === 'exam_trap' && <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                {card.boardReference.split(' ').slice(0, 3).join(' ')}
              </span>}
          </div>
          <h1 className="text-[16px] font-extrabold leading-[1.45] text-slate-900">
            {card.prompt[lang]}
          </h1>
        </div>

        {card.cardStage !== 'skills_check' && <div>{renderWidget()}</div>}

        <div className="space-y-2 pb-1">
          {card.cardStage !== 'skills_check' ? <PhoneCardActionPanel card={card} widgetType={manifest.widgetType} lang={lang} toyRuns={toyRuns} selectedPredIdx={selectedPredIdx} filledTokens={filledTokens} formulaChecked={formulaChecked} puzzleSolved={puzzleSolved} selectedTrapIdx={selectedTrapIdx} onSelectPred={(idx, isCorrect) => {
          setSelectedPredIdx(idx);
          if (isCorrect) sfx.chime();else sfx.nudge();
        }} onFillToken={(tok, correctOrder) => {
          const emptyIdx = filledTokens.findIndex(t => t === null);
          if (emptyIdx === -1) return;
          sfx.pop(true);
          const next = [...filledTokens];
          next[emptyIdx] = tok;
          setFilledTokens(next);
          if (next.every(x => x !== null)) {
            const ok = next.every((val, i) => val === correctOrder[i]);
            setFormulaChecked(ok);
            if (ok) sfx.chime();else sfx.nudge();
          }
        }} onClearSlot={slotIdx => {
          if (filledTokens[slotIdx]) {
            sfx.pop(false);
            const copy = [...filledTokens];
            copy[slotIdx] = null;
            setFilledTokens(copy);
            setFormulaChecked(null);
          }
        }} onOpenProof={() => setProofSheetOpen(true)} onSelectTrap={(idx, isTrap) => {
          setSelectedTrapIdx(idx);
          if (isTrap) sfx.nudge();else sfx.chime();
          setDualReplayCount(c => c + 1);
        }} onNextCard={() => {
          sfx.pop(true);
          if (cardIdx < 5) setCardIdx(c => c + 1);
        }} /> : <PhoneSprintCard lang={lang} xpReward={card.xpReward} questions={card.questions} mcqIdx={mcqIdx} mcqChoice={mcqChoice} mcqScore={mcqScore} xpEarned={xpEarned} lessonFinished={lessonFinished} onPickOption={(oIdx, isRight) => {
          setMcqChoice(oIdx);
          if (isRight) setMcqScore(s => s + 1);
        }} onAdvanceMcq={() => {
          sfx.pop(true);
          if (mcqIdx < 2) {
            setMcqIdx(i => i + 1);
            setMcqChoice(null);
          } else {
            sfx.chime();
            setXpEarned(card.xpReward);
            setStreak(s => s + 1);
            setLessonFinished(true);
          }
        }} onShareMastery={handleShareMastery} />}
        </div>
      </main>

      {proofSheetOpen && activeWhySteps && <PhoneProofBottomSheet lang={lang} steps={activeWhySteps} onClose={() => setProofSheetOpen(false)} />}

      {studioSheetOpen && <PhoneStudioBottomSheet lessonId={manifest.lessonId} passed={evalSummary.passed} simulatedHallucination={simulatedHallucination} onRunHallucinationDemo={runHallucinationDemo} onClose={() => setStudioSheetOpen(false)} />}
    </div>;
};
