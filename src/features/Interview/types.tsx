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

export interface ReviewSection {
  type: "review";
  title: string;
  subTitle: string;
  reviews: Review[];
}

export interface PriceSection {
  type: "price";
  title: string;
  subTitle: string;
  prices: Price[];
}

export interface FaqSection {
  type: "faq";
  title: string;
  subTitle: string;
  faqItems: {
    question: string;
    answer: string;
  }[];
}

export interface ScorePreviewSection {
  type: "scorePreview";
  title: string;
  subTitle: string;
  infoList: string[];
  scorePreview: ScorePreview;
  buttonTitle: string;
}

//steps
export interface StepInfoCardSection {
  type: "stepInfoCard";
  title: string;
  subTitle: string;
  stepInfoCards: StepInfoCard[];
}

export interface InfoCardsSection {
  type: "infoCards";
  title: string;
  subTitle: string;
  buttonTitle: string;
  infoCards: InfoCard[];
}

export interface CallToActionSection {
  type: "callToAction";
  title: string;
  buttonTitle: string;
}

export interface FirstScreenSection {
  type: "firstScreen";
  title: string;
  subTitle: string;
  label: string;
  buttonTitle: string;
}

type Section =
  | ReviewSection
  | PriceSection
  | FaqSection
  | StepInfoCardSection
  | ScorePreviewSection
  | InfoCardsSection
  | CallToActionSection
  | FirstScreenSection;

export interface InterviewData {
  id: string;
  title: string;
  jobTitle: string;
  subTitle: string;
  keywords: string[];
  sections: Section[];
  category: InterviewCategory;
}
