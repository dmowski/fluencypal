import { GameUsersPoints } from "@/features/Game/types";
import { SupportedLanguage } from "@/features/Lang/lang";

export interface GetGameQuestionsRequest {
  nativeLanguageCode: SupportedLanguage;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  updatedUserPoints: GameUsersPoints;
  description: string | null;
}

export interface UpdateUserProfileRequest {
  username: string;
}

export interface UpdateUserProfileResponse {
  error: string | null;
  isUpdated: boolean;
}
