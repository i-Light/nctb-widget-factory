import { z } from 'zod';

export const SliderBoundsSchema = z.object({
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
});

export const VectorRiverBoatPropsSchema = z.object({
  mode: z.enum(['explore', 'predict', 'formula', 'target_puzzle', 'exam_trap']),
  angleReference: z.enum(['stream', 'perpendicular']).default('stream'),
  riverWidth: z.number().min(20).max(500).default(120),
  initialStreamSpeed: z.number().min(1).max(20).default(3),
  initialBoatSpeed: z.number().min(2).max(25).default(6),
  initialHeadingDeg: z.number().min(30).max(150).default(90),
  boatSpeedBounds: SliderBoundsSchema.default({ min: 4, max: 10, step: 2 }),
  headingBounds: SliderBoundsSchema.default({ min: 60, max: 150, step: 15 }),
  lockedControls: z
    .array(z.enum(['streamSpeed', 'boatSpeed', 'heading']))
    .default(['streamSpeed']),
  showVectorParallelogram: z.boolean().default(true),
  targetGoal: z
    .enum(['none', 'zero_drift', 'min_time', 'target_drift'])
    .default('none'),
  targetDriftMeters: z.number().optional(),
  tolerance: z.number().positive().default(0.6),
});

export type VectorRiverBoatProps = z.infer<typeof VectorRiverBoatPropsSchema>;
