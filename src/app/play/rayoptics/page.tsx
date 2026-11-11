'use client';

import React from 'react';
import seedManifest from '@/lessons/seeds/hsc-phy-p2-ch6-rayoptics-01.json';
import { RayOpticsLessonManifestSchema } from '@/engine/schema';
import { PhoneCardRunner } from '@/engine/PhoneCardRunner';

const parsedManifest = RayOpticsLessonManifestSchema.parse(seedManifest);

export default function RayOpticsPlayPage() {
  return <PhoneCardRunner manifest={parsedManifest} />;
}
