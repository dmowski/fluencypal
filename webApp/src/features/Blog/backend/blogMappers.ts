import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { sanitizeBlogAuthors } from '../blogAuthors';
import { BlogCategoryDocument, BlogDocMeta, BlogPost, BlogVersionDoc } from '../types';

export const parseBlogLang = (raw: string | null | undefined): SupportedLanguage | null => {
  if (!raw) return null;
  return supportedLanguages.includes(raw as SupportedLanguage) ? (raw as SupportedLanguage) : null;
};

const pickLocalizedString = (
  record: Partial<Record<SupportedLanguage, string>> | undefined,
  lang: SupportedLanguage,
): string => {
  if (!record) return '';
  const value = record[lang]?.trim();
  if (value) return value;
  return record.en?.trim() ?? '';
};

const pickLocalizedKeywords = (
  record: Partial<Record<SupportedLanguage, string[]>> | undefined,
  lang: SupportedLanguage,
): string[] => {
  if (!record) return [];
  const value = record[lang];
  if (value?.length) return value;
  return record.en ?? [];
};

export const toBlogPost = (
  meta: BlogDocMeta,
  version: BlogVersionDoc,
  lang: SupportedLanguage,
  categoriesById: Map<string, BlogCategoryDocument>,
): BlogPost => {
  const categoryDoc = categoriesById.get(version.categoryId);
  const categoryTitle = categoryDoc
    ? pickLocalizedString(categoryDoc.title, lang)
    : version.categoryId;

  return {
    id: meta.id,
    title: pickLocalizedString(version.title, lang),
    subTitle: pickLocalizedString(version.subTitle, lang),
    keywords: pickLocalizedKeywords(version.keywords, lang),
    content: pickLocalizedString(version.content, lang),
    imagePreviewUrl: version.imagePreviewUrl,
    publishedAtIso: meta.publishedAtIso!,
    category: {
      categoryId: version.categoryId,
      categoryTitle: categoryTitle || version.categoryId,
    },
    relatedRolePlays: [],
    authors: sanitizeBlogAuthors(version.authors),
  };
};
