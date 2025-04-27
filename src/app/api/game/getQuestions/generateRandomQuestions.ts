import { GameQuestion, GameQuestionFull } from "@/features/Game/types";
import { SupportedLanguage } from "@/features/Lang/lang";

interface generateRandomQuestionsProps {
  userInfoRecords: string[];
  nativeLanguage: SupportedLanguage;
  learningLanguage: SupportedLanguage;
}

export const generateRandomQuestions = async ({
  userInfoRecords,
  nativeLanguage,
  learningLanguage,
}: generateRandomQuestionsProps): Promise<{
  fullAnswers: GameQuestionFull[];
  shortAnswers: GameQuestion[];
}> => {
  const questions: GameQuestionFull[] = [];
  const shortQuestions: GameQuestion[] = [];

  // TODO: Generate questions with AI
  for (let i = 0; i < 2; i++) {
    const shortQuestion: GameQuestion = {
      id: `${Date.now()}_${i}`,
      type: i % 2 === 0 ? "translate" : "sentence",
      question: "What is your name?",
      options: ["Hello", "Hi", "Hey" + i, "Howdy"],
    };

    const question: GameQuestionFull = {
      ...shortQuestion,
      createdAt: Date.now(),
      answeredAt: null,
      isAnsweredCorrectly: false,
      correctAnswer: "Hey" + i,
    };
    questions.push(question);
    shortQuestions.push(shortQuestion);
  }

  return {
    fullAnswers: questions,
    shortAnswers: shortQuestions,
  };
};
