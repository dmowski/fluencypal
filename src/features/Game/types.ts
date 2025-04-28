export type GameQuestionType = "translate" | "sentence";

export interface GameQuestionShort {
  id: string;
  type: GameQuestionType;
  question: string;
  options: string[];
}

// Private
export interface GameQuestionFull extends GameQuestionShort {
  correctAnswer: string;
  createdAt: number;
  answeredAt: number | null;
  isAnsweredCorrectly: boolean | null;
}

export interface GameProfile {
  username: string;
  avatarUrl: string;
}

// [UserName]: points
export type GameUsersPoints = Record<string, number>;

export interface UsersStat {
  username: string;
  points: number;
}
