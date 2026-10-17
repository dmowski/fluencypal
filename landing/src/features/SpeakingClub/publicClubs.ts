const APP_ORIGIN = process.env.FLUENCY_APP_ORIGIN || 'https://app.fluencypal.com';

export type PublicSpeakingClub = {
  slug: string;
  title: string;
  subtitle: string;
  previewImageUrl: string;
  reviewMode: 'allMembers' | 'alexOnly';
  joinPromptMarkdown: string;
  rulesMarkdown: string;
  discussMarkdown: string;
  memberCount: number;
  messagesLast7Days: number;
};

const isSlug = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 60;

const asText = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export const toPublicSpeakingClub = (value: unknown): PublicSpeakingClub | null => {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const slug = asText(row.slug, 60);
  const title = asText(row.title, 80);
  if (!isSlug(slug) || title.length < 2) return null;
  const previewImageUrl = asText(row.previewImageUrl, 500);
  return {
    slug,
    title,
    subtitle: asText(row.subtitle, 160),
    previewImageUrl: previewImageUrl.startsWith('https://') ? previewImageUrl : '',
    reviewMode: row.reviewMode === 'alexOnly' ? 'alexOnly' : 'allMembers',
    joinPromptMarkdown: asText(row.joinPromptMarkdown, 8000),
    rulesMarkdown: asText(row.rulesMarkdown, 8000),
    discussMarkdown: asText(row.discussMarkdown, 8000),
    memberCount:
      typeof row.memberCount === 'number' && Number.isFinite(row.memberCount)
        ? Math.max(0, Math.min(5000, Math.floor(row.memberCount)))
        : 0,
    messagesLast7Days:
      typeof row.messagesLast7Days === 'number' && Number.isFinite(row.messagesLast7Days)
        ? Math.max(0, Math.min(100000, Math.floor(row.messagesLast7Days)))
        : 0,
  };
};

export const fetchPublicSpeakingClubs = async (): Promise<PublicSpeakingClub[]> => {
  try {
    const response = await fetch(`${APP_ORIGIN}/api/speaking-clubs/public`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { clubs?: unknown };
    if (!Array.isArray(body.clubs)) return [];
    return body.clubs
      .map(toPublicSpeakingClub)
      .filter((club): club is PublicSpeakingClub => Boolean(club));
  } catch (error) {
    console.error('Public speaking clubs failed', error);
    return [];
  }
};

export const fetchPublicSpeakingClub = async (slug: string): Promise<PublicSpeakingClub | null> => {
  if (!isSlug(slug)) return null;
  try {
    const response = await fetch(`${APP_ORIGIN}/api/speaking-clubs/public/${slug}`, {
      next: { revalidate: 300 },
    });
    if (response.status === 404) return null;
    if (!response.ok) return null;
    const body = (await response.json()) as { club?: unknown };
    return toPublicSpeakingClub(body.club);
  } catch (error) {
    console.error('Public speaking club failed', error);
    return null;
  }
};
