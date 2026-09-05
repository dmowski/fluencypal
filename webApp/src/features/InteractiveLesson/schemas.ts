import { z } from 'zod';
import { READ_ALOUD_MIN_CONTENT_CHARS } from './constants';

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
    .refine((parts) => parts[0]?.type === 'read', {
      message: 'The first part must be a read explanation',
    })
    .refine((parts) => parts[1]?.type === 'speech', {
      message: 'The second part must be a read-aloud speech task',
    })
    .refine((parts) => (parts[1]?.contentMD.trim().length ?? 0) >= READ_ALOUD_MIN_CONTENT_CHARS, {
      message: 'The read-aloud text must be a longer passage',
    })
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
