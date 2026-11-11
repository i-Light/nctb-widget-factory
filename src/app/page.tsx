import React from 'react';
import Link from 'next/link';
import { Compass, Flame, Zap, ChevronRight, Lock } from 'lucide-react';
import projectileSeed from '@/lessons/seeds/hsc-phy-p1-ch3-projectile-01.json';
import riverBoatSeed from '@/lessons/seeds/hsc-phy-p1-ch2-riverboat-01.json';
import kirchhoffSeed from '@/lessons/seeds/hsc-phy-p2-ch3-kirchhoff-01.json';

export default function HomePage() {
  return (
    <main className="flex min-h-[100dvh] w-full flex-col justify-between bg-[#F7F7F5] px-4 py-4 select-none">
      <div className="space-y-4">
        <header className="rounded-3xl bg-[#0F3D3E] p-4 text-white shadow-xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
            SSC / HSC Physics · Phone-Only v2 Lab
          </p>
          <h1 className="mt-1 text-lg font-extrabold leading-snug">
            হাতের এক আঙুলে পদার্থবিজ্ঞান (One-Thumb Interactive Labs)
          </h1>
          <p className="mt-1 text-xs text-teal-100/90">
            6-card interactive board-trap lessons built strictly for smartphones.
          </p>
        </header>

        <section className="space-y-2.5">
          <h2 className="px-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Phone-Only v2 Ready (Tap to Play)
          </h2>

          <Link
            href="/play/kirchhoff"
            className="flex min-h-[84px] items-center justify-between gap-3 rounded-2xl border-2 border-amber-500 border-b-4 bg-white p-3.5 active:translate-y-0.5 active:border-b-2 transition touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                  NEW v2 · HSC P2 Ch-3
                </span>
                <h3 className="mt-0.5 text-sm font-extrabold text-slate-900">
                  {kirchhoffSeed.chapterTitle.bn}
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  {kirchhoffSeed.lessonTitle.en}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-amber-700" />
          </Link>

          <Link
            href="/play/riverboat"
            className="flex min-h-[84px] items-center justify-between gap-3 rounded-2xl border-2 border-teal-600 border-b-4 bg-white p-3.5 active:translate-y-0.5 active:border-b-2 transition touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                  v2 Ready · HSC P1 Ch-2
                </span>
                <h3 className="mt-0.5 text-sm font-extrabold text-slate-900">
                  {riverBoatSeed.chapterTitle.bn}
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  {riverBoatSeed.lessonTitle.en}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-teal-700" />
          </Link>

          <Link
            href="/play/projectile"
            className="flex min-h-[84px] items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 border-b-4 bg-white p-3.5 active:translate-y-0.5 active:border-b-2 transition touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-extrabold text-teal-800">
                  v2 Ready · HSC P1 Ch-3
                </span>
                <h3 className="mt-0.5 text-sm font-extrabold text-slate-900">
                  {projectileSeed.chapterTitle.bn}
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  {projectileSeed.lessonTitle.en}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
          </Link>
        </section>

        <section className="space-y-2">
          <h2 className="px-1 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Up Next in Phone-Only v2 Queue
          </h2>
          {[
            'Widget #4 · জ্যামিতিক আলোকবিজ্ঞান (RayOpticsCanvas)',
            'Widget #5 · গতি লেখচিত্র (KinematicsGraphMatcher)',
            'Widget #6 · মহাকর্ষ ও অভিকর্ষ (FormulaBalancer)',
          ].map((item) => (
            <div
              key={item}
              className="flex min-h-[48px] items-center justify-between rounded-2xl border border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs font-bold text-slate-500"
            >
              <span>{item}</span>
              <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </div>
          ))}
        </section>
      </div>

      <footer className="pt-3 text-center text-[11px] font-semibold text-slate-400">
        360×800 – 430×932 Portrait Smartphone Exclusive · Offline-Ready
      </footer>
    </main>
  );
}
