import { SupportedLanguage } from '@/features/Lang/lang';
import { NewsLanguageComplexity } from '@/features/News/types';
import { NativeLangCode } from '@/libs/language/type';

// ---------------------------------------------------------------------------
// Schema version — bump when breaking Firestore document shape changes
// ---------------------------------------------------------------------------

export const QUIZ_SCHEMA_VERSION = 1;

// ---------------------------------------------------------------------------
// Quiz lifecycle
// ---------------------------------------------------------------------------

export type QuizStatus =
  | 'not-started'
  | 'in-progress'
  | 'submitted'
  | 'evaluated'
  | 'abandoned';

// ---------------------------------------------------------------------------
// Source — what material the quiz was generated from
// ---------------------------------------------------------------------------

export type QuizSource = QuizNewsSource | QuizManualSource | QuizStateExamSource;

export interface QuizNewsSource {
  type: 'news';
  newsId: string;
  complexity: NewsLanguageComplexity;
  /** Article title at generation time (display / debugging). */
  articleTitle: string;
}

/** Reserved for hand-authored or imported exams. */
export interface QuizManualSource {
  type: 'manual';
  label: string;
}

/** Government-style certification exam practice (e.g. Polish B1 state exam). */
export interface QuizStateExamSource {
  type: 'state-exam';
  level: 'b1';
  variantId: string;
  targetLanguageCode: SupportedLanguage;
  contentHash?: string;
  generationPromptVersion?: string;
}

export type StateExamModuleId = 'listening' | 'reading' | 'grammar' | 'writing' | 'speaking';

export interface StateExamModuleResult {
  moduleId: StateExamModuleId;
  title: string;
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
}

export type WritingTaskGenre =
  | 'zyczenia'
  | 'zaproszenie'
  | 'ogloszenie'
  | 'email'
  | 'opowiadanie'
  | 'esej';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export interface QuizOption {
  id: string;
  label: string;
}

/** Instructions passed to the LLM when evaluating an answer or the whole exam. */
export interface QuizEvaluationCriteria {
  /** System-style instruction fragment for the evaluator model. */
  instruction: string;
  /** Optional rubric text (markdown) shown to admins or embedded in the prompt. */
  rubric?: string;
  /** Maximum score for this question or exam (default applied in scoring helpers). */
  maxScore?: number;
}

export interface QuizExamEvaluation extends QuizEvaluationCriteria {
  /** Optional passing threshold as a percentage (0–100). */
  passingScorePercent?: number;
  /** When true, detailed level feedback is requested automatically after submit. */
  autoRequestDetailedFeedback?: boolean;
}

// ---------------------------------------------------------------------------
// Question types (discriminated union)
// ---------------------------------------------------------------------------

export type QuizQuestionType =
  | 'word-translation'
  | 'fill-gap'
  | 'read-and-answer'
  | 'describe-picture-voice'
  | 'monologue-voice'
  | 'writing-text'
  | 'listening';

interface QuizQuestionBase {
  id: string;
  /** Short label for debugging / analytics; not necessarily shown in UI. */
  title?: string;
  /** Per-question point weight (state exams); falls back to evaluation.maxScore or 1. */
  maxScore?: number;
  /** Per-question evaluation; required for open-ended types, optional override for MC. */
  evaluation?: QuizEvaluationCriteria;
}

export type WordTranslationDirection = 'target-to-native' | 'native-to-target';

export interface WordTranslationQuestion extends QuizQuestionBase {
  type: 'word-translation';
  /** Word or sentence shown to the user. */
  promptText: string;
  direction: WordTranslationDirection;
  options: QuizOption[];
  correctOptionId: string;
}

export type FillGapSegment =
  | { kind: 'text'; text: string }
  | { kind: 'gap'; gapId: string };

export interface FillGapDefinition {
  options: QuizOption[];
  correctOptionId: string;
}

export interface FillGapQuestion extends QuizQuestionBase {
  type: 'fill-gap';
  /** Ordered text and gap placeholders composing the sentence. */
  segments: FillGapSegment[];
  gaps: Record<string, FillGapDefinition>;
}

