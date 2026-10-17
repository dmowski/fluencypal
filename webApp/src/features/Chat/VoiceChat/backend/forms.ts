import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { RoomDraft, RoomReviewMode } from '../types';
import { readOptionalText, readText, SpeakingClubError } from './http';

export const parseRoomDraft = (body: Record<string, unknown>): RoomDraft => {
  const reviewMode: RoomReviewMode = body.reviewMode === 'alexOnly' ? 'alexOnly' : 'allMembers';
  return {
    title: readText(body.title, 80, 'Room name'),
    subtitle: readText(body.subtitle, 160, 'Short description'),
    reviewMode,
    joinPromptMarkdown: readText(body.joinPromptMarkdown, 8000, 'Introduction note'),
    isPublic: body.isPublic === true,
    rulesMarkdown: readOptionalText(body.rulesMarkdown, 8000),
    discussMarkdown: readOptionalText(body.discussMarkdown, 8000),
    languageCode: supportedLanguages.includes(body.languageCode as SupportedLanguage)
      ? (body.languageCode as SupportedLanguage)
      : 'en',
    previewUrls: [],
    selectedPreviewUrl: readText(body.selectedPreviewUrl, 800, 'Picture'),
  };
};

export const readAudioFile = async (
  request: Request,
): Promise<{ buffer: Buffer; contentType: string; fields: FormData }> => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new SpeakingClubError('That recording could not be read.');
  }
  const audio = form.get('audio');
  if (!(audio instanceof File)) throw new SpeakingClubError('Add a recording first.');
  if (audio.size > 15 * 1024 * 1024) throw new SpeakingClubError('That recording is too large.');
  if (audio.size < 100) throw new SpeakingClubError('That recording is too short.');
  const buffer = Buffer.from(await audio.arrayBuffer());
  return { buffer, contentType: audio.type || 'audio/webm', fields: form };
};

export const readDuration = (value: FormDataEntryValue | null): number => {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.min(600, Math.round(seconds));
};
