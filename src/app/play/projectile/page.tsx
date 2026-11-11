'use client';

import React from 'react';
import seedManifest from '@/lessons/seeds/hsc-phy-p1-ch3-projectile-01.json';
import { LessonManifestSchema } from '@/engine/schema';
import { PhoneCardRunner } from '@/engine/PhoneCardRunner';

const parsedManifest = LessonManifestSchema.parse(seedManifest);

export default function ProjectilePlayPage() {
  return <PhoneCardRunner manifest={parsedManifest} />;
}
