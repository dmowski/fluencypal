const telegramMarkup = /[*_`[\]]/g;

const MAX_INTERESTS = 1000;
const MAX_CONTACT = 200;

export const plainCommunityCallText = (value: string, maxLength: number) =>
  value.replace(telegramMarkup, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);

export function readCommunityCallRequest(
  body: unknown,
): { interests: string; contact: string } | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Add your interests and a way to reach you.' };
  }
  const row = body as { interests?: unknown; contact?: unknown };
  const interests =
    typeof row.interests === 'string' ? plainCommunityCallText(row.interests, MAX_INTERESTS) : '';
  const contact =
    typeof row.contact === 'string' ? plainCommunityCallText(row.contact, MAX_CONTACT) : '';
  if (!interests) return { error: 'Add what you want to talk about.' };
  if (!contact) return { error: 'Add an email, Telegram, Instagram, or WhatsApp.' };
  return { interests, contact };
}

export function communityCallTelegramMessage(interests: string, contact: string) {
  return [
    'Group call request',
    '',
    'They want a free group call. Write them when you find people who fit, then pick a time that works for everyone.',
    `Interests: ${interests}`,
    `Contact: ${contact}`,
  ].join('\n');
}
