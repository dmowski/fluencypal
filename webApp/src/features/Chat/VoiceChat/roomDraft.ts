import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { emptyRoomDraft, ROOM_DRAFT_STORAGE_KEY, RoomDraft, RoomReviewMode } from './types';

const isReviewMode = (value: unknown): value is RoomReviewMode =>
  value === 'allMembers' || value === 'alexOnly';

export const readRoomDraft = (): RoomDraft => {
  if (typeof window === 'undefined') return emptyRoomDraft();
  try {
    const raw = window.localStorage.getItem(ROOM_DRAFT_STORAGE_KEY);
    if (!raw) return emptyRoomDraft();
    const parsed = JSON.parse(raw) as Partial<RoomDraft>;
    const base = emptyRoomDraft();
    const previewUrls = Array.isArray(parsed.previewUrls)
      ? parsed.previewUrls.filter((url): url is string => typeof url === 'string').slice(0, 24)
      : [];
    return {
      title: typeof parsed.title === 'string' ? parsed.title.slice(0, 80) : base.title,
      subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle.slice(0, 160) : base.subtitle,
      reviewMode: isReviewMode(parsed.reviewMode) ? parsed.reviewMode : base.reviewMode,
      joinPromptMarkdown:
        typeof parsed.joinPromptMarkdown === 'string'
          ? parsed.joinPromptMarkdown.slice(0, 8000)
          : base.joinPromptMarkdown,
      isPublic: parsed.isPublic === true,
      rulesMarkdown:
        typeof parsed.rulesMarkdown === 'string'
          ? parsed.rulesMarkdown.slice(0, 8000)
          : base.rulesMarkdown,
      discussMarkdown:
        typeof parsed.discussMarkdown === 'string'
          ? parsed.discussMarkdown.slice(0, 8000)
          : base.discussMarkdown,
      languageCode: supportedLanguages.includes(parsed.languageCode as SupportedLanguage)
        ? (parsed.languageCode as SupportedLanguage)
        : base.languageCode,
      previewUrls,
      selectedPreviewUrl:
        typeof parsed.selectedPreviewUrl === 'string' &&
        previewUrls.includes(parsed.selectedPreviewUrl)
          ? parsed.selectedPreviewUrl
          : previewUrls[0] || '',
    };
  } catch {
    return emptyRoomDraft();
  }
};

export const writeRoomDraft = (draft: RoomDraft): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROOM_DRAFT_STORAGE_KEY, JSON.stringify(draft));
};

export const clearRoomDraft = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ROOM_DRAFT_STORAGE_KEY);
};
