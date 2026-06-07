import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizQuestion, QuizSection } from '../types';
import {
  ExamGrammarItem,
  ExamListeningItem,
  ExamReadingPassage,
  ExamSpeakingImage,
} from './examContentTypes';
import { buildFillGapQuestion, buildMcOptions } from './examQuizBuilders';

type MixedExamCategory = 'reading' | 'listening' | 'grammar' | 'speaking';

const MAX_CONSECUTIVE_SAME_CATEGORY = 2;

const speakingEvaluationInstruction = (
  imageDescription: string,
  targetLanguageCode: SupportedLanguage,
  languageName: string,
) =>
  `Grade the spoken description against what is actually visible in the image.

Ground truth (vision analysis):
${imageDescription}

Accept paraphrasing and minor grammar mistakes when the learner correctly identifies the main subjects, setting, and actions. Mark partial when only some elements are mentioned. Mark incorrect when the description contradicts the image or is unrelated.

Write the learner-facing Feedback in ${languageName} (${targetLanguageCode}).`;

const flattenReading = (passages: ExamReadingPassage[], limit: number): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];

  for (const passage of passages) {
    for (const item of passage.questions) {
      if (questions.length >= limit) return questions;
      const questionId = `mixed-reading-${questions.length}`;
      const { options, correctOptionId } = buildMcOptions(questionId, item.choices);
      questions.push({
        type: 'read-and-answer',
        id: questionId,
        passageText: passage.passageText,
        questionText: item.questionText,
        options,
        correctOptionId,
      });
    }
  }

  return questions;
};

const buildListeningQuestions = (items: ExamListeningItem[], limit: number): QuizQuestion[] =>
  items.slice(0, limit).map((item, index) => {
    const questionId = `mixed-listening-${index}`;
    const { options, correctOptionId } = buildMcOptions(questionId, item.choices);
    return {
      type: 'listening' as const,
      id: questionId,
      audioText: item.audioText,
      questionText: item.questionText,
      options,
      correctOptionId,
    };
  });

const buildGrammarQuestions = (items: ExamGrammarItem[], limit: number): QuizQuestion[] =>
  items.slice(0, limit).map((item, index) => {
    const questionId = `mixed-grammar-${index}`;
    const { segments, gaps } = buildFillGapQuestion(questionId, item.segments, item.gaps);
    return {
      type: 'fill-gap' as const,
      id: questionId,
      segments,
      gaps,
    };
  });

const buildSpeakingQuestions = (
  images: ExamSpeakingImage[],
  limit: number,
  targetLanguageCode: SupportedLanguage,
  languageName: string,
  minWords: number,
): QuizQuestion[] =>
  images.slice(0, limit).map((image, index) => {
    const questionId = `mixed-speaking-${index}`;
    return {
      type: 'describe-picture-voice' as const,
      id: questionId,
      imageUrl: image.imageUrl,
      imageDescription: image.imageDescription,
      promptText: image.promptText,
      minWords,
      maxWords: 120,
      evaluation: {
        instruction: speakingEvaluationInstruction(
          image.imageDescription,
          targetLanguageCode,
          languageName,
        ),
        maxScore: 1,
      },
    };
  });

const SECTION_COPY: Record<
  SupportedLanguage,
  Record<MixedExamCategory, { title: string; instructions: string }>
> = {
  en: {
    reading: {
      title: 'Reading',
      instructions: 'Read the passage and choose the best answer.',
    },
    listening: {
      title: 'Listening',
      instructions: 'Listen to the audio and answer the question.',
    },
    grammar: {
      title: 'Grammar',
      instructions: 'Complete the sentence by selecting the correct word or phrase.',
    },
    speaking: {
      title: 'Speaking',
      instructions: 'Look at the image and record a detailed description.',
    },
  },
  pl: {
    reading: {
      title: 'Czytanie',
      instructions: 'Przeczytaj tekst i wybierz najlepszą odpowiedź.',
    },
    listening: {
      title: 'Słuchanie',
      instructions: 'Posłuchaj nagrania i odpowiedz na pytanie.',
    },
    grammar: {
      title: 'Gramatyka',
      instructions: 'Uzupełnij zdanie, wybierając poprawne słowo lub wyrażenie.',
    },
    speaking: {
      title: 'Mówienie',
      instructions: 'Spójrz na zdjęcie i nagraj szczegółowy opis po polsku.',
    },
  },
} as Record<
  SupportedLanguage,
  Record<MixedExamCategory, { title: string; instructions: string }>
>;

const getSectionCopy = (targetLanguageCode: SupportedLanguage) =>
  SECTION_COPY[targetLanguageCode] ?? SECTION_COPY.en;

const getTrailingRun = (categories: MixedExamCategory[], category: MixedExamCategory): number => {
  let run = 0;
  for (let index = categories.length - 1; index >= 0; index -= 1) {
    if (categories[index] !== category) break;
    run += 1;
  }
  return run;
};

