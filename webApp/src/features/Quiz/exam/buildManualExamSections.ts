import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizQuestion, QuizSection } from '../types';
import {
  ExamGrammarItem,
  ExamListeningItem,
  ExamReadingPassage,
  ExamSpeakingImage,
} from './examContentTypes';
import { buildFillGapQuestion, buildMcOptions } from './examQuizBuilders';
import { ExamCefrLevel, EXAM_LEVEL_CONFIG } from './examLevelConfig';

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
  let questionIndex = 0;

  for (const passage of passages) {
    for (const item of passage.questions) {
      if (questionIndex >= limit) return questions;
      const questionId = `q-0-${questionIndex}`;
      const { options, correctOptionId } = buildMcOptions(questionId, item.choices);
      questions.push({
        type: 'read-and-answer',
        id: questionId,
        passageText: passage.passageText,
        questionText: item.questionText,
        options,
        correctOptionId,
      });
      questionIndex += 1;
    }
  }

  return questions;
};

const buildListeningQuestions = (items: ExamListeningItem[], limit: number): QuizQuestion[] =>
  items.slice(0, limit).map((item, index) => {
    const questionId = `q-1-${index}`;
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
    const questionId = `q-2-${index}`;
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
    const questionId = `q-3-${index}`;
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
  Record<
    'reading' | 'listening' | 'grammar' | 'speaking',
    { title: string; instructions: string }
  >
> = {
  en: {
    reading: {
      title: 'Reading',
      instructions:
        'Read each passage carefully and choose the best answer. You have several reading tasks in this section.',
    },
    listening: {
      title: 'Listening',
      instructions:
        'Listen to each audio clip and answer the question. You can replay the audio as many times as you need.',
    },
    grammar: {
      title: 'Grammar',
      instructions: 'Complete each sentence by selecting the correct word or phrase for every gap.',
    },
    speaking: {
      title: 'Speaking',
      instructions:
        'Look at each image and record a detailed description in English. Aim for clear, connected sentences.',
    },
  },
  pl: {
    reading: {
      title: 'Czytanie',
      instructions:
        'Przeczytaj każdy tekst uważnie i wybierz najlepszą odpowiedź. W tej sekcji masz kilka zadań czytania ze zrozumieniem.',
    },
    listening: {
      title: 'Słuchanie',
      instructions:
        'Posłuchaj każdego nagrania i odpowiedz na pytanie. Możesz odtworzyć nagranie tyle razy, ile potrzebujesz.',
    },
    grammar: {
      title: 'Gramatyka',
      instructions: 'Uzupełnij każde zdanie, wybierając poprawne słowo lub wyrażenie w każdej luce.',
    },
    speaking: {
      title: 'Mówienie',
      instructions:
        'Spójrz na każde zdjęcie i nagraj szczegółowy opis po polsku. Staraj się używać jasnych, połączonych zdań.',
    },
  },
} as Record<
  SupportedLanguage,
  Record<'reading' | 'listening' | 'grammar' | 'speaking', { title: string; instructions: string }>
>;

const getSectionCopy = (targetLanguageCode: SupportedLanguage) =>
  SECTION_COPY[targetLanguageCode] ?? SECTION_COPY.en;

export const buildManualExamSections = (input: {
  targetLanguageCode: SupportedLanguage;
  languageName: string;
  level: ExamCefrLevel;
  reading: ExamReadingPassage[];
  listening: ExamListeningItem[];
  grammar: ExamGrammarItem[];
  speakingImages: ExamSpeakingImage[];
}): QuizSection[] => {
  const config = EXAM_LEVEL_CONFIG[input.level];
  const copy = getSectionCopy(input.targetLanguageCode);

  return [
    {
      id: 'section-0-reading',
      title: copy.reading.title,
      instructions: copy.reading.instructions,
      questions: flattenReading(input.reading, config.readingCount),
    },
    {
      id: 'section-1-listening',
      title: copy.listening.title,
      instructions: copy.listening.instructions,
      questions: buildListeningQuestions(input.listening, config.listeningCount),
    },
    {
      id: 'section-2-grammar',
      title: copy.grammar.title,
      instructions: copy.grammar.instructions,
      questions: buildGrammarQuestions(input.grammar, config.grammarCount),
    },
    {
      id: 'section-3-speaking',
      title: copy.speaking.title,
      instructions: copy.speaking.instructions,
      questions: buildSpeakingQuestions(
        input.speakingImages,
        config.speakingCount,
        input.targetLanguageCode,
        input.languageName,
        config.speakingMinWords,
      ),
    },
  ];
};
