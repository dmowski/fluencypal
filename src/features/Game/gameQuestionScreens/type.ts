import { GameQuestionShort } from "../types";

export interface GameQuestionScreenProps {
  question: GameQuestionShort;
  onSubmitAnswer: (
    questionId: string,
    answer: string
  ) => Promise<{ isCorrect: boolean; description: string | null }>;
}
