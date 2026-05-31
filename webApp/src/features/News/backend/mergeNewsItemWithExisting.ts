import { NewsItem } from '@/features/News/types';
import { isHostedNewsImageUrl } from './newsImageUrl';

/**
 * Overlay freshly built gNews fields onto an existing cache document so
 * populate does not wipe AI enrichment (tags, translated headlines, hosted
 * images, lazy versions) before `enrichNewsItem` runs.
 */
export const mergeNewsItemWithExisting = (
  built: NewsItem,
  existing: NewsItem | null,
): NewsItem => {
  if (!existing) return built;

  const hasTags = (existing.tags?.length ?? 0) > 0;
  const hasTranslatedHeadline =
    existing.title !== existing.titleOrigin ||
    existing.subTitle !== existing.subTitleOrigin;
  const hasHostedImage =
    !!existing.imageUrl && isHostedNewsImageUrl(existing.imageUrl);

  return {
    ...built,
    tags: hasTags ? existing.tags : built.tags,
    title: hasTranslatedHeadline ? existing.title : built.title,
    subTitle: hasTranslatedHeadline ? existing.subTitle : built.subTitle,
    imageUrl: hasHostedImage ? existing.imageUrl : built.imageUrl,
    versions: existing.versions ?? built.versions,
    createdAtIso: existing.createdAtIso,
  };
};
