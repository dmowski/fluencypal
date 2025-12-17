import { GoalPlan } from "../Plan/types";
import { InfoCard } from "./Landing/components/InfoCards";
import { Price } from "./Landing/components/PriceCards";
import { Review } from "./Landing/components/ReviewCards";
import { ScorePreview } from "./Landing/components/ScorePreviewSection";
import { StepInfoCard } from "./Landing/components/StepsInfoCards";
import { IconName } from "lucide-react/dynamic";

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

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  type: "faq";
  title: string;
  subTitle: string;
  faqItems: FaqItem[];
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
  bgImageUrl?: string;
  label: string;
  buttonTitle: string;
}

export interface Question {
  question: string;
  techItems: TechItem[];
}

// New: Examples of real interview questions
export interface ExampleQuestionsSection {
  type: "exampleQuestions";
  title: string;
  subTitle: string;
  questions: Question[];
}

export interface TechItem {
  label: string;
  /** Optional logo URL – can be empty for more abstract concepts */
  logoUrl: string;
}

export interface TechStackGroup {
  groupTitle: string;
  items: TechItem[];
}

export interface TechStackSection {
  type: "techStack";
  title: string;
  subTitle: string;
  keyPoints: string[];
  techGroups: TechStackGroup[];
}

// New: “Who this is for” section
export interface TextListSection {
  type: "textList";
  title: string;
  subTitle: string;
  textList: string[];
  buttonTitle?: string;
}

export interface DemoSnippetItem {
  question: string;
  userAnswerShort: string;
  feedback: string;
}

// New: Demo snippet (sample feedback)
export interface DemoSnippetSection {
  type: "demoSnippet";
  title: string;
  subTitle: string;
  demoItems: DemoSnippetItem[];
}

type Section =
  | ReviewSection
  | PriceSection
  | FaqSection
  | StepInfoCardSection
  | ScorePreviewSection
  | InfoCardsSection
  | CallToActionSection
  | FirstScreenSection
  | ExampleQuestionsSection
  | TechStackSection
  | TextListSection
  | DemoSnippetSection;

export interface QuizListItem {
  title: string;
  iconName: IconName;
  iconColor?: string;
}

/** Basic info to inform the user about the next step and general info */
export interface InfoQuizStep {
  type: "info";
  id: string;

  imageUrl?: string;
  imageAspectRatio?: string;
  title: string;
  subTitle: string;
  listItems?: QuizListItem[];

  buttonTitle: string;
}

/** Final step when user will see that he has completed all steps */
export interface WaitlistDoneQuizStep {
  type: "waitlist-done";
  id: string;

  title: string;
  subTitle: string;
  imageUrl?: string;
  listItems?: QuizListItem[];

  buttonTitle: string;
}

/** On this step user will record audio answer to interview question. */
export interface RecordAudioQuizStep {
  type: "record-audio";
  id: string;

  title: string;
  subTitle: string;
  listItems?: QuizListItem[];

  buttonTitle: string;

  // In case when we want to generate dynamic question titles via AI
  // Should return a question title/subTitle based on previous answers
  aiSystemPromptToGenerateTitles?: string;
}

/**
 * On this step user will see result of AI analyzer.
 * And will be intrigued to proceed further
 */
export interface AnalyzeInputsQuizStep {
  type: "analyze-inputs";
  id: string;

  title: string;
  subTitle: string;

  buttonTitle: string;

  // Should return Markdown or JSON content
  aiSystemPrompt: string;
  aiResponseFormat: "markdown" | "json-scope" | "practice-plan";
}

/**
 * On this step user will see paywall with benefits of upgrading.
 * Usually after seeing AI analysis of his answers.
 */
export interface PaywallQuizStep {
  type: "paywall";
  id: string;

  title: string;
  subTitle: string;
  listItems?: QuizListItem[];

  buttonTitle: string;
}

export interface QuizOption {
  label: string;
  subTitle?: string;
  iconImageUrl?: string;
}

export interface OptionsQuizStep {
  type: "options";
  id: string;

  title: string;
  subTitle: string;

  multipleSelection: boolean;
  options: QuizOption[]; // label-values pairs for options

  buttonTitle: string;
}

/**
 * Example of Interview Quiz Steps:
 * InfoQuizStep - inform user about the next step
 * RecordAudioQuizStep - user records audio answer (Introduce yourself)
 * RecordAudioQuizStep - Ask another question and record audio (Technical question)
 * RecordAudioQuizStep - Ask another question and record audio (Behavioral question)
 * AnalyzeInputsQuizStep - show AI analysis of user's answers (Markdown)
 * InfoQuizStep - On the next step, you will see score analysis
 * PaywallQuizStep - show paywall to verify credit card, choosing a plan and actual payment will be done later if user proceeds
 * AnalyzeInputsQuizStep - show AI analysis of the rest user's answers
 * InfoQuizStep - What's next: feature list of the app
 * WaitlistDoneQuizStep - final step indicating completion
 */
export type InterviewQuizStep =
  | InfoQuizStep
  | RecordAudioQuizStep
  | AnalyzeInputsQuizStep
  | PaywallQuizStep
  | WaitlistDoneQuizStep
  | OptionsQuizStep;

export interface InterviewQuiz {
  steps: InterviewQuizStep[];
}

export interface InterviewCoreData {
  id: string;
  title: string;
  jobTitle: string;
  subTitle: string;
  keywords: string[];
  category: InterviewCategory;
}

export interface InterviewData {
  coreData: InterviewCoreData;
  sections: Section[];
  quiz: InterviewQuiz;
}

export interface InterviewQuizAnswer {
  stepId: string;
  question: string;
  answer: string;
}

export interface InterviewQuizResults {
  stepId: string;
  inputHash: string;
  markdownFeedback: string;
  jsonScoreFeedback: ScorePreview | null;
  practicePlan: GoalPlan | null;
}

export type QuizAnswers = Record<string, InterviewQuizAnswer | undefined>;
export type QuizResults = Record<string, InterviewQuizResults | undefined>;

export type InterviewQuizSurvey = {
  // stepId: data
  answers: QuizAnswers;
  results: QuizResults;

  updatedAtIso: string;
  createdAtIso: string;
};
