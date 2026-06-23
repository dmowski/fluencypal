import examQuizManifest from './examQuiz-manifest.json';
import { ExamQuizImageId } from './examQuizImageCatalog';

type ExamQuizManifestEntry = {
  id: ExamQuizImageId;
  fileName: string;
  url: string;
  description: string;
};

const entries = examQuizManifest.images as ExamQuizManifestEntry[];

export const POLISH_B1_EXAM_QUIZ_IMAGES = Object.fromEntries(
  entries.map((entry) => [entry.id, entry.url]),
) as Partial<Record<ExamQuizImageId, string>>;

export const POLISH_B1_EXAM_QUIZ_IMAGE_DESCRIPTIONS = Object.fromEntries(
  entries.map((entry) => [entry.id, entry.description]),
) as Partial<Record<ExamQuizImageId, string>>;
