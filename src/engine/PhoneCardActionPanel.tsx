'use client';

import React from 'react';
import { BookOpen, Check, ChevronRight, Sparkles } from 'lucide-react';
import { sfx } from './audio';
import { MathFrac } from './MathFrac';
import type { LessonCard, RiverBoatLessonCard } from './schema';
export const PhoneCardActionPanel: React.FC<{
  card: LessonCard | RiverBoatLessonCard;
  widgetType: 'ProjectileSim' | 'VectorRiverBoatSim';
  lang: 'en' | 'bn';
  toyRuns: number;
  selectedPredIdx: number | null;
  filledTokens: Array<string | null>;
  formulaChecked: boolean | null;
  puzzleSolved: boolean;
  selectedTrapIdx: number | null;
  onSelectPred: (idx: number, isCorrect: boolean) => void;
  onFillToken: (tok: string, correctOrder: string[]) => void;
  onClearSlot: (slotIdx: number) => void;
  onOpenProof: () => void;
  onSelectTrap: (idx: number, isTrap: boolean) => void;
  onNextCard: () => void;
}> = ({
  card,
  widgetType,
  lang,
  toyRuns,
  selectedPredIdx,
  filledTokens,
  formulaChecked,
  puzzleSolved,
  selectedTrapIdx,
  onSelectPred,
  onFillToken,
  onClearSlot,
  onOpenProof,
  onSelectTrap,
  onNextCard
}) => {
  const renderSlotBtn = (slotIdx: number, minW: string) => <button key={slotIdx} type="button" onClick={() => onClearSlot(slotIdx)} className={`flex min-h-[48px] ${minW} items-center justify-center rounded-xl border-2 px-2.5 text-sm font-extrabold touch-manipulation ${filledTokens[slotIdx] ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'}`}>
      {filledTokens[slotIdx] ?? '?'}
    </button>;
  if (card.cardStage === 'zero_fail_toy') {
    return <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2.5">
        <p className="text-xs font-semibold text-slate-600">
          {toyRuns === 0 ? lang === 'bn' ? 'প্রথমবার চালিয়ে গতিপথ দেখো!' : 'Run once to leave a ghost wake trail!' : lang === 'bn' ? `${toyRuns} বার চালানো হয়েছে — কোণ বদলে তুলনা করো!` : `${toyRuns} run${toyRuns > 1 ? 's' : ''} logged — compare ghost trails!`}
        </p>
        <button type="button" onClick={onNextCard} className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl border-b-4 border-teal-800 bg-teal-600 px-3.5 text-xs font-extrabold text-white active:translate-y-1 active:border-b-0 touch-manipulation">
          <span>{lang === 'bn' ? 'পরবর্তী' : 'NEXT'}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>;
  }
  if (card.cardStage === 'prediction_hook') {
    return <div className="space-y-2">
        <div className="grid grid-cols-1 gap-1.5">
          {card.options.map((opt, idx) => {
          const isPicked = selectedPredIdx === idx;
          const isCorrect = idx === card.correctOptionIndex;
          return <button key={idx} type="button" onClick={() => onSelectPred(idx, isCorrect)} className={`flex min-h-[48px] w-full items-center justify-between rounded-xl border-2 border-b-4 px-3.5 text-left text-xs font-extrabold active:translate-y-0.5 active:border-b-2 transition touch-manipulation ${isPicked ? isCorrect ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-amber-500 bg-amber-50 text-amber-950' : 'border-slate-200 bg-white text-slate-800'}`}>
                <span>{opt[lang]}</span>
                {isPicked && isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
              </button>;
        })}
        </div>
        {selectedPredIdx === card.correctOptionIndex && <button type="button" onClick={onNextCard} className="flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-sm font-extrabold text-white active:translate-y-1 active:border-b-0 touch-manipulation">
            <span>{lang === 'bn' ? 'সূত্র আবিষ্কার করো' : 'UNLOCK FORMULA'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>}
      </div>;
  }
  if (card.cardStage === 'formula_lock_in') {
    return <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-base font-extrabold text-slate-900">
            <span className="font-serif italic">
              {widgetType === 'VectorRiverBoatSim' ? 'cos α = −' : 'H ='}
            </span>
            {card.correctTokenOrder.length === 2 ? <MathFrac num={renderSlotBtn(0, 'min-w-[74px]')} den={renderSlotBtn(1, 'min-w-[74px]')} /> : <MathFrac num={<div className="flex items-center gap-1">
                    {renderSlotBtn(0, 'min-w-[66px]')}
                    {renderSlotBtn(1, 'min-w-[66px]')}
                  </div>} den={renderSlotBtn(2, 'min-w-[76px]')} />}
          </div>
          <button type="button" onClick={() => {
          sfx.pop(true);
          onOpenProof();
        }} className="flex min-h-[44px] items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 text-xs font-extrabold text-indigo-800 active:scale-95 touch-manipulation">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{lang === 'bn' ? 'কেন?' : 'Why?'}</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {card.availableTokens.map(tok => {
          const used = filledTokens.includes(tok);
          return <button key={tok} type="button" disabled={used} onClick={() => onFillToken(tok, card.correctTokenOrder)} className={`min-h-[48px] rounded-xl border-b-2 text-sm font-extrabold transition touch-manipulation ${used ? 'border-slate-200 bg-slate-100 text-slate-300' : 'border-slate-300 bg-slate-50 text-slate-900 active:translate-y-0.5 active:border-b-0'}`}>
                {tok}
              </button>;
        })}
        </div>

        {formulaChecked === false && <p className="text-xs font-bold text-amber-700">
            {lang === 'bn' ? 'স্লটে ট্যাপ করে টাইল সরিয়ে আবার সাজাও!' : 'Tap a filled slot to swap tokens!'}
          </p>}
        {formulaChecked === true && <button type="button" onClick={onNextCard} className="flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-sm font-extrabold text-white active:translate-y-1 active:border-b-0 touch-manipulation">
            <span>{lang === 'bn' ? 'চ্যালেঞ্জে যাও' : 'START TARGET CHALLENGE'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>}
      </div>;
  }
  if (card.cardStage === 'guided_manipulation') {
    return <div className="space-y-2">
        {puzzleSolved ? <div className="flex items-center justify-between gap-2 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-2.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-950">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{lang === 'bn' ? 'বুলসআই! নিখুঁত কোণে লক্ষ্যভেদ করেছ!' : 'Bullseye! Obstacle cleared right into target!'}</span>
            </div>
            <button type="button" onClick={onNextCard} className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl border-b-4 border-emerald-700 bg-emerald-500 px-3.5 text-xs font-extrabold text-white active:translate-y-1 active:border-b-0 touch-manipulation">
              <span>{lang === 'bn' ? 'বোর্ড ট্র্যাপ' : 'NEXT'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div> : card.seeWhySteps ? <button type="button" onClick={() => {
        sfx.pop(true);
        onOpenProof();
      }} className="flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 active:scale-[0.99] touch-manipulation">
            <BookOpen className="h-3.5 w-3.5 text-teal-600" />
            <span>{lang === 'bn' ? 'ইঙ্গিত ও সূত্র দেখো' : 'Need a formula hint?'}</span>
          </button> : null}
      </div>;
  }
  if (card.cardStage === 'exam_trap') {
    return <div className="space-y-2">
        <div className="grid grid-cols-1 gap-1.5">
          {card.options.map((opt, idx) => {
          const chosen = selectedTrapIdx === idx;
          return <button key={idx} type="button" onClick={() => onSelectTrap(idx, opt.isTrapMisconception)} className={`flex min-h-[48px] w-full items-center justify-between rounded-xl border-2 border-b-4 px-3.5 text-left text-xs font-extrabold active:translate-y-0.5 active:border-b-2 transition touch-manipulation ${chosen ? opt.isTrapMisconception ? 'border-rose-500 bg-rose-50 text-rose-950' : 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-800'}`}>
                <span>{opt.label[lang]}</span>
                {chosen && (opt.isTrapMisconception ? <span className="rounded bg-rose-200 px-1.5 py-0.5 text-[10px] font-black text-rose-900">TRAP</span> : <Check className="h-4 w-4 text-emerald-600" />)}
              </button>;
        })}
        </div>
        {selectedTrapIdx !== null && <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-700">
            {card.options[selectedTrapIdx].feedback[lang]}
          </div>}
        {selectedTrapIdx === card.correctOptionIndex && <button type="button" onClick={onNextCard} className="flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-sm font-extrabold text-white active:translate-y-1 active:border-b-0 touch-manipulation">
            <span>{lang === 'bn' ? 'মাস্টারি কুইজ শুরু করো' : 'FINAL 3-MCQ SPRINT'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>}
      </div>;
  }
  return null;
};
