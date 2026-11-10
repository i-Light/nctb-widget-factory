import { z } from 'zod';

export const FormulaBalancerPropsSchema = z.object({
  mode: z.enum(['explore', 'predict', 'formula', 'target_puzzle', 'exam_trap']),
  lawPreset: z.enum(['gravitation', 'kinetic_energy', 'pendulum']).default('gravitation'),
  numeratorPower: z.number().default(1),
  denominatorPower: z.number().default(2),
  initialNumFactor: z.number().positive().default(1),
  initialDenFactor: z.number().positive().default(2),
  allowedNumFactors: z.array(z.number().positive()).default([1, 2, 4]),
  allowedDenFactors: z.array(z.number().positive()).default([0.5, 1, 2, 3]),
  targetRatio: z.number().positive().optional(),
  tolerance: z.number().positive().default(0.05),
});

export type FormulaBalancerProps = z.infer<typeof FormulaBalancerPropsSchema>;
