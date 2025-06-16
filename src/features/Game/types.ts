import { SupportedLanguage } from "../Lang/lang";

export type GameQuestionType = "translate" | "sentence" | "describe_image";

export interface GameQuestionShort {
  id: string;
  type: GameQuestionType;
  question: string;
  imageUrl?: string;
  options: string[];
}

// Private
export interface GameQuestionFull extends GameQuestionShort {
  correctAnswer: string;
  createdAt: number;
  answeredAt: number | null;
  learningLanguage: SupportedLanguage;
  isAnsweredCorrectly: boolean | null;
}

export interface GameProfile {
  username: string;
  avatarUrl: string;
}

// [UserName]: points
export type GameUsersPoints = Record<string, number>;

// [UserName]: last visit timestamp
export type GameLastVisit = Record<string, number>;

export interface UsersStat {
  username: string;
  points: number;
}

export interface GetGameQuestionsRequest {
  nativeLanguageCode: string;
}

export type GetGameQuestionsResponse = GameQuestionShort[];

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
