import { z } from 'zod';

export const KirchhoffPropsSchema = z.object({
  mode: z.enum(['explore', 'predict', 'formula', 'target_puzzle', 'exam_trap']),
  topology: z.enum(['series', 'parallel', 'wheatstone']).default('parallel'),
  supplyVoltage: z.number().min(1).max(48).default(12),
  initialR1: z.number().positive().default(6),
  initialR2: z.number().positive().default(6),
  allowedResistorValues: z.array(z.number().positive()).default([3, 6, 12, 24]),
  bridgeArms: z
    .object({
      P: z.number().positive(),
      Q: z.number().positive(),
      R: z.number().positive(),
      SInitial: z.number().positive(),
    })
    .optional(),
  lockedControls: z.array(z.enum(['topology', 'R1', 'R2'])).default([]),
  targetMetric: z.enum(['none', 'totalCurrent', 'equivalentResistance', 'bridgeBalance']).default('none'),
  targetValue: z.number().nonnegative().optional(),
  tolerance: z.number().positive().default(0.15),
});

export type KirchhoffProps = z.infer<typeof KirchhoffPropsSchema>;
