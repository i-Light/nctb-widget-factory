import React from 'react';
import seedLesson from '@/lessons/seeds/hsc-phy-p1-ch3-projectile-01.json';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-bold text-teal-950">
        {seedLesson.chapterTitle.bn}
      </h1>
      <p className="mt-1 text-sm text-slate-600">{seedLesson.lessonTitle.en}</p>
    </main>
  );
}
