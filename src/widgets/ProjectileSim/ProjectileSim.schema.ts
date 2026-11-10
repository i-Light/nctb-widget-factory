import { z } from 'zod';

export const SliderBoundsSchema = z.object({
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
});

export const ProjectileCardPropsSchema = z.object({
  mode: z.enum(['explore', 'predict', 'formula', 'target_puzzle', 'exam_trap']),
  angleAxis: z.enum(['horizontal', 'vertical']).default('horizontal'),
  initialSpeed: z.number().min(5).max(50),
  initialAngle: z.number().min(5).max(85),
  gravity: z.number().min(1.6).max(25).default(10),
  speedBounds: SliderBoundsSchema.default({ min: 10, max: 30, step: 5 }),
  angleBounds: SliderBoundsSchema.default({ min: 15, max: 75, step: 15 }),
  lockedControls: z.array(z.enum(['speed', 'angle', 'gravity'])).default([]),
  showVectorComponents: z.boolean().default(true),
  targetMetric: z.enum(['none', 'range', 'maxHeight']).default('none'),
  targetValue: z.number().nonnegative().optional(),
  tolerance: z.number().positive().default(0.5),
});

export type ProjectileCardProps = z.infer<typeof ProjectileCardPropsSchema>;
