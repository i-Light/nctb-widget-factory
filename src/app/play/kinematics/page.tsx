'use client';

import React from 'react';
import seedManifest from '@/lessons/seeds/hsc-phy-p1-ch3-graphs-01.json';
import { KinematicsLessonManifestSchema } from '@/engine/schema';
import { PhoneCardRunner } from '@/engine/PhoneCardRunner';

const parsedManifest = KinematicsLessonManifestSchema.parse(seedManifest);

export default function KinematicsPlayPage() {
  return <PhoneCardRunner manifest={parsedManifest} />;
}
