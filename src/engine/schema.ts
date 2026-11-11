import { z } from 'zod';
import { ProjectileCardPropsSchema } from '@/widgets/ProjectileSim/ProjectileSim.schema';
import { VectorRiverBoatPropsSchema } from '@/widgets/VectorRiverBoatSim/VectorRiverBoatSim.schema';
import { KirchhoffPropsSchema } from '@/widgets/KirchhoffCircuitBoard/KirchhoffCircuitBoard.schema';

export const BilingualTextSchema = z.object({
  en: z.string().min(1).max(180),
  bn: z.string().min(1).max(220),
});

export const McqQuestionSchema = z.object({
  id: z.string(),
  prompt: BilingualTextSchema,
  options: z.array(BilingualTextSchema).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: BilingualTextSchema,
});

export const SeeWhyStepSchema = z.object({
  title: BilingualTextSchema,
  latex: z.string(),
  note: BilingualTextSchema,
});

export function createLessonCardSchema<T extends z.ZodTypeAny>(widgetPropsSchema: T) {
  return z.discriminatedUnion('cardStage', [
    z.object({
      cardNumber: z.literal(1),
      cardStage: z.literal('zero_fail_toy'),
      prompt: BilingualTextSchema,
      widgetProps: widgetPropsSchema,
    }),
    z.object({
      cardNumber: z.literal(2),
      cardStage: z.literal('prediction_hook'),
      prompt: BilingualTextSchema,
      options: z.array(BilingualTextSchema).min(2).max(4),
      correctOptionIndex: z.number().int().min(0),
      widgetProps: widgetPropsSchema,
    }),
    z.object({
      cardNumber: z.literal(3),
      cardStage: z.literal('formula_lock_in'),
      prompt: BilingualTextSchema,
      targetFormulaLatex: z.string(),
      availableTokens: z.array(z.string()).min(3),
      correctTokenOrder: z.array(z.string()).min(2),
      seeWhySteps: z.array(SeeWhyStepSchema).min(1),
      widgetProps: widgetPropsSchema,
    }),
    z.object({
      cardNumber: z.literal(4),
      cardStage: z.literal('guided_manipulation'),
      prompt: BilingualTextSchema,
      requiresSubscriptionOnFreeLink: z.boolean().default(true),
      seeWhySteps: z.array(SeeWhyStepSchema).optional(),
      widgetProps: widgetPropsSchema,
    }),
    z.object({
      cardNumber: z.literal(5),
      cardStage: z.literal('exam_trap'),
      prompt: BilingualTextSchema,
      boardReference: z.string(),
      options: z
        .array(
          z.object({
            label: BilingualTextSchema,
            simulatedAngleDeg: z.number().default(0),
            isTrapMisconception: z.boolean().default(false),
            feedback: BilingualTextSchema,
          })
        )
        .min(2),
      correctOptionIndex: z.number().int().min(0),
      seeWhySteps: z.array(SeeWhyStepSchema).min(1),
      widgetProps: widgetPropsSchema,
    }),
    z.object({
      cardNumber: z.literal(6),
      cardStage: z.literal('skills_check'),
      prompt: BilingualTextSchema,
      xpReward: z.number().int().min(10).max(100),
      questions: z.array(McqQuestionSchema).length(3),
    }),
  ]);
}

export const LessonCardSchema = createLessonCardSchema(ProjectileCardPropsSchema);

export const LessonManifestSchema = z.object({
  lessonId: z.string().regex(/^[a-z0-9-]+$/),
  wedge: z.literal('ssc-hsc-physics'),
  paper: z.union([z.literal(1), z.literal(2)]),
  chapterNumber: z.number().int().min(1).max(14),
  chapterTitle: BilingualTextSchema,
  lessonTitle: BilingualTextSchema,
  widgetType: z.literal('ProjectileSim'),
  estimatedMinutes: z.number().min(4).max(12),
  boardExamTag: z.string(),
  cards: z.array(LessonCardSchema).length(6),
});

export const RiverBoatLessonCardSchema = createLessonCardSchema(
  VectorRiverBoatPropsSchema
);

export const RiverBoatLessonManifestSchema = z.object({
  lessonId: z.string().regex(/^[a-z0-9-]+$/),
  wedge: z.literal('ssc-hsc-physics'),
  paper: z.union([z.literal(1), z.literal(2)]),
  chapterNumber: z.number().int().min(1).max(14),
  chapterTitle: BilingualTextSchema,
  lessonTitle: BilingualTextSchema,
  widgetType: z.literal('VectorRiverBoatSim'),
  estimatedMinutes: z.number().min(4).max(12),
  boardExamTag: z.string(),
  cards: z.array(RiverBoatLessonCardSchema).length(6),
});

export const KirchhoffLessonCardSchema = createLessonCardSchema(
  KirchhoffPropsSchema
);

export const KirchhoffLessonManifestSchema = z.object({
  lessonId: z.string().regex(/^[a-z0-9-]+$/),
  wedge: z.literal('ssc-hsc-physics'),
  paper: z.union([z.literal(1), z.literal(2)]),
  chapterNumber: z.number().int().min(1).max(14),
  chapterTitle: BilingualTextSchema,
  lessonTitle: BilingualTextSchema,
  widgetType: z.literal('KirchhoffCircuitBoard'),
  estimatedMinutes: z.number().min(4).max(12),
  boardExamTag: z.string(),
  cards: z.array(KirchhoffLessonCardSchema).length(6),
});

export type LessonManifest = z.infer<typeof LessonManifestSchema>;
export type LessonCard = z.infer<typeof LessonCardSchema>;
export type RiverBoatLessonManifest = z.infer<typeof RiverBoatLessonManifestSchema>;
export type RiverBoatLessonCard = z.infer<typeof RiverBoatLessonCardSchema>;
export type KirchhoffLessonManifest = z.infer<typeof KirchhoffLessonManifestSchema>;
export type KirchhoffLessonCard = z.infer<typeof KirchhoffLessonCardSchema>;
