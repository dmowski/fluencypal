export type PolishB1SpeakingPhotoTask = {
  promptText: string;
  imageUrl: string;
  imageDescription: string;
};

export type PolishB1SpeakingMonologueTask = {
  topicPrompt: string;
  minWords: number;
  maxWords: number;
};

export type PolishB1SpeakingSituationalTask = {
  topicPrompt: string;
  minWords: number;
  maxWords: number;
};

export interface PolishB1SpeakingVariant {
  variantId: string;
  label: string;
  inspirationNote: string;
  photo: PolishB1SpeakingPhotoTask;
  monologue: PolishB1SpeakingMonologueTask;
  situational: PolishB1SpeakingSituationalTask;
}
