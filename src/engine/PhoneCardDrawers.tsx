'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, X } from 'lucide-react';

export interface ProofStepItem {
  title: { en: string; bn: string };
  latex: string;
  note: { en: string; bn: string };
}

export const PhoneProofBottomSheet: React.FC<{
  lang: 'en' | 'bn';
  steps: ProofStepItem[];
  onClose: () => void;
}> = ({ lang, steps, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45"
    onClick={onClose}
  >
    <div
      className="max-h-[80dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white p-4 pb-6 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">
          {lang === 'bn' ? 'NCTB ২-ধাপে গাণিতিক ব্যাখ্যা' : 'NCTB 2-Step Derivation'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, sIdx) => (
          <div key={sIdx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-extrabold text-teal-900">{step.title[lang]}</p>
            <p className="my-1.5 rounded-xl bg-white px-3 py-2 font-mono text-xs font-bold text-slate-900">
              {step.latex}
            </p>
            <p className="text-xs font-medium text-slate-600">{step.note[lang]}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PhoneStudioBottomSheet: React.FC<{
  lessonId: string;
  passed: boolean;
  simulatedHallucination: string | null;
  onRunHallucinationDemo: () => void;
  onClose: () => void;
}> = ({ lessonId, passed, simulatedHallucination, onRunHallucinationDemo, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45"
    onClick={onClose}
  >
    <div
      className="max-h-[82dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white p-4 pb-6 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Gate 1 (Zod) & Gate 2 (Math Solver)
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
          <p className="font-extrabold">
            Manifest `{lessonId}`: {passed ? 'PASSED 100%' : 'FAILED'}
          </p>
          <p className="mt-1 text-[11px] text-emerald-800">
            All 6 cards verified for discrete thumb-step reachability, 16-word phone prompt budget, obstacle clearance, and board trap alignment.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunHallucinationDemo}
          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border-b-4 border-slate-950 bg-slate-900 px-3 font-extrabold text-teal-300 active:translate-y-0.5 active:border-b-0 touch-manipulation"
        >
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <span>Test Simulated AI Math Hallucination</span>
        </button>

        {simulatedHallucination && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 font-semibold text-rose-950">
            <p className="font-extrabold text-rose-700">Gate 2 Blocked Bad AI Config:</p>
            <p className="mt-1">{simulatedHallucination}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
