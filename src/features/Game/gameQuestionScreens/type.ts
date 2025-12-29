import { GameQuestionShort } from "../types";

export interface GameQuestionScreenProps {
  onSubmitAnswer: (
    questionId: string,
    answer: string
  ) => Promise<{ isCorrect: boolean; description: string | null }>;
}
