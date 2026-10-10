import { sendTelegramRequest } from '@/features/Telegram/sendTextAiRequest';
import { buildCallJoinTelegramMessage } from './callTime';

const FOUNDER_EMAIL = 'dmowski.alex@gmail.com';

/** The founder joining their own call should not ping Telegram. */
export function isFluencyCallJoinNoticeSkipped(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === FOUNDER_EMAIL;
}

export async function notifyFluencyCallJoin(
  call: { startsAtIso: string; languageCode?: string | null },
  token: string,
  email?: string | null,
): Promise<void> {
  if (isFluencyCallJoinNoticeSkipped(email)) return;
  await sendTelegramRequest(
    { message: buildCallJoinTelegramMessage(call.startsAtIso, call.languageCode) },
    token,
  );
}
