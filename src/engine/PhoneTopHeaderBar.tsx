'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, Sliders, Volume2, VolumeX } from 'lucide-react';
import { sfx } from './audio';

export const PhoneTopHeaderBar: React.FC<{
  cardCount: number;
  cardIdx: number;
  streak: number;
  muted: boolean;
  lang: 'en' | 'bn';
  onSelectCard: (idx: number) => void;
  onToggleMute: () => void;
  onToggleLang: () => void;
  onOpenStudio: () => void;
}> = ({
  cardCount,
  cardIdx,
  streak,
  muted,
  lang,
  onSelectCard,
  onToggleMute,
  onToggleLang,
  onOpenStudio,
}) => (
  <header className="flex min-h-[44px] items-center justify-between gap-2">
    <Link
      href="/"
      aria-label="Back to lessons"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-95 touch-manipulation"
    >
      <ArrowLeft className="h-4 w-4" />
    </Link>

    <div className="flex flex-1 items-center gap-1 px-1">
      {Array.from({ length: cardCount }, (_, idx) => (
        <button
          key={idx}
          type="button"
          aria-label={`Card ${idx + 1}`}
          onClick={() => {
            sfx.tick(0.9 + idx * 0.05);
            onSelectCard(idx);
          }}
          className={`h-2.5 flex-1 rounded-full transition-all touch-manipulation ${
            idx < cardIdx ? 'bg-emerald-500' : idx === cardIdx ? 'bg-teal-600' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>

    <div className="flex shrink-0 items-center gap-1">
      <span className="flex h-9 items-center gap-0.5 rounded-xl bg-amber-100 px-2 text-xs font-extrabold text-amber-800">
        <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
        {streak}
      </span>
      <button
        type="button"
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        onClick={onToggleMute}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-95 touch-manipulation"
      >
        {muted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4 text-teal-700" />}
      </button>
      <button
        type="button"
        onClick={onToggleLang}
        className="flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-extrabold text-slate-800 active:scale-95 touch-manipulation"
      >
        {lang === 'bn' ? 'EN' : '\u09ac\u09be\u0982'}
      </button>
      <button
        type="button"
        aria-label="Open Studio & Gate 2 Evals"
        onClick={onOpenStudio}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-900 text-teal-300 active:scale-95 touch-manipulation"
      >
        <Sliders className="h-4 w-4" />
      </button>
    </div>
  </header>
);
