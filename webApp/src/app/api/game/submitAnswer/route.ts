import { SubmitAnswerRequest } from '@/features/Game/types';
import { validateAuthToken } from '../../config/firebase';
import { submitAnswer } from '@/features/Game/api/submitAnswer';
import { captureServerException } from '@/libs/sentry/captureServerException';

export async function POST(request: Request) {
  try {
    const userInfo = await validateAuthToken(request);
    const data = (await request.json()) as SubmitAnswerRequest;
    const response = await submitAnswer({ data, userInfo });
    return Response.json(response);
  } catch (error) {
    await captureServerException(error, {
      tags: { area: 'game', op: 'submitAnswer' },
    });
    const message = error instanceof Error ? error.message : 'Failed to submit answer';
    const isDeadline =
      typeof message === 'string' && message.toUpperCase().includes('DEADLINE_EXCEEDED');
    return Response.json(
      { error: isDeadline ? 'Request timed out. Please try again.' : message },
      { status: isDeadline ? 504 : 500 },
    );
  }
}
