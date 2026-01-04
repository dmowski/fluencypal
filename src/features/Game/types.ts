import { NativeLangCode } from "@/libs/language/type";
import { SupportedLanguage } from "../Lang/lang";
import { GameBattle } from "./Battle/types";

export type GameQuestionType =
  | "translate"
  | "sentence"
  | "describe_image"
  | "topic_to_discuss"
  | "read_text";

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

// [UserId]: points
export type GameUsersPoints = Record<string, number>;

// [UserId]: last visit timestamp
export type GameLastVisit = Record<string, string>;

// [UserId]: avatarUrl
export type GameAvatars = Record<string, string>;

// [UserId]: username
export type GameUserNames = Record<string, string>;

export interface UsersStat {
  userId: string;
  points: number;
}

export interface GetGameQuestionsRequest {
  nativeLanguageCode: NativeLangCode;
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

export type GameAchievement = GameQuestionType | "chat_message";

export type GameAchievements = Partial<Record<GameAchievement, number>>;

// [UserId]: achievement points
export type GameUsersAchievements = Record<string, GameAchievements>;

export interface SubmitBattleRequest {
  battle: GameBattle;
}

export interface SubmitBattleResponse {
  isDone: boolean;
}
