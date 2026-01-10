import { GameAchievement, GameQuestionType } from "./types";

export const allGameTypes: GameQuestionType[] = [
  "translate",
  "sentence",
  "describe_image",
  "topic_to_discuss",
  "read_text",
];

export const allAchievementTypes: GameAchievement[] = [...allGameTypes, "chat_message"];

export const achievementsMaxPoints: Record<GameAchievement, number> = {
  translate: 50,
  sentence: 50,
  describe_image: 100,
  topic_to_discuss: 300,
  read_text: 100,
  chat_message: 200,
  ai_conversation: 500,
};