export interface ReadAndAnswerQuestion extends QuizQuestionBase {
  type: 'read-and-answer';
  passageText: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface ListeningQuestion extends QuizQuestionBase {
  type: 'listening';
  /** Text spoken via TTS (`AudioPlayIcon`). Not shown until after play (UI decision). */
  audioText: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface DescribePictureVoiceQuestion extends QuizQuestionBase {
  type: 'describe-picture-voice';
  imageUrl: string;
  /** Vision-model summary of what the image shows; used when grading voice answers. */
  imageDescription: string;
  promptText: string;
  minWords?: number;
  maxWords?: number;
  /** Required — open-ended answers are always AI-evaluated. */
  evaluation: QuizEvaluationCriteria;
}

export interface MonologueVoiceQuestion extends QuizQuestionBase {
  type: 'monologue-voice';
  topicPrompt: string;
  minWords?: number;
  maxWords?: number;
  /** Required — open-ended answers are always AI-evaluated. */
  evaluation: QuizEvaluationCriteria;
}

export interface WritingTextQuestion extends QuizQuestionBase {
  type: 'writing-text';
  promptText: string;
  minWords: number;
  maxWords: number;
  taskGenre: WritingTaskGenre;
  imageUrl?: string;
  imageDescription?: string;
  /** Required — open-ended answers are always AI-evaluated. */
  evaluation: QuizEvaluationCriteria;
}

export type QuizQuestion =
  | WordTranslationQuestion
  | FillGapQuestion
  | ReadAndAnswerQuestion
  | ListeningQuestion
  | DescribePictureVoiceQuestion
  | MonologueVoiceQuestion
  | WritingTextQuestion;

// ---------------------------------------------------------------------------
// Quiz definition (immutable content)
// ---------------------------------------------------------------------------

export interface QuizSection {
  id: string;
  /** Shown in modal header, e.g. "Reading", "Listening". */
  title: string;
  instructions?: string;
  questions: QuizQuestion[];
  /** State exam module metadata (optional for legacy manual exams). */
  moduleId?: StateExamModuleId;
  moduleMaxScore?: number;
  officialTimeMinutes?: number;
}

export interface QuizMeta {
  title: string;
  description?: string;
  targetLanguageCode: SupportedLanguage;
  nativeLanguageCode: NativeLangCode | null;
  /** Estimated duration in minutes (AI hint or manual). */
  estimatedMinutes?: number;
}

export interface QuizDocument {
  id: string;
  schemaVersion: typeof QUIZ_SCHEMA_VERSION;
  source: QuizSource;
  meta: QuizMeta;
  sections: QuizSection[];
  examEvaluation: QuizExamEvaluation;
  createdAtIso: string;
}

// ---------------------------------------------------------------------------
// User answers (discriminated by question type)
// ---------------------------------------------------------------------------

export interface MultipleChoiceAnswer {
  kind: 'multiple-choice';
  selectedOptionId: string;
}

export interface FillGapAnswer {
  kind: 'fill-gap';
  /** gapId → selected option id */
  selections: Record<string, string>;
}

export interface VoiceQuizAnswer {
  kind: 'voice';
  transcription: string;
  /** Set after optional upload (same pattern as chat voice attachments). */
  audioUrl?: string;
}

export interface TextQuizAnswer {
  kind: 'text';
  text: string;
}

export type QuizAnswerPayload =
  | MultipleChoiceAnswer
  | FillGapAnswer
  | VoiceQuizAnswer
  | TextQuizAnswer;

export interface QuizAnswer {
  questionId: string;
  questionType: QuizQuestionType;
  payload: QuizAnswerPayload;
  /** ISO timestamp when the user last changed this answer. */
  updatedAtIso: string;
  /** ISO timestamp when the user pressed submit for this question. */
  submittedAtIso?: string;
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export type QuizQuestionResultStatus =
  | 'pending'
  | 'correct'
  | 'incorrect'
  | 'partial'
  | 'needs-review';

export interface QuizQuestionResult {
  questionId: string;
  status: QuizQuestionResultStatus;
  score: number;
  maxScore: number;
  /** Local check or AI feedback on submit (markdown). */
  feedback?: string;
  /** Lazy AI explanation after user clicks "Why" on a wrong answer. */
  whyExplanation?: string;
  evaluatedAtIso?: string;
}

export interface QuizExamResult {
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  /** Per-module breakdown for state certification exams. */
  moduleResults?: StateExamModuleResult[];
  /** Short local summary shown immediately after submit. */
  summaryMarkdown: string;
  /** Lazy AI deep-dive after user clicks "Get detailed feedback". */
  detailedFeedbackMarkdown?: string;
  evaluatedAtIso: string;
}

// ---------------------------------------------------------------------------
// Progress state (mutable)
// ---------------------------------------------------------------------------

export interface QuizProgress {
  quizId: string;
  status: QuizStatus;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, QuizAnswer | undefined>;
  questionResults: Record<string, QuizQuestionResult | undefined>;
  examResult?: QuizExamResult;
  startedAtIso?: string;
  submittedAtIso?: string;
  evaluatedAtIso?: string;
  updatedAtIso: string;
}

// ---------------------------------------------------------------------------
// Firestore document
// ---------------------------------------------------------------------------

export interface UserQuizRecord {
  quiz: QuizDocument;
  progress: QuizProgress;
  createdAtIso: string;
  updatedAtIso: string;
}

// ---------------------------------------------------------------------------
// Creator inputs
// ---------------------------------------------------------------------------

/** How many questions the generator produces per activity-type section. */
export const NEWS_QUIZ_QUESTIONS_PER_TYPE = 3;

/** Speaking section uses a single vision-grounded question. */
export const NEWS_QUIZ_PICTURE_QUESTIONS = 1;

export interface CreateNewsQuizInput {
  newsId: string;
  title: string;
  content: string;
  complexity: NewsLanguageComplexity;
  targetLanguageCode: SupportedLanguage;
  nativeLanguageCode: NativeLangCode | null;
  /** News article image; when absent, `describe-picture-voice` section is omitted. */
  imageUrl: string | null;
}

/** Shape returned by AI before post-processing (ids may be omitted). */
export type GeneratedQuizDraft = Omit<QuizDocument, 'id' | 'schemaVersion' | 'createdAtIso'>;

// ---------------------------------------------------------------------------
// Session hook surface (for implementers)
// ---------------------------------------------------------------------------

export interface QuizSessionNavigation {
  currentSectionIndex: number;
  currentQuestionIndex: number;
  currentSection: QuizSection | null;
  currentQuestion: QuizQuestion | null;
  sectionTitle: string | null;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  totalQuestions: number;
  answeredCount: number;
}

export interface QuizSessionActions {
  goBack: () => Promise<void>;
  goNext: () => Promise<void>;
  setAnswer: (questionId: string, payload: QuizAnswerPayload) => Promise<void>;
  submitQuestion: (questionId: string) => Promise<void>;
  /** Lazy AI explanation for a wrong auto-graded answer. */
  explainAnswer: (questionId: string) => Promise<void>;
  submitExam: () => Promise<void>;
  /** Lazy AI exam analysis (all answers + examEvaluation instruction). */
  requestDetailedFeedback: () => Promise<void>;
  /** Wipe progress and restart; keeps quiz definition. */
  resetProgress: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export const isWordTranslationQuestion = (q: QuizQuestion): q is WordTranslationQuestion =>
  q.type === 'word-translation';

export const isFillGapQuestion = (q: QuizQuestion): q is FillGapQuestion =>
  q.type === 'fill-gap';

export const isReadAndAnswerQuestion = (q: QuizQuestion): q is ReadAndAnswerQuestion =>
  q.type === 'read-and-answer';

export const isListeningQuestion = (q: QuizQuestion): q is ListeningQuestion =>
  q.type === 'listening';

export const isDescribePictureVoiceQuestion = (
  q: QuizQuestion,
): q is DescribePictureVoiceQuestion => q.type === 'describe-picture-voice';

export const isMonologueVoiceQuestion = (q: QuizQuestion): q is MonologueVoiceQuestion =>
  q.type === 'monologue-voice';

export const isWritingTextQuestion = (q: QuizQuestion): q is WritingTextQuestion =>
  q.type === 'writing-text';

export const isStateExamQuiz = (quiz: QuizDocument): boolean => quiz.source.type === 'state-exam';

export const isMultipleChoiceAnswer = (a: QuizAnswerPayload): a is MultipleChoiceAnswer =>
  a.kind === 'multiple-choice';

export const isFillGapAnswer = (a: QuizAnswerPayload): a is FillGapAnswer => a.kind === 'fill-gap';

export const isVoiceQuizAnswer = (a: QuizAnswerPayload): a is VoiceQuizAnswer => a.kind === 'voice';

export const isTextQuizAnswer = (a: QuizAnswerPayload): a is TextQuizAnswer => a.kind === 'text';

export const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const flattenQuizQuestions = (quiz: QuizDocument): QuizQuestion[] =>
  quiz.sections.flatMap((section) => section.questions);

export const findQuestionById = (
  quiz: QuizDocument,
  questionId: string,
): { section: QuizSection; question: QuizQuestion; sectionIndex: number; questionIndex: number } | null => {
  for (let sectionIndex = 0; sectionIndex < quiz.sections.length; sectionIndex++) {
    const section = quiz.sections[sectionIndex];
    const questionIndex = section.questions.findIndex((q) => q.id === questionId);
    if (questionIndex >= 0) {
      return { section, question: section.questions[questionIndex], sectionIndex, questionIndex };
    }
  }
  return null;
};

/** Per-quiz completion stats at `stats/quiz/stats/{quizId}`. */
export interface QuizStat {
  /** Maps userId → ISO timestamp of the latest completion. */
  completionsUserIds: Record<string, string>;
  updatedAtIso: string;
}

export const createInitialQuizProgress = (quizId: string): QuizProgress => ({
  quizId,
  status: 'not-started',
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  questionResults: {},
  updatedAtIso: new Date().toISOString(),
});
