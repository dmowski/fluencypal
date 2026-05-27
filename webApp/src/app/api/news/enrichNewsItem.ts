import { NewsItem } from '@/features/News/types';
import { upsertCachedNews } from './cache';
import { copyNewsImageToStorage } from './copyImageToStorage';
import { generateNewsTags } from './generateNewsTags';
import { needsNewsImageUpload } from './newsImageUrl';
import { translateNewsHeadline } from './translateNewsHeadline';

/**
 * Slow, optional post-processing for a news document already stored with
 * gNews metadata. Runs after the fast ingest path so `/getTodayNews` can
 * respond quickly. Safe to fire-and-forget.
 */
export const enrichNewsItem = async (item: NewsItem): Promise<void> => {
  const needsImage = needsNewsImageUpload(item);

  const needsHeadlineTranslate =
    item.title === item.titleOrigin && item.subTitle === item.subTitleOrigin;

  const needsTags = !item.tags || item.tags.length === 0;

  if (!needsImage && !needsHeadlineTranslate && !needsTags) {
    return;
  }

  const [imageUrl, translated, tags] = await Promise.all([
    needsImage
      ? copyNewsImageToStorage({ sourceUrl: item.sourceImageUrl, newsId: item.id }).catch(
          () => item.imageUrl,
        )
      : Promise.resolve(item.imageUrl),
    needsHeadlineTranslate
      ? translateNewsHeadline({
          title: item.titleOrigin,
          subTitle: item.subTitleOrigin,
          targetLanguageName: item.languageName,
        }).catch(() => ({ title: item.titleOrigin, subTitle: item.subTitleOrigin }))
      : Promise.resolve({ title: item.title, subTitle: item.subTitle }),
    needsTags
      ? generateNewsTags({
          title: item.titleOrigin,
          subTitle: item.subTitleOrigin,
          category: item.category,
        }).catch(() => item.tags ?? [])
      : Promise.resolve(item.tags ?? []),
  ]);

  await upsertCachedNews({
    ...item,
    title: translated.title,
    subTitle: translated.subTitle,
    imageUrl: imageUrl || item.imageUrl,
    tags,
  });
};
