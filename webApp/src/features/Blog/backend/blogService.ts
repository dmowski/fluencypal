import { getDB } from '@/app/api/config/firebase';
import {
  BlogDocMeta,
  BlogVersionDoc,
  GetBlogResponse,
  GetBlogsResponse,
  PublicBlogPost,
} from '../types';

const BLOGS_COLLECTION = 'blogs';
const DRAFT_VERSION_ID = 'draft';

/**
 * Returns all published blog posts.
 * Reads the `blogs` collection for docs with a non-null `publishedVersion`,
 * then fetches the corresponding version document for each.
 */
export async function getPublishedBlogs(): Promise<GetBlogsResponse> {
  const db = getDB();
  const snapshot = await db
    .collection(BLOGS_COLLECTION)
    .where('publishedVersion', '!=', null)
    .get();

  const results: PublicBlogPost[] = [];

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
      results.push({
        id: meta.id,
        publishedAtIso: meta.publishedAtIso,
        imagePreviewUrl: version.imagePreviewUrl,
        categoryId: version.categoryId,
        content: version.content,
        title: version.title,
        subTitle: version.subTitle,
        keywords: version.keywords,
      });
    }),
  );

  results.sort((a, b) => b.publishedAtIso.localeCompare(a.publishedAtIso));

  return { blogs: results };
}

/**
 * Returns a single published blog post by blog ID.
 */
export async function getPublishedBlog(blogId: string): Promise<GetBlogResponse> {
  const db = getDB();
  const metaSnap = await db.collection(BLOGS_COLLECTION).doc(blogId).get();

  if (!metaSnap.exists) return { blog: null };

  const meta = metaSnap.data() as BlogDocMeta;
  if (!meta.publishedVersion || !meta.publishedAtIso) return { blog: null };

  const versionSnap = await db
    .collection(BLOGS_COLLECTION)
    .doc(blogId)
    .collection('versions')
    .doc(meta.publishedVersion)
    .get();

  if (!versionSnap.exists) return { blog: null };

  const version = versionSnap.data() as BlogVersionDoc;
  return {
    blog: {
      id: meta.id,
      publishedAtIso: meta.publishedAtIso,
      imagePreviewUrl: version.imagePreviewUrl,
      categoryId: version.categoryId,
      content: version.content,
      title: version.title,
      subTitle: version.subTitle,
      keywords: version.keywords,
    },
  };
}

export { DRAFT_VERSION_ID };
