import { GameQuestionType } from "./types";

export const allGameTypes: GameQuestionType[] = [
  "translate",
  "sentence",
  "describe_image",
  "topic_to_discuss",
  "read_text",
];

export const achievementsMaxPoints: Record<GameQuestionType, number> = {
  translate: 50,
  sentence: 50,
  describe_image: 100,
  topic_to_discuss: 300,
  read_text: 100,
};
