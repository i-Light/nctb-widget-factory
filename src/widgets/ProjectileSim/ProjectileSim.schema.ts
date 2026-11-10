import { z } from 'zod';

export const ProjectileCardPropsSchema = z.object({
  mode: z.enum(['sandbox', 'target', 'verticalTrap', 'misconceptionReplay']).default('sandbox'),
  angleAxis: z.enum(['horizontal', 'vertical']).default('horizontal'),
  initialSpeed: z.number().min(0).max(100).default(25),
  initialAngle: z.number().min(0).max(90).default(45),
  gravity: z.number().positive().default(9.8),
  speedBounds: z.tuple([z.number(), z.number()]).default([5, 50]),
  angleBounds: z.tuple([z.number(), z.number()]).default([0, 90]),
  lockedControls: z.array(z.string()).default([]),
  showVectorComponents: z.boolean().default(true),
  targetMetric: z.enum(['range', 'peakHeight', 'flightTime', 'none']).default('none'),
  targetValue: z.number().optional(),
  tolerance: z.number().default(0.05)
});

export type ProjectileCardProps = z.infer<typeof ProjectileCardPropsSchema>;
