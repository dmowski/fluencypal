'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BlogDocMeta, BlogVersionDoc } from './types';
import { useTextAi } from '@/features/Ai/useTextAi';
import {
  SupportedLanguage,
  fullEnglishLanguageName,
  supportedLanguages,
} from '@/features/Lang/lang';
import { db } from '@/features/Firebase/firebaseDb';
import { translateRequest } from '@/app/api/translate/translateRequest';
import { NativeLangCode } from '@/libs/language/type';

export const DRAFT_VERSION_ID = 'draft';

/** The subset of BlogVersionDoc fields that are localised per language. */
export type LocalizedFields = Pick<BlogVersionDoc, 'title' | 'subTitle' | 'content' | 'keywords'>;

const makeEmptyLocaleString = (): Record<SupportedLanguage, string> =>
  Object.fromEntries(supportedLanguages.map((l) => [l, ''])) as Record<SupportedLanguage, string>;

const makeEmptyLocaleStringArray = (): Record<SupportedLanguage, string[]> =>
  Object.fromEntries(supportedLanguages.map((l) => [l, [] as string[]])) as Record<
    SupportedLanguage,
    string[]
  >;

export const makeEmptyDraft = (): BlogVersionDoc => ({
  id: DRAFT_VERSION_ID,
  imagePreviewUrl: '',
  categoryId: '',
  content: makeEmptyLocaleString(),
  title: makeEmptyLocaleString(),
  subTitle: makeEmptyLocaleString(),
  keywords: makeEmptyLocaleStringArray(),
  createdAtIso: new Date().toISOString(),
});

/**
 * Merges Firestore-loaded data with fully-initialised defaults so that all
 * language keys are always present, even for documents stored before this
 * convention was introduced.
 */
/** Merges per-language fields without dropping translations from earlier steps. */
export const applyLocalizedPatch = (
  draft: BlogVersionDoc,
  patch: LocalizedFields,
): BlogVersionDoc => ({
  ...draft,
  title: { ...draft.title, ...patch.title },
  subTitle: { ...draft.subTitle, ...patch.subTitle },
  content: { ...draft.content, ...patch.content },
  keywords: { ...draft.keywords, ...patch.keywords },
});

const mergeDraftWithDefaults = (
  defaults: BlogVersionDoc,
  loaded: Partial<BlogVersionDoc>,
): BlogVersionDoc => ({
  ...defaults,
  ...loaded,
  content: { ...defaults.content, ...loaded.content } as Record<SupportedLanguage, string>,
  title: { ...defaults.title, ...loaded.title } as Record<SupportedLanguage, string>,
  subTitle: { ...defaults.subTitle, ...loaded.subTitle } as Record<SupportedLanguage, string>,
  keywords: { ...defaults.keywords, ...loaded.keywords } as Record<SupportedLanguage, string[]>,
});

export interface UseBlogDraftResult {
  localDraft: BlogVersionDoc;
  setLocalDraft: React.Dispatch<React.SetStateAction<BlogVersionDoc>>;
  isLoadingDraft: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isUnpublishing: boolean;
  isTranslating: boolean;
  /** Update a single localised field for a specific language. */
  setLangField: <T>(key: keyof LocalizedFields, value: T, lang: SupportedLanguage) => void;
  saveDraft: (overrideDraft?: BlogVersionDoc) => Promise<void>;
  publishDraft: () => Promise<void>;
  unpublishDraft: () => Promise<void>;
  handleTranslateToCurrentLang: (activeLang: SupportedLanguage) => Promise<void>;
  handleTranslateToAllLanguages: () => Promise<void>;
  handleTranslateToCurrentLangWithGoogle: (activeLang: SupportedLanguage) => Promise<void>;
  handleTranslateToAllLanguagesWithGoogle: () => Promise<void>;
}

