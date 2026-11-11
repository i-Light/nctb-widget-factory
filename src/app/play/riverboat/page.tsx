'use client';

import React from 'react';
import seedManifest from '@/lessons/seeds/hsc-phy-p1-ch2-riverboat-01.json';
import { RiverBoatLessonManifestSchema } from '@/engine/schema';
import { PhoneCardRunner } from '@/engine/PhoneCardRunner';

const parsedManifest = RiverBoatLessonManifestSchema.parse(seedManifest);

export default function RiverBoatPlayPage() {
  return <PhoneCardRunner manifest={parsedManifest} />;
}