const interleaveQuestions = (
  pools: Record<MixedExamCategory, QuizQuestion[]>,
  cycle: MixedExamCategory[],
  maxConsecutiveSameCategory: number,
): QuizQuestion[] => {
  const indices: Record<MixedExamCategory, number> = {
    reading: 0,
    listening: 0,
    grammar: 0,
    speaking: 0,
  };
  const ordered: QuizQuestion[] = [];
  const recentCategories: MixedExamCategory[] = [];
  const totalTarget = Object.values(pools).reduce((sum, pool) => sum + pool.length, 0);
  let cycleIndex = 0;
  let safety = 0;

  const availableCategories = () =>
    (Object.keys(pools) as MixedExamCategory[]).filter(
      (category) => indices[category] < pools[category].length,
    );

  while (ordered.length < totalTarget && safety < totalTarget * cycle.length * 4) {
    safety += 1;
    const available = availableCategories();
    if (available.length === 0) break;

    const preferred = cycle
      .filter((category) => available.includes(category))
      .find(
        (category) =>
          getTrailingRun(recentCategories, category) < maxConsecutiveSameCategory,
      );

    const category = preferred ?? available[0];
    const pool = pools[category];
    const index = indices[category];
    ordered.push(pool[index]);
    indices[category] += 1;
    recentCategories.push(category);
    cycleIndex += 1;
  }

  return ordered;
};

const groupIntoSections = (
  ordered: { category: MixedExamCategory; question: QuizQuestion }[],
  copy: Record<MixedExamCategory, { title: string; instructions: string }>,
): QuizSection[] => {
  const sections: QuizSection[] = [];

  for (const entry of ordered) {
    const last = sections[sections.length - 1];
    const lastCategory = last?.id.split('-')[2] as MixedExamCategory | undefined;
    const canExtend =
      last &&
      lastCategory === entry.category &&
      last.questions.length < MAX_CONSECUTIVE_SAME_CATEGORY;

    if (canExtend) {
      last.questions.push(entry.question);
      continue;
    }

    sections.push({
      id: `section-${sections.length}-${entry.category}`,
      title: copy[entry.category].title,
      instructions: copy[entry.category].instructions,
      questions: [entry.question],
    });
  }

  return sections;
};

export const buildMixedExamSections = (input: {
  targetLanguageCode: SupportedLanguage;
  languageName: string;
  reading: ExamReadingPassage[];
  listening: ExamListeningItem[];
  grammar: ExamGrammarItem[];
  speakingImages: ExamSpeakingImage[];
  counts: Record<MixedExamCategory, number>;
  speakingMinWords: number;
  /** Order in which categories are drawn when building the mixed sequence. */
  cycle?: MixedExamCategory[];
}): QuizSection[] => {
  const copy = getSectionCopy(input.targetLanguageCode);
  const cycle = input.cycle ?? ['reading', 'listening', 'grammar', 'speaking'];

  const pools: Record<MixedExamCategory, QuizQuestion[]> = {
    reading: flattenReading(input.reading, input.counts.reading),
    listening: buildListeningQuestions(input.listening, input.counts.listening),
    grammar: buildGrammarQuestions(input.grammar, input.counts.grammar),
    speaking: buildSpeakingQuestions(
      input.speakingImages,
      input.counts.speaking,
      input.targetLanguageCode,
      input.languageName,
      input.speakingMinWords,
    ),
  };

  const categoryForQuestion = (question: QuizQuestion): MixedExamCategory => {
    if (question.type === 'read-and-answer') return 'reading';
    if (question.type === 'listening') return 'listening';
    if (question.type === 'fill-gap') return 'grammar';
    return 'speaking';
  };

  const ordered = interleaveQuestions(pools, cycle, MAX_CONSECUTIVE_SAME_CATEGORY).map((question) => ({
    category: categoryForQuestion(question),
    question,
  }));

  return groupIntoSections(ordered, copy);
};

const getSectionCategory = (section: QuizSection): MixedExamCategory =>
  section.id.split('-')[2] as MixedExamCategory;

export const getMaxConsecutiveSameCategory = (sections: QuizSection[]): number => {
  let maxRun = 0;
  let currentRun = 0;
  let previousCategory: MixedExamCategory | null = null;

  for (const section of sections) {
    const category = getSectionCategory(section);
    if (category === previousCategory) {
      currentRun += section.questions.length;
    } else {
      currentRun = section.questions.length;
      previousCategory = category;
    }
    maxRun = Math.max(maxRun, currentRun);
  }

  return maxRun;
};

export const getMaxConsecutiveForCategory = (
  sections: QuizSection[],
  targetCategory: MixedExamCategory,
): number => {
  let maxRun = 0;
  let currentRun = 0;

  for (const section of sections) {
    const category = getSectionCategory(section);
    if (category === targetCategory) {
      currentRun += section.questions.length;
      maxRun = Math.max(maxRun, currentRun);
      continue;
    }
    currentRun = 0;
  }

  return maxRun;
};
