import { QuizQuestion, QuizSection } from '../../types';
import { buildFillGapQuestion, buildMcOptions } from '../examQuizBuilders';
import {
  ExamGrammarItem,
  ExamListeningItem,
  ExamReadingPassage,
  ExamSpeakingImage,
} from '../examContentTypes';
import {
  MONOLOGUE_EVALUATION_INSTRUCTION,
  PICTURE_SPEAKING_EVALUATION_INSTRUCTION,
  SITUATIONAL_SPEAKING_EVALUATION_INSTRUCTION,
  STATE_B1_MODULE_MAX_SCORE,
  STATE_B1_MODULE_TIME_MINUTES,
  WRITING_EVALUATION_INSTRUCTION,
} from './stateExamConstants';
import { StatePolishB1PilotContent } from './pilotV01Content';

const buildListeningQuestions = (items: ExamListeningItem[]): QuizQuestion[] =>
  items.map((item, index) => {
    const questionId = `q-listening-${index}`;
    const { options, correctOptionId } = buildMcOptions(questionId, item.choices);
    return {
      type: 'listening' as const,
      id: questionId,
      audioText: item.audioText,
      questionText: item.questionText,
      options,
      correctOptionId,
      maxScore: item.maxScore ?? 6,
    };
  });

const buildReadingQuestions = (passages: ExamReadingPassage[]): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  let index = 0;

  for (const passage of passages) {
    for (const item of passage.questions) {
      const questionId = `q-reading-${index}`;
      const { options, correctOptionId } = buildMcOptions(questionId, item.choices);
      questions.push({
        type: 'read-and-answer',
        id: questionId,
        passageText: passage.passageText,
        questionText: item.questionText,
        options,
        correctOptionId,
        maxScore: item.maxScore ?? 6,
      });
      index += 1;
    }
  }

  return questions;
};

const buildGrammarQuestions = (items: ExamGrammarItem[]): QuizQuestion[] =>
  items.map((item, index) => {
    const questionId = `q-grammar-${index}`;
    const { segments, gaps } = buildFillGapQuestion(questionId, item.segments, item.gaps);
    return {
      type: 'fill-gap' as const,
      id: questionId,
      segments,
      gaps,
      maxScore: item.maxScore ?? 4,
    };
  });

const buildSpeakingQuestions = (images: ExamSpeakingImage[]): QuizQuestion[] => {
  const [photo, monologue, situational] = images;
  const questions: QuizQuestion[] = [];

  if (photo) {
    questions.push({
      type: 'describe-picture-voice',
      id: 'q-speaking-photo',
      imageUrl: photo.imageUrl,
      imageDescription: photo.imageDescription,
      promptText: photo.promptText,
      minWords: 35,
      maxWords: 120,
      evaluation: {
        instruction: `${PICTURE_SPEAKING_EVALUATION_INSTRUCTION}\n\nGround truth (vision analysis):\n${photo.imageDescription}`,
        maxScore: 13,
      },
    });
  }

  if (monologue) {
    questions.push({
      type: 'monologue-voice',
      id: 'q-speaking-monologue',
      topicPrompt: monologue.promptText,
      minWords: 50,
      maxWords: 180,
      evaluation: {
        instruction: MONOLOGUE_EVALUATION_INSTRUCTION,
        maxScore: 14,
      },
    });
  }

  if (situational) {
    questions.push({
      type: 'monologue-voice',
      id: 'q-speaking-situational',
      topicPrompt: situational.promptText,
      minWords: 30,
      maxWords: 120,
      evaluation: {
        instruction: SITUATIONAL_SPEAKING_EVALUATION_INSTRUCTION,
        maxScore: 13,
      },
    });
  }

  return questions;
};

export const buildStatePolishB1Sections = (content: StatePolishB1PilotContent): QuizSection[] => [
  {
    id: 'section-listening',
    title: 'Rozumienie ze słuchu',
    moduleId: 'listening',
    moduleMaxScore: STATE_B1_MODULE_MAX_SCORE.listening,
    officialTimeMinutes: STATE_B1_MODULE_TIME_MINUTES.listening,
    instructions:
      'Posłuchaj nagrań i wybierz właściwą odpowiedź. Możesz odtworzyć nagranie tyle razy, ile potrzebujesz. W zadaniu TAK/NIE wybierz, czy zdanie jest zgodne z tekstem.',
    questions: buildListeningQuestions(content.listening),
  },
  {
    id: 'section-reading',
    title: 'Rozumienie tekstów pisanych',
    moduleId: 'reading',
    moduleMaxScore: STATE_B1_MODULE_MAX_SCORE.reading,
    officialTimeMinutes: STATE_B1_MODULE_TIME_MINUTES.reading,
    instructions:
      'Przeczytaj teksty uważnie i wybierz właściwą odpowiedź. W zadaniu TAK/NIE oceń zgodność zdań z tekstem.',
    questions: buildReadingQuestions(content.reading),
  },
  {
    id: 'section-grammar',
    title: 'Poprawność gramatyczna',
    moduleId: 'grammar',
    moduleMaxScore: STATE_B1_MODULE_MAX_SCORE.grammar,
    officialTimeMinutes: STATE_B1_MODULE_TIME_MINUTES.grammar,
    instructions: 'Uzupełnij zdania, wybierając poprawną formę w każdej luce.',
    questions: buildGrammarQuestions(content.grammar),
  },
  {
    id: 'section-writing',
    title: 'Pisanie',
    moduleId: 'writing',
    moduleMaxScore: STATE_B1_MODULE_MAX_SCORE.writing,
    officialTimeMinutes: STATE_B1_MODULE_TIME_MINUTES.writing,
    instructions:
      'Wykonaj oba zadania pisemne. Pierwsze to krótki tekst funkcjonalny, drugie — dłuższa wypowiedź. Licz słowa — odpowiedź musi mieścić się w podanym zakresie.',
    questions: content.writing.map((task, index) => ({
      type: 'writing-text' as const,
      id: `q-writing-${index}`,
      promptText: task.promptText,
      minWords: task.minWords,
      maxWords: task.maxWords,
      taskGenre: task.taskGenre,
      imageUrl: task.imageUrl,
      imageDescription: task.imageDescription,
      evaluation: {
        instruction: WRITING_EVALUATION_INSTRUCTION,
        maxScore: 15,
      },
    })),
  },
  {
    id: 'section-speaking',
    title: 'Mówienie',
    moduleId: 'speaking',
    moduleMaxScore: STATE_B1_MODULE_MAX_SCORE.speaking,
    officialTimeMinutes: STATE_B1_MODULE_TIME_MINUTES.speaking,
    instructions:
      'Wykonaj trzy zadania ustne: opis zdjęcia, monolog na temat oraz wypowiedź w sytuacji komunikacyjnej. Nagraj odpowiedzi po polsku.',
    questions: buildSpeakingQuestions(content.speaking),
  },
];
