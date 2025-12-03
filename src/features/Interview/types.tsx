import { InfoCard } from "./Landing/InfoCards";
import { ScorePreview } from "./Landing/ScorePreviewSection";

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

  whatUserGetAfterFirstTest: string[];
  scorePreview: ScorePreview;
}
