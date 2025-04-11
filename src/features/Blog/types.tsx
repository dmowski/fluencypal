import { ResourceCategory } from "@/common/category";
import { JSX } from "react";

export interface BlogPost {
  id: string;
  title: string;
  subTitle: string;
  keywords: string[];
  content: string;
  contendElement?: JSX.Element;

  imagePreviewUrl: string;
  videoSrc?: string;

  publishedAt: number;
  category: ResourceCategory;
  relatedRolePlays: string[];
}
