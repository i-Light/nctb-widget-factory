'use client';

import React from 'react';
import seedManifest from '@/lessons/seeds/hsc-phy-p2-ch3-kirchhoff-01.json';
import { KirchhoffLessonManifestSchema } from '@/engine/schema';
import { PhoneCardRunner } from '@/engine/PhoneCardRunner';

const parsedManifest = KirchhoffLessonManifestSchema.parse(seedManifest);

export default function KirchhoffPlayPage() {
  return <PhoneCardRunner manifest={parsedManifest} />;
}
