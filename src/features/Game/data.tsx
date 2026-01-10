import { GameAchievement, GameQuestionType } from "./types";

export const allGameTypes: GameQuestionType[] = [
  "translate",
  "sentence",
  "describe_image",
  "topic_to_discuss",
  "read_text",
];

const achievementMap: Record<GameAchievement, boolean> = {
  translate: true,
  sentence: true,
  describe_image: true,
  topic_to_discuss: true,
  read_text: true,
  chat_message: true,
  ai_conversation: true,
};

export const allAchievementTypes: GameAchievement[] = Object.keys(
  achievementMap
) as GameAchievement[];

export const achievementsMaxPoints: Record<GameAchievement, number> = {
  translate: 50,
  sentence: 50,
  describe_image: 100,
  topic_to_discuss: 300,
  read_text: 100,
  chat_message: 200,
  ai_conversation: 500,
};
