import { SupportedLanguage } from '@/features/Lang/lang';
import { ResourceCategory } from '../RolePlay/resourceCategory';

// ─── Firestore document types ───────────────────────────────────────────────

/** Metadata stored in `blogs/{blogId}` */
export interface BlogDocMeta {
  id: string;
  /** ID of the published version document inside the `versions` subcollection */
  publishedVersion: string | null;
  updatedAtIso: string;
  createdAtIso: string;
  publishedAtIso: string | null;
  /** Denormalized English title for display in the admin list. */
  titleEn?: string;
}

/** Parent doc at `blogMetadata/category` (anchors the categories subcollection). */
export interface BlogMetadataCategoryDoc {
  updatedAtIso: string;
}

/** Category stored at `blogMetadata/category/categories/{categoryId}` */
export interface BlogCategoryDocument {
  id: string;
  title: Record<SupportedLanguage, string>;
  updatedAtIso: string;
}

/** Content document stored in `blogs/{blogId}/versions/{versionId}` */
export interface BlogVersionDoc {
  id: string;
  imagePreviewUrl: string;
  /** References `blogMetadata/category/categories/{categoryId}`. */
  categoryId: string;
  content: Record<SupportedLanguage, string>;
  title: Record<SupportedLanguage, string>;
  subTitle: Record<SupportedLanguage, string>;
  keywords: Record<SupportedLanguage, string[]>;
  createdAtIso: string;
}

// ─── Public API types ────────────────────────────────────────────────────────

/** Published blog post for a single locale (landing `BlogPost` shape). */

export interface BlogPost {
  id: string;
  title: string;
  subTitle: string;
  keywords: string[];
  content: string;

  imagePreviewUrl: string;
  videoSrc?: string;

  publishedAtIso: string;
  category: ResourceCategory;
  relatedRolePlays: string[];
}

export interface BlogCategorySummary {
  categoryId: string;
  categoryTitle: string;
}

export interface GetBlogsRequest {
  lang: SupportedLanguage;
}

export interface GetBlogsResponse {
  blogs: BlogPost[];
  categories: BlogCategorySummary[];
}

export interface GetBlogRequest {
  blogId: string;
  lang: SupportedLanguage;
}

export interface GetBlogResponse {
  blog: BlogPost | null;
}
