import { processAssessment } from '@/features/ProgressStat/backend/processAssessment';

export const maxDuration = 300;

export async function GET(request: Request) {
  await processAssessment();
  return new Response('Hello, Assessment!', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
