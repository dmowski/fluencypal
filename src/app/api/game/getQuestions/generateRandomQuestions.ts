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

  for (let i = 0; i < 100; i++) {
    const shortQuestion: GameQuestion = {
      id: `${Date.now()}_${i}`,
      type: i % 2 === 0 ? "translate" : "sentence",
      question: "",
      options: ["Hello", "Hi", "Hey" + i, "Howdy"],
    };

    const question: GameQuestionFull = {
      ...shortQuestion,
      createdAt: Date.now(),
      answeredAt: null,
      isAnsweredCorrectly: false,
      correctAnswer: "Hey" + i,
    };
  }

  return {
    fullAnswers: questions,
    shortAnswers: shortQuestions,
  };
};
