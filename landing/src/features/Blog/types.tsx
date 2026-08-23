import { ResourceCategory } from '@/features/Blog/category';
import { JSX } from 'react';

export type BlogAuthorRole = 'author' | 'coAuthor';

/** One byline entry. Posts can have several (author + co-authors). */
export interface BlogAuthor {
  role: BlogAuthorRole;
  name: string;
  /** Optional contribution, e.g. "Grammar correction and editing". */
  note?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  subTitle: string;
  keywords: string[];
  content: string;
  contendElement?: JSX.Element;

  imagePreviewUrl: string;
  videoSrc?: string;

  publishedAtIso: string;
  category: ResourceCategory;
  relatedRolePlays: string[];
  authors?: BlogAuthor[];
}
