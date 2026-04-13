import { ResourceCategory } from '@/features/Blog/category';
import { JSX } from 'react';

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
}
