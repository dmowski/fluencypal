import { z } from 'zod';

export const generatedLessonSchema = z.object({
  title: z.string().min(1),
  subTitle: z.string().min(1),
  parts: z
    .array(
      z.object({
        contentMD: z.string().min(1),
        type: z.enum(['read', 'speech']),
      }),
    )
    .min(3)
    .max(12)
    .refine((parts) => parts[parts.length - 1]?.type === 'speech', {
      message: 'The last part must be an open speech task',
    }),
});

export const speechFeedbackSchema = z.object({
  aiResultToUser: z.string().min(1),
});

export const lessonResultsSchema = z.object({
  motivationTextToUserMD: z.string().min(1),
  whatWentWellMD: z.string().min(1),
});

export type GeneratedLessonDraft = z.infer<typeof generatedLessonSchema>;
