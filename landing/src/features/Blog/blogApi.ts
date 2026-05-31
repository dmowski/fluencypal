import { SupportedLanguage } from '@/features/Lang/lang';
import { BlogPost } from './types';
import { ResourceCategory } from './category';

const BLOG_API_BASE = 'https://app.fluencypal.com';

export interface BlogApiCategory {
  categoryId: string;
  categoryTitle: string;
}

export interface FetchBlogsApiResponse {
  blogs: BlogPost[];
  categories: BlogApiCategory[];
}

/** Fetches published blogs from the web app API for the given locale. */
export const fetchBlogsFromApp = async (
  lang: SupportedLanguage,
): Promise<FetchBlogsApiResponse> => {
  const url =
    `${BLOG_API_BASE}/api/blog/getBlogs?` + new URLSearchParams({ lang });

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`getBlogs failed: ${response.status}`);
  }
  return (await response.json()) as FetchBlogsApiResponse;
};

export const fetchPublishedBlog = async (
  blogId: string,
  lang: SupportedLanguage,
): Promise<BlogPost | null> => {
  const url =
    `${BLOG_API_BASE}/api/blog/getBlog?` +
    new URLSearchParams({ blogId, lang });

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`getBlog failed: ${response.status}`);
  }
  const data = (await response.json()) as { blog: BlogPost | null };
  return data.blog;
};

export const toResourceCategories = (
  categories: BlogApiCategory[],
  allTitle: string,
): ResourceCategory[] => {
  const list: ResourceCategory[] = categories.map((category) => ({
    categoryId: category.categoryId,
    categoryTitle: category.categoryTitle,
  }));

  list.unshift({
    categoryTitle: allTitle,
    categoryId: 'all',
    isAllResources: true,
  });

  return list;
};
