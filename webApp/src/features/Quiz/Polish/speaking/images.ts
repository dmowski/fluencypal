import {
  EXAM_SPEAKING_IMAGE_DESCRIPTIONS,
  EXAM_SPEAKING_IMAGE_URLS,
} from '../../exam/examSpeakingImages';

/** Verified Firebase Storage images for B1 speaking photo tasks. */
export const POLISH_B1_SPEAKING_IMAGES = EXAM_SPEAKING_IMAGE_URLS;

export const POLISH_B1_SPEAKING_IMAGE_DESCRIPTIONS = EXAM_SPEAKING_IMAGE_DESCRIPTIONS;

export type PolishB1SpeakingImageKey = keyof typeof POLISH_B1_SPEAKING_IMAGES;

export const photoTask = (
  key: PolishB1SpeakingImageKey,
  promptText: string,
): { promptText: string; imageUrl: string; imageDescription: string } => ({
  promptText,
  imageUrl: POLISH_B1_SPEAKING_IMAGES[key],
  imageDescription: POLISH_B1_SPEAKING_IMAGE_DESCRIPTIONS[key],
});
