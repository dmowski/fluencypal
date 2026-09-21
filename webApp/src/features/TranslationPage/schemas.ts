import { z } from 'zod';

export const usageExamplesSchema = z.object({
  examples: z.array(z.string().min(1)).length(5),
});

export type UsageExamplesDraft = z.infer<typeof usageExamplesSchema>;
