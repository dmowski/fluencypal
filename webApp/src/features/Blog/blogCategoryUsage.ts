import { getDocs } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';

/** Returns blog IDs whose version docs reference `categoryId`, optionally skipping one blog. */
export const findBlogIdsUsingCategory = async (
  categoryId: string,
  excludeBlogId?: string,
): Promise<string[]> => {
  const blogsCollection = db.collections.blogs();
  if (!blogsCollection) {
    return [];
  }

  const blogsSnap = await getDocs(blogsCollection);
  const matchingBlogIds: string[] = [];

  await Promise.all(
    blogsSnap.docs.map(async (blogDoc) => {
      if (excludeBlogId && blogDoc.id === excludeBlogId) {
        return;
      }

      const versionsCollection = db.collections.blogVersions(blogDoc.id);
      if (!versionsCollection) {
        return;
      }

      const versionsSnap = await getDocs(versionsCollection);
      const isUsed = versionsSnap.docs.some((versionDoc) => versionDoc.data().categoryId === categoryId);
      if (isUsed) {
        matchingBlogIds.push(blogDoc.id);
      }
    }),
  );

  return matchingBlogIds.sort();
};

export const categoryInUseErrorMessage = (blogIds: string[]): string =>
  blogIds.length === 1
    ? 'Category is in use by 1 other post. Remove the category from that post first.'
    : `Category is in use by ${blogIds.length} other posts. Remove the category from those posts first.`;
