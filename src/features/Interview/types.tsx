import { InfoCard } from "./Landing/components/InfoCards";
import { Price } from "./Landing/components/PriceCards";
import { Review } from "./Landing/components/ReviewCards";
import { ScorePreview } from "./Landing/components/ScorePreviewSection";
import { StepInfoCard } from "./Landing/components/StepsInfoCards";

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
