import { getDB } from '@/app/api/config/firebase';
import { SupportedLanguage } from '@/features/Lang/lang';
import {
  BlogCategoryDocument,
  BlogDocMeta,
  BlogPost,
  BlogCategorySummary,
  BlogVersionDoc,
  GetBlogResponse,
  GetBlogsResponse,
} from '../types';
import { toBlogPost } from './blogMappers';

const BLOGS_COLLECTION = 'blogs';
const BLOG_CATEGORIES_COLLECTION = 'blogMetadata/category/categories';
export const DRAFT_VERSION_ID = 'draft';

const loadCategoriesById = async (): Promise<Map<string, BlogCategoryDocument>> => {
  const db = getDB();
  const snapshot = await db.collection(BLOG_CATEGORIES_COLLECTION).get();
  const map = new Map<string, BlogCategoryDocument>();
  snapshot.docs.forEach((docSnap) => {
    map.set(docSnap.id, docSnap.data() as BlogCategoryDocument);
  });
  return map;
};

const toCategorySummaries = (
  categoriesById: Map<string, BlogCategoryDocument>,
  lang: SupportedLanguage,
): BlogCategorySummary[] =>
  [...categoriesById.values()]
    .map((category) => ({
      categoryId: category.id,
      categoryTitle:
        category.title[lang]?.trim() || category.title.en?.trim() || category.id,
    }))
    .sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle));

/**
 * Returns all published blog posts localized to `lang`.
 */
export async function getPublishedBlogs(lang: SupportedLanguage): Promise<GetBlogsResponse> {
  const db = getDB();
  const [snapshot, categoriesById] = await Promise.all([
    db.collection(BLOGS_COLLECTION).where('publishedVersion', '!=', null).get(),
    loadCategoriesById(),
  ]);

  const results: BlogPost[] = [];

  await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const meta = docSnap.data() as BlogDocMeta;
      if (!meta.publishedVersion || !meta.publishedAtIso) return;

      const versionSnap = await db
        .collection(BLOGS_COLLECTION)
        .doc(meta.id)
        .collection('versions')
        .doc(meta.publishedVersion)
        .get();

      if (!versionSnap.exists) return;

      const version = versionSnap.data() as BlogVersionDoc;
      results.push(toBlogPost(meta, version, lang, categoriesById));
    }),
  );

  results.sort((a, b) => b.publishedAtIso.localeCompare(a.publishedAtIso));

  return {
    blogs: results,
    categories: toCategorySummaries(categoriesById, lang),
  };
}

/**
 * Returns a single published blog post by blog ID, localized to `lang`.
 */
export async function getPublishedBlog(
  blogId: string,
  lang: SupportedLanguage,
): Promise<GetBlogResponse> {
  const db = getDB();
  const metaSnap = await db.collection(BLOGS_COLLECTION).doc(blogId).get();

  if (!metaSnap.exists) return { blog: null };

  const meta = metaSnap.data() as BlogDocMeta;
  if (!meta.publishedVersion || !meta.publishedAtIso) return { blog: null };

  const [versionSnap, categoriesById] = await Promise.all([
    db
      .collection(BLOGS_COLLECTION)
      .doc(blogId)
      .collection('versions')
      .doc(meta.publishedVersion)
      .get(),
    loadCategoriesById(),
  ]);

  if (!versionSnap.exists) return { blog: null };

  const version = versionSnap.data() as BlogVersionDoc;
  return {
    blog: toBlogPost(meta, version, lang, categoriesById),
  };
}
