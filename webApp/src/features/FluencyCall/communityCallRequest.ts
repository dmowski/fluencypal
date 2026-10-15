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

/** Signed-in senders attach a Firebase ID token. Guests omit it and stay unnamed. */
export async function readCommunityCallUserId(
  request: Request,
  readUser: (request: Request) => Promise<{ uid: string }>,
): Promise<string | undefined> {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  if (!token) return undefined;
  try {
    const user = await readUser(request);
    const uid = user.uid.trim();
    return uid || undefined;
  } catch {
    console.warn('Community call request auth token could not be read');
    return undefined;
  }
}
