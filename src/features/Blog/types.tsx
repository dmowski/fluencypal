import { ResourceCategory } from "@/common/category";

export interface BlogPost {
  id: string;
  title: string;
  subTitle: string;
  keywords: string[];
  content: string;

  imagePreviewUrl: string;
  videoSrc?: string;

  publishedAt: number;
  category: ResourceCategory;
  relatedRolePlays: string[];
}
