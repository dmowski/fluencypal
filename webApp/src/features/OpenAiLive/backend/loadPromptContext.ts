import {
  fullEnglishLanguageName,
  supportedLanguages,
  SupportedLanguage,
} from '@/features/Lang/lang';
import { OpenAiLiveMode } from '../types';
import { buildOpenAiLiveInstructions, OpenAiLivePromptContext } from '../instructions';
import { resolveOpenAiLiveVoice } from '../voices';
import { getDB } from '@/app/api/config/firebase';

type RecordNote = { value?: string; createdAtDayIso?: string };

const isLanguage = (value: unknown): value is SupportedLanguage =>
  typeof value === 'string' && (supportedLanguages as string[]).includes(value);

const notesFromRecords = (records: unknown): string => {
  if (!Array.isArray(records)) return '';
  return records
    .map((record) => {
      const note = record as RecordNote;
      if (!note?.value) return '';
      return `${note.createdAtDayIso || ''}: ${note.value}`.trim();
    })
    .filter(Boolean)
    .join('\n');
};

const paceForSpeed = (speed: unknown): string => {
  if (speed === 'extremely-slow') return 'Speak very slowly and clearly.';
  if (speed === 'slow') return 'Speak slowly.';
  if (speed === 'fast') return 'Speak a little faster than a careful teacher.';
  return 'Speak at a natural pace.';
};

export const loadOpenAiLivePrompt = async (
  userId: string,
  mode: OpenAiLiveMode,
): Promise<{ instructions: string; voice: string }> => {
  const db = getDB();
  const [userSnap, infoSnap] = await Promise.all([
    db.collection('users').doc(userId).get(),
    db.collection('users').doc(userId).collection('stats').doc('aiUserInfo').get(),
  ]);

  const rawLanguage: unknown = userSnap.get('languageCode');
  const rawNative: unknown = userSnap.get('nativeLanguageCode');
  const languageCode: SupportedLanguage = isLanguage(rawLanguage) ? rawLanguage : 'en';
  const nativeCode = isLanguage(rawNative) ? rawNative : null;
  const info = infoSnap.data() || {};
  const grammarMap = info.grammarRecordsMap as Record<string, unknown> | undefined;

  const context: OpenAiLivePromptContext = {
    mode,
    languageName: fullEnglishLanguageName[languageCode],
    nativeLanguageName: nativeCode ? fullEnglishLanguageName[nativeCode] : null,
    voiceName: resolveOpenAiLiveVoice(userSnap.get('teacherVoice')),
    pace: paceForSpeed(userSnap.get('teacherVoiceSpeed')),
    userInfo: notesFromRecords(info.advancedRecords),
    grammarNotes: notesFromRecords(grammarMap?.[languageCode]),
  };

  return {
    instructions: buildOpenAiLiveInstructions(context),
    voice: resolveOpenAiLiveVoice(userSnap.get('teacherVoice')),
  };
};
