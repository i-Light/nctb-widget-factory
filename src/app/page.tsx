'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Aperture, Compass, Flame, Zap, ChevronRight, Lock } from 'lucide-react';
import projectileSeed from '@/lessons/seeds/hsc-phy-p1-ch3-projectile-01.json';
import riverBoatSeed from '@/lessons/seeds/hsc-phy-p1-ch2-riverboat-01.json';
import kirchhoffSeed from '@/lessons/seeds/hsc-phy-p2-ch3-kirchhoff-01.json';
import rayOpticsSeed from '@/lessons/seeds/hsc-phy-p2-ch6-rayoptics-01.json';
import kinematicsSeed from '@/lessons/seeds/hsc-phy-p1-ch3-graphs-01.json';
import balancerSeed from '@/lessons/seeds/hsc-phy-p1-ch6-balancer-01.json';
import { useLang } from '@/engine/useLang';

const LESSONS = [
  { href: '/play/kinematics', seed: kinematicsSeed, Icon: Activity, tag: 'NEW v2 · HSC P1 Ch-3', card: 'border-emerald-600', icon: 'bg-emerald-600 text-white', badge: 'bg-emerald-100 text-emerald-900', chevron: 'text-emerald-700' },
  { href: '/play/rayoptics', seed: rayOpticsSeed, Icon: Aperture, tag: 'v2 Ready · HSC P2 Ch-6', card: 'border-sky-600', icon: 'bg-slate-900 text-sky-300', badge: 'bg-sky-100 text-sky-900', chevron: 'text-sky-700' },
  { href: '/play/kirchhoff', seed: kirchhoffSeed, Icon: Zap, tag: 'v2 Ready · HSC P2 Ch-3', card: 'border-amber-500', icon: 'bg-amber-500 text-slate-950', badge: 'bg-amber-100 text-amber-900', chevron: 'text-amber-700' },
  { href: '/play/riverboat', seed: riverBoatSeed, Icon: Compass, tag: 'v2 Ready · HSC P1 Ch-2', card: 'border-teal-600', icon: 'bg-teal-600 text-white', badge: 'bg-emerald-100 text-emerald-800', chevron: 'text-teal-700' },
  { href: '/play/projectile', seed: projectileSeed, Icon: Flame, tag: 'v2 Ready · HSC P1 Ch-3', card: 'border-slate-200', icon: 'bg-emerald-500 text-white', badge: 'bg-teal-100 text-teal-800', chevron: 'text-slate-500' },
];

const T = {
  en: {
    title: 'Physics at Your Thumb — One-Thumb Interactive Labs',
    subtitle: '6-card interactive board-trap lessons built strictly for smartphones.',
    ready: 'Phone-Only v2 Ready (Tap to Play)',
    upNext: 'Up Next in Phone-Only v2 Queue',
    footer: '360×800 – 430×932 Portrait Smartphone Exclusive · Offline-Ready',
  },
  bn: {
    title: 'হাতের এক আঙুলে পদার্থবিজ্ঞান',
    subtitle: 'শুধু স্মার্টফোনের জন্য তৈরি ৬-কার্ডের ইন্টারঅ্যাকটিভ বোর্ড-ট্র্যাপ পাঠ।',
    ready: 'ফোন-অনলি v2 প্রস্তুত (খেলতে ট্যাপ করো)',
    upNext: 'পরবর্তী v2 পাঠ',
    footer: '৩৬০×৮০০ – ৪৩০×৯৩২ পোর্ট্রেট স্মার্টফোন · অফলাইনে চলে',
  },
} as const;

export default function HomePage() {
  const { lang, toggleLang } = useLang();
  const t = T[lang];
  return (
    <main className="flex min-h-[100dvh] w-full flex-col justify-between bg-[#F7F7F5] px-4 py-4 select-none">
      <div className="space-y-4">
        <header className="rounded-3xl bg-[#0F3D3E] p-4 text-white shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
              SSC / HSC Physics · Phone-Only v2 Lab
            </p>
            <button
              type="button"
              aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখাও'}
              onClick={toggleLang}
              className="-mr-1 -mt-1 flex h-11 min-w-[48px] shrink-0 items-center justify-center rounded-xl border border-teal-300/40 bg-white/10 px-2.5 text-xs font-extrabold text-white active:scale-95 touch-manipulation"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>
          </div>
          <h1 className="mt-1 text-lg font-extrabold leading-snug">{t.title}</h1>
          <p className="mt-1 text-xs text-teal-100/90">{t.subtitle}</p>
        </header>

        <section className="space-y-2.5">
          <h2 className="px-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">{t.ready}</h2>

          {LESSONS.map(({ href, seed, Icon, tag, card, icon, badge, chevron }) => (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[84px] items-center justify-between gap-3 rounded-2xl border-2 border-b-4 bg-white p-3.5 active:translate-y-0.5 active:border-b-2 transition touch-manipulation ${card}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${icon}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${badge}`}>{tag}</span>
                  <h3 className="mt-0.5 text-sm font-extrabold text-slate-900">{seed.chapterTitle[lang]}</h3>
                  <p className="text-xs font-medium text-slate-600">{seed.lessonTitle[lang]}</p>
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 shrink-0 ${chevron}`} />
            </Link>
          ))}
        </section>

        <section className="space-y-2">
          <h2 className="px-1 text-xs font-extrabold uppercase tracking-wider text-slate-400">{t.upNext}</h2>
          <div className="flex min-h-[48px] items-center justify-between rounded-2xl border border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs font-bold text-slate-500">
            <span>Widget #6 · {balancerSeed.chapterTitle[lang]} (FormulaBalancer)</span>
            <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          </div>
        </section>
      </div>

      <footer className="pt-3 text-center text-[11px] font-semibold text-slate-400">{t.footer}</footer>
    </main>
  );
}
