'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Check, ChevronRight, Share2 } from 'lucide-react';
import { sfx } from './audio';

export interface McqItem {
  id: string;
  prompt: { en: string; bn: string };
  options: Array<{ en: string; bn: string }>;
  correctIndex: number;
  explanation: { en: string; bn: string };
}

export const PhoneSprintCard: React.FC<{
  lang: 'en' | 'bn';
  xpReward: number;
  questions: McqItem[];
  mcqIdx: number;
  mcqChoice: number | null;
  mcqScore: number;
  xpEarned: number;
  lessonFinished: boolean;
  onPickOption: (idx: number, isRight: boolean) => void;
  onAdvanceMcq: () => void;
  onShareMastery: () => void;
}> = ({
  lang,
  xpReward,
  questions,
  mcqIdx,
  mcqChoice,
  mcqScore,
  xpEarned,
  lessonFinished,
  onPickOption,
  onAdvanceMcq,
  onShareMastery,
}) => {
  if (lessonFinished) {
    return (
      <div className="space-y-3 rounded-3xl border-2 border-emerald-500 bg-white p-5 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Award className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">
          {lang === 'bn' ? 'অধ্যায় সম্পন্ন!' : 'Lesson Mastered!'}
        </h2>
        <p className="text-xs font-bold text-slate-600">
          {lang === 'bn'
            ? `স্কোর: ${mcqScore}/৩ · অর্জিত +${xpEarned} XP`
            : `Sprint Score: ${mcqScore}/3 · Earned +${xpEarned} XP`}
        </p>
        <button
          type="button"
          onClick={onShareMastery}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-sm font-extrabold text-white active:translate-y-1 active:border-b-0 touch-manipulation"
        >
          <Share2 className="h-4 w-4" />
          <span>
            {lang === 'bn'
              ? 'হোয়াটসঅ্যাপে মাস্টারি ব্যাজ শেয়ার করো'
              : 'SHARE MASTERY TO WHATSAPP'}
          </span>
        </button>
        <Link
          href="/"
          className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-700"
        >
          {lang === 'bn' ? 'হোম ল্যাবে ফিরে যাও' : 'Back to Physics Lab'}
        </Link>
      </div>
    );
  }

  const q = questions[mcqIdx];
  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between text-xs font-extrabold text-teal-800">
        <span>
          {lang === 'bn' ? `প্রশ্ন ${mcqIdx + 1} / ৩` : `Question ${mcqIdx + 1} of 3`}
        </span>
        <span>+{xpReward} XP</span>
      </div>
      <p className="text-sm font-bold leading-snug text-slate-900">{q.prompt[lang]}</p>
      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt, oIdx) => {
          const picked = mcqChoice === oIdx;
          const right = oIdx === q.correctIndex;
          return (
            <button
              key={oIdx}
              type="button"
              disabled={mcqChoice !== null}
              onClick={() => {
                if (right) sfx.chime();
                else sfx.nudge();
                onPickOption(oIdx, right);
              }}
              className={`flex min-h-[48px] items-center justify-between rounded-xl border-2 border-b-4 px-3.5 text-left text-xs font-extrabold transition touch-manipulation ${
                mcqChoice === null
                  ? 'border-slate-200 bg-slate-50 text-slate-800 active:translate-y-0.5'
                  : right
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                  : picked
                  ? 'border-rose-400 bg-rose-50 text-rose-950'
                  : 'border-slate-100 bg-white text-slate-400'
              }`}
              >
              <span>{opt[lang]}</span>
              {mcqChoice !== null && right && <Check className="h-4 w-4 text-emerald-600" />}
            </button>
          );
        })}
      </div>
      {mcqChoice !== null && (
        <div className="space-y-2">
          <p className="rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-700">
            {q.explanation[lang]}
          </p>
          <button
            type="button"
            onClick={onAdvanceMcq}
            className="flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-sm font-extrabold text-white active:translate-y-1 active:border-b-0 touch-manipulation"
          >
            <span>
              {mcqIdx < 2
                ? lang === 'bn'
                  ? 'পরের প্রশ্ন'
                  : 'NEXT QUESTION'
                : lang === 'bn'
                ? 'মাস্টারি ট্রফি দেখো'
                : 'CLAIM MASTERY TROPHY'}
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