export const useBlogDraft = (
  blog: BlogDocMeta,
  onUpdate: (meta: Partial<BlogDocMeta>) => Promise<void>,
): UseBlogDraftResult => {
  const [localDraft, setLocalDraft] = useState<BlogVersionDoc>(makeEmptyDraft);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const ai = useTextAi();

  // Synchronise with the Firestore draft document once when the modal mounts.
  // This is external-system synchronisation, so useEffect is appropriate here.
  useEffect(() => {
    let cancelled = false;

    const versionsCollection = db.collections.blogVersions(blog.id);
    if (!versionsCollection) {
      setIsLoadingDraft(false);
      return;
    }
    const draftDocRef = doc(versionsCollection, DRAFT_VERSION_ID);

    getDoc(draftDocRef)
      .then((snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          setLocalDraft((prev) =>
            mergeDraftWithDefaults(prev, snap.data() as Partial<BlogVersionDoc>),
          );
        }
      })
      .catch((err) => {
        console.error('[useBlogDraft] getDoc failed:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDraft(false);
      });

    return () => {
      cancelled = true;
    };
  }, [blog.id]);

  // ── Field setters ─────────────────────────────────────────────────────────

  const setLangField = <T>(key: keyof LocalizedFields, value: T, lang: SupportedLanguage) =>
    setLocalDraft(
      (prev) =>
        ({
          ...prev,
          [key]: { ...prev[key], [lang]: value },
        }) as BlogVersionDoc,
    );

  // ── Firestore writes ──────────────────────────────────────────────────────

  const writeDraftToFirestore = async (draft: BlogVersionDoc) => {
    const versionsCollection = db.collections.blogVersions(blog.id);
    if (!versionsCollection) return;
    const draftDocRef = doc(versionsCollection, DRAFT_VERSION_ID);
    await setDoc(draftDocRef, { ...draft, id: DRAFT_VERSION_ID });
  };

  const saveDraft = async (overrideDraft?: BlogVersionDoc) => {
    setIsSaving(true);
    try {
      const draft = overrideDraft ?? localDraft;
      await writeDraftToFirestore(draft);
      const metaPatch: Partial<BlogDocMeta> = {
        updatedAtIso: new Date().toISOString(),
      };
      const titleEn = draft.title.en.trim();
      if (titleEn) metaPatch.titleEn = titleEn;
      await onUpdate(metaPatch);
    } finally {
      setIsSaving(false);
    }
  };

  const publishDraft = async () => {
    setIsPublishing(true);
    try {
      const versionsCollection = db.collections.blogVersions(blog.id);
      if (!versionsCollection) return;

      await writeDraftToFirestore(localDraft);

      const versionId = Date.now().toString();
      const publishedVersionRef = doc(versionsCollection, versionId);
      await setDoc(publishedVersionRef, {
        ...localDraft,
        id: versionId,
        createdAtIso: new Date().toISOString(),
      });

      await onUpdate({
        publishedVersion: versionId,
        publishedAtIso: new Date().toISOString(),
        updatedAtIso: new Date().toISOString(),
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const unpublishDraft = async () => {
    setIsUnpublishing(true);
    try {
      await onUpdate({
        publishedVersion: null,
        publishedAtIso: null,
        updatedAtIso: new Date().toISOString(),
      });
    } finally {
      setIsUnpublishing(false);
    }
  };

  // ── AI translation ────────────────────────────────────────────────────────

  const translateDraftToLang = async (
    targetLang: SupportedLanguage,
    sourceDraft: BlogVersionDoc,
  ): Promise<LocalizedFields> => {
    const langName = fullEnglishLanguageName[targetLang];
    const enTitle = sourceDraft.title['en'];
    const enSubTitle = sourceDraft.subTitle['en'];
    const enContent = sourceDraft.content['en'];
    const enKeywords = sourceDraft.keywords['en'];

    const translateText = (text: string) =>
      ai.generate({
        systemMessage: `Translate the following text to ${langName}. Return only the translated text, no explanations.`,
        userMessage: text,
        model: 'gpt-4o',
      });

    const [tTitle, tSubTitle, tContent, tKeywordsResult] = await Promise.all([
      enTitle ? translateText(enTitle) : Promise.resolve(''),
      enSubTitle ? translateText(enSubTitle) : Promise.resolve(''),
      enContent
        ? ai.generate({
            systemMessage: `Translate the following markdown blog post to ${langName}. Keep all markdown formatting intact. Return only the translated content.`,
            userMessage: enContent,
            model: 'gpt-4o',
          })
        : Promise.resolve(''),
      enKeywords.length > 0
        ? ai.generateJson<{ keywords: string[] }>({
            systemMessage: `Translate the following JSON array of keywords to ${langName}. Return a JSON object with a "keywords" array of strings.`,
            userMessage: JSON.stringify(enKeywords),
            model: 'gpt-4o',
          })
        : Promise.resolve({ keywords: [] as string[] }),
    ]);

    const translatedKeywords = (tKeywordsResult as { keywords?: string[] }).keywords ?? [];

    return {
      title: { ...sourceDraft.title, [targetLang]: tTitle } as Record<SupportedLanguage, string>,
      subTitle: { ...sourceDraft.subTitle, [targetLang]: tSubTitle } as Record<
        SupportedLanguage,
        string
      >,
      content: { ...sourceDraft.content, [targetLang]: tContent } as Record<
        SupportedLanguage,
        string
      >,
      keywords: { ...sourceDraft.keywords, [targetLang]: translatedKeywords } as Record<
        SupportedLanguage,
        string[]
      >,
    };
  };

  const translateDraftToLangWithGoogle = async (
    targetLang: SupportedLanguage,
    sourceDraft: BlogVersionDoc,
  ): Promise<LocalizedFields> => {
    const enTitle = sourceDraft.title['en'];
    const enSubTitle = sourceDraft.subTitle['en'];
    const enContent = sourceDraft.content['en'];
    const enKeywords = sourceDraft.keywords['en'];

    const gtTranslate = (text: string): Promise<string> =>
      translateRequest({
        text,
        sourceLanguage: 'en',
        targetLanguage: targetLang as NativeLangCode,
      }).then((r) => r.translatedText);

    const [tTitle, tSubTitle, tContent, ...tKeywords] = await Promise.all([
      enTitle ? gtTranslate(enTitle) : Promise.resolve(''),
      enSubTitle ? gtTranslate(enSubTitle) : Promise.resolve(''),
      enContent ? gtTranslate(enContent) : Promise.resolve(''),
      ...enKeywords.map((kw) => gtTranslate(kw)),
    ]);

    return {
      title: { ...sourceDraft.title, [targetLang]: tTitle } as Record<SupportedLanguage, string>,
      subTitle: { ...sourceDraft.subTitle, [targetLang]: tSubTitle } as Record<
        SupportedLanguage,
        string
      >,
      content: { ...sourceDraft.content, [targetLang]: tContent } as Record<
        SupportedLanguage,
        string
      >,
      keywords: { ...sourceDraft.keywords, [targetLang]: tKeywords } as Record<
        SupportedLanguage,
        string[]
      >,
    };
  };

  const handleTranslateToCurrentLang = async (activeLang: SupportedLanguage) => {
    if (activeLang === 'en') return;
    setIsTranslating(true);
    try {
      const patch = await translateDraftToLang(activeLang, localDraft);
      const updated: BlogVersionDoc = { ...localDraft, ...patch };
      setLocalDraft(updated);
      await saveDraft(updated);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateToAllLanguages = async () => {
    setIsTranslating(true);
    const failedLangs: SupportedLanguage[] = [];
    try {
      let updated: BlogVersionDoc = { ...localDraft };
      const targetLangs = supportedLanguages.filter((lang) => lang !== 'en');

      for (const lang of targetLangs) {
        try {
          // Must use `updated` (not `localDraft`) so each pass keeps prior translations.
          const patch = await translateDraftToLang(lang, updated);
          updated = applyLocalizedPatch(updated, patch);
          // Save after each language to avoid data loss if something fails mid-way.
          await writeDraftToFirestore(updated);
        } catch (err) {
          console.error(`[useBlogDraft] translate to ${lang} failed:`, err);
          failedLangs.push(lang);
        }
      }

      setLocalDraft(updated);
      const metaPatch: Partial<BlogDocMeta> = { updatedAtIso: new Date().toISOString() };
      const titleEn = updated.title.en.trim();
      if (titleEn) metaPatch.titleEn = titleEn;
      await onUpdate(metaPatch);

      if (failedLangs.length > 0) {
        throw new Error(
          `Translation incomplete for: ${failedLangs.join(', ')}. Other languages were saved.`,
        );
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateToCurrentLangWithGoogle = async (activeLang: SupportedLanguage) => {
    if (activeLang === 'en') return;
    setIsTranslating(true);
    try {
      const patch = await translateDraftToLangWithGoogle(activeLang, localDraft);
      const updated: BlogVersionDoc = { ...localDraft, ...patch };
      setLocalDraft(updated);
      await saveDraft(updated);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateToAllLanguagesWithGoogle = async () => {
    setIsTranslating(true);
    const failedLangs: SupportedLanguage[] = [];
    try {
      let updated: BlogVersionDoc = { ...localDraft };
      const targetLangs = supportedLanguages.filter((lang) => lang !== 'en');

      for (const lang of targetLangs) {
        try {
          const patch = await translateDraftToLangWithGoogle(lang, updated);
          updated = applyLocalizedPatch(updated, patch);
          // Save after each language to avoid data loss if something fails mid-way.
          await writeDraftToFirestore(updated);
        } catch (err) {
          console.error(`[useBlogDraft] Google translate to ${lang} failed:`, err);
          failedLangs.push(lang);
        }
      }

      setLocalDraft(updated);
      const metaPatch: Partial<BlogDocMeta> = { updatedAtIso: new Date().toISOString() };
      const titleEn = updated.title.en.trim();
      if (titleEn) metaPatch.titleEn = titleEn;
      await onUpdate(metaPatch);

      if (failedLangs.length > 0) {
        throw new Error(
          `Translation incomplete for: ${failedLangs.join(', ')}. Other languages were saved.`,
        );
      }
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    localDraft,
    setLocalDraft,
    isLoadingDraft,
    isSaving,
    isPublishing,
    isUnpublishing,
    isTranslating,
    setLangField,
    saveDraft,
    publishDraft,
    unpublishDraft,
    handleTranslateToCurrentLang,
    handleTranslateToAllLanguages,
    handleTranslateToCurrentLangWithGoogle,
    handleTranslateToAllLanguagesWithGoogle,
  };
};
