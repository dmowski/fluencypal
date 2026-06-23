import examQuizManifest from '../Polish/speaking/examQuiz-manifest.json';
import { EXAM_QUIZ_IMAGE_SPECS } from '../Polish/speaking/examQuizImageCatalog';
import {
  POLISH_B1_EXAM_QUIZ_IMAGES,
  POLISH_B1_EXAM_QUIZ_IMAGE_DESCRIPTIONS,
} from '../Polish/speaking/examQuizImages';
import { POLISH_B1_SPEAKING_EXAMS } from './polishB1Speaking/polishB1SpeakingExam';
import { isDescribePictureVoiceQuestion } from '../types';

describe('Polish B1 exam quiz images', () => {
  it('registers all 20 local speaking photos with vision descriptions', () => {
    expect(EXAM_QUIZ_IMAGE_SPECS).toHaveLength(20);
    expect(examQuizManifest.images).toHaveLength(20);
    expect(Object.keys(POLISH_B1_EXAM_QUIZ_IMAGES)).toHaveLength(20);
    expect(Object.keys(POLISH_B1_EXAM_QUIZ_IMAGE_DESCRIPTIONS)).toHaveLength(20);

    for (const spec of EXAM_QUIZ_IMAGE_SPECS) {
      expect(POLISH_B1_EXAM_QUIZ_IMAGES[spec.id]).toBe(`/examQuiz/${spec.fileName}`);
      expect(POLISH_B1_EXAM_QUIZ_IMAGE_DESCRIPTIONS[spec.id].length).toBeGreaterThan(80);
    }
  });

  it('uses local examQuiz URLs in speaking variants that reference new photos', () => {
    const localUrls = new Set(Object.values(POLISH_B1_EXAM_QUIZ_IMAGES));
    const examsWithLocalPhotos = POLISH_B1_SPEAKING_EXAMS.filter((exam) => {
      const photo = exam.sections[0].questions[0];
      return isDescribePictureVoiceQuestion(photo) && localUrls.has(photo.imageUrl);
    });

    expect(examsWithLocalPhotos.length).toBeGreaterThanOrEqual(20);
  });
});
