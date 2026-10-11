import { sentSupportTelegramMessage } from '@/app/api/telegram/sendTelegramMessage';
import {
  communityCallTelegramMessage,
  readCommunityCallRequest,
} from '@/features/FluencyCall/communityCallRequest';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Add your interests and a way to reach you.' }, { status: 400 });
  }

  const parsed = readCommunityCallRequest(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  await sentSupportTelegramMessage({
    message: communityCallTelegramMessage(parsed.interests, parsed.contact),
  });

  return Response.json({ error: '' });
}
