import { InfoCard } from "./Landing/InfoCards";

export interface InterviewCategory {
  categoryId: string;
  categoryTitle: string;
  isAllResources?: boolean;
}

export interface InterviewData {
  id: string;
  title: string;
  jobTitle: string;
  subTitle: string;
  keywords: string[];

  category: InterviewCategory;
  infoCards: InfoCard[];
}
