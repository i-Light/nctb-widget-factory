import { z } from 'zod';

export const RayOpticsPropsSchema = z.object({
  mode: z.enum(['explore', 'predict', 'formula', 'target_puzzle', 'exam_trap']),
  lensType: z.enum(['convex', 'concave']).default('convex'),
  initialFocalLengthCm: z.number().min(5).max(30).default(15),
  initialObjectDistCm: z.number().min(5).max(60).default(35),
  allowedFocalLengths: z.array(z.number().min(5).max(30)).min(1).default([10, 15, 20]),
  objectDistBounds: z
    .object({
      min: z.number().min(5),
      max: z.number().max(60),
      step: z.number().positive(),
    })
    .refine((b) => b.min < b.max, 'objectDistBounds.min must be < max')
    .default({ min: 8, max: 55, step: 1 }),
  lockedControls: z.array(z.enum(['lensType', 'focalLength', 'objectDist'])).default(['lensType']),
  targetGoal: z
    .enum(['none', 'real_magnification', 'screen_focus', 'dual_magnification'])
    .default('none'),
  targetMagnificationAbs: z.number().positive().optional(),
  /** Fixed cinema screen position on the image side (Card 4). */
  screenDistanceCm: z.number().min(10).max(60).optional(),
  screenToleranceCm: z.number().positive().default(0.5),
  /** Card 5 simultaneous overlay: real-image u, virtual-image u, and the misconception trap u. */
  replayObjectDistsCm: z
    .object({ real: z.number().positive(), virtual: z.number().positive(), trap: z.number().positive() })
    .optional(),
  requireRealImageOnScreen: z.boolean().default(true),
  tolerance: z.number().positive().default(0.1),
});

export type RayOpticsProps = z.infer<typeof RayOpticsPropsSchema>;
