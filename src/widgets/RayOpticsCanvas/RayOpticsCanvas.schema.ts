import { z } from 'zod';

export const RayOpticsPropsSchema = z.object({
  mode: z.enum(['explore', 'predict', 'formula', 'target_puzzle', 'exam_trap']),
  lensType: z.enum(['convex', 'concave']).default('convex'),
  initialFocalLengthCm: z.number().min(5).max(30).default(15),
  initialObjectDistCm: z.number().min(5).max(70).default(35),
  allowedFocalLengths: z.array(z.number().positive()).default([10, 15, 20]),
  objectDistBounds: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    step: z.number().positive(),
  }).default({ min: 10, max: 60, step: 5 }),
  lockedControls: z.array(z.enum(['lensType', 'focalLength', 'objectDist'])).default(['lensType']),
  targetGoal: z.enum(['none', 'real_magnification', 'screen_distance']).default('none'),
  targetMagnificationAbs: z.number().positive().optional(),
  requireRealImageOnScreen: z.boolean().default(true),
  tolerance: z.number().positive().default(0.1),
});

export type RayOpticsProps = z.infer<typeof RayOpticsPropsSchema>;
