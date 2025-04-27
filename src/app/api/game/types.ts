import { GameUsersPoints } from "@/features/Game/types";
import { SupportedLanguage } from "@/features/Lang/lang";

export interface GetGameQuestionsRequest {
  nativeLanguage: SupportedLanguage;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  updatedUserPoints: GameUsersPoints;
}
