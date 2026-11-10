import { z } from 'zod';

export const KinematicsGraphPropsSchema = z.object({
  mode: z.enum(['explore', 'predict', 'formula', 'target_puzzle', 'exam_trap']),
  stageDurationSec: z.number().positive().default(4),
  initialV0: z.number().min(-20).max(25).default(0),
  initialV1: z.number().min(-20).max(25).default(10),
  initialV2: z.number().min(-20).max(25).default(5),
  velocityBounds: z.object({
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
  }).default({ min: 0, max: 20, step: 5 }),
  lockedNodes: z.array(z.enum(['v0', 'v1', 'v2'])).default(['v0']),
  requireZeroStage2Accel: z.boolean().default(false),
  targetDisplacementMeters: z.number().optional(),
  tolerance: z.number().positive().default(0.5),
});

export type KinematicsGraphProps = z.infer<typeof KinematicsGraphPropsSchema>;
