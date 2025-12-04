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

export interface InterviewLandingMessages {
  startYourInterviewTest: string;
  whatYouWillAchieve: string;
  realOutcomesThatTransform: string;
  startFreeTrial: string;
  takeTheInterviewReadinessTest: string;
  inLessThen5Minutes: string;
  startTest: string;
  whyCandidatesImprove: string;
  aProvenMethodThatDelivers: string;
  realPeopleRealJobOffers: string;
  joinThousandsWhoTransformed: string;
  chooseYourInterviewPreparationPlan: string;
  everythingYouNeedToStandOut: string;
  allPlansIncludeInstantAccess: string;
  faq: string;
  readyToAceYourNextInterview: string;
  startPracticingNow: string;
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
  faqItems: {
    question: string;
    answer: string;
  }[];
  landingMessages: InterviewLandingMessages;
}
