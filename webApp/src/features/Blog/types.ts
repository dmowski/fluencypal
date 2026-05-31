import { SupportedLanguage } from '@/features/Lang/lang';

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

/** A published blog post exposed via the public API */
export interface PublicBlogPost {
  id: string;
  publishedAtIso: string;
  imagePreviewUrl: string;
  categoryId: string;
  content: Record<SupportedLanguage, string>;
  title: Record<SupportedLanguage, string>;
  subTitle: Record<SupportedLanguage, string>;
  keywords: Record<SupportedLanguage, string[]>;
}

export interface GetBlogsResponse {
  blogs: PublicBlogPost[];
}

export interface GetBlogResponse {
  blog: PublicBlogPost | null;
}

export interface GetBlogRequest {
  blogId: string;
}
