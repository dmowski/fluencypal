import { GameQuestionType } from "./types";

export const pointsIncreaseMap: Record<GameQuestionType, number> = {
  describe_image: 3,
  translate: 1,
  sentence: 2,
  topic_to_discuss: 7,
  read_text: 2,
};
