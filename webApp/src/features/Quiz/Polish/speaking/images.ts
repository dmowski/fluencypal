import {
  EXAM_SPEAKING_IMAGE_DESCRIPTIONS,
  EXAM_SPEAKING_IMAGE_URLS,
} from '../../exam/examSpeakingImages';
import {
  POLISH_B1_EXAM_QUIZ_IMAGE_DESCRIPTIONS,
  POLISH_B1_EXAM_QUIZ_IMAGES,
} from './examQuizImages';
import { PolishB1SpeakingPhotoKey } from './examQuizImageCatalog';

const LEGACY_SPEAKING_IMAGES = EXAM_SPEAKING_IMAGE_URLS;
const LEGACY_SPEAKING_DESCRIPTIONS = EXAM_SPEAKING_IMAGE_DESCRIPTIONS;

/** All speaking photo URLs: legacy Firebase images + local /examQuiz/ assets. */
export const POLISH_B1_SPEAKING_IMAGES = {
  ...LEGACY_SPEAKING_IMAGES,
  ...POLISH_B1_EXAM_QUIZ_IMAGES,
} as Record<PolishB1SpeakingPhotoKey, string>;

export const POLISH_B1_SPEAKING_IMAGE_DESCRIPTIONS = {
  ...LEGACY_SPEAKING_DESCRIPTIONS,
  ...POLISH_B1_EXAM_QUIZ_IMAGE_DESCRIPTIONS,
} as Record<PolishB1SpeakingPhotoKey, string>;

export type { PolishB1SpeakingPhotoKey as PolishB1SpeakingImageKey };

export const photoTask = (
  key: PolishB1SpeakingPhotoKey,
  promptText: string,
): { promptText: string; imageUrl: string; imageDescription: string } => ({
  promptText,
  imageUrl: POLISH_B1_SPEAKING_IMAGES[key],
  imageDescription: POLISH_B1_SPEAKING_IMAGE_DESCRIPTIONS[key],
});
