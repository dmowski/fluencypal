import { sendTelegramRequest } from '@/features/Telegram/sendTextAiRequest';
import { buildCallJoinTelegramMessage } from './callTime';

export async function notifyFluencyCallJoin(
  call: { startsAtIso: string; languageCode?: string | null },
  token: string,
): Promise<void> {
  await sendTelegramRequest(
    { message: buildCallJoinTelegramMessage(call.startsAtIso, call.languageCode) },
    token,
  );
}
