import { InfoCard } from "./Landing/InfoCards";
import { Price } from "./Landing/PriceCards";
import { Review } from "./Landing/ReviewCards";
import { ScorePreview } from "./Landing/ScorePreviewSection";
import { StepInfoCard } from "./Landing/StepsInfoCards";

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
  stepInfoCards: StepInfoCard[];

  whatUserGetAfterFirstTest: string[];
  scorePreview: ScorePreview;
  reviewsData: Review[];
  price: Price[];
}
