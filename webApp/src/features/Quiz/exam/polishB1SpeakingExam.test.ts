import { getTotalQuestions } from '../session/quizNavigation';
import {
  isDescribePictureVoiceQuestion,
  isMonologueVoiceQuestion,
} from '../types';
import {
  POLISH_B1_SPEAKING_EXAM_GROUP,
  POLISH_B1_SPEAKING_EXAMS,
  resolvePolishB1SpeakingExam,
} from './polishB1Speaking/polishB1SpeakingCatalog';
import {
  POLISH_B1_SPEAKING_ESTIMATED_MINUTES,
  POLISH_B1_SPEAKING_EXAM_GROUP_ID,
} from './polishB1Speaking/polishB1SpeakingExam';
import { POLISH_B1_SPEAKING_VARIANT_COUNT } from '../Polish/speaking/variants';

describe('Polish B1 speaking exam', () => {
  it('registers 30 variants with three speaking tasks each', () => {
    expect(POLISH_B1_SPEAKING_VARIANT_COUNT).toBe(30);
    expect(POLISH_B1_SPEAKING_EXAMS).toHaveLength(30);

    for (const exam of POLISH_B1_SPEAKING_EXAMS) {
      expect(exam.meta.targetLanguageCode).toBe('pl');
      expect(exam.sections).toHaveLength(1);
      expect(exam.sections[0].title).toBe('Mówienie');
      expect(exam.sections[0].moduleId).toBe('speaking');
      expect(getTotalQuestions(exam)).toBe(3);

      const [photo, monologue, situational] = exam.sections[0].questions;
      expect(isDescribePictureVoiceQuestion(photo)).toBe(true);
      expect(isMonologueVoiceQuestion(monologue)).toBe(true);
      expect(isMonologueVoiceQuestion(situational)).toBe(true);
      if (isDescribePictureVoiceQuestion(photo)) {
        expect(photo.imageDescription.length).toBeGreaterThan(80);
      }
    }
  });

  it('exposes a dashboard speaking group with variant options', () => {
    expect(POLISH_B1_SPEAKING_EXAM_GROUP.id).toBe(POLISH_B1_SPEAKING_EXAM_GROUP_ID);
    expect(POLISH_B1_SPEAKING_EXAM_GROUP.variants).toHaveLength(30);
    expect(POLISH_B1_SPEAKING_EXAM_GROUP.estimatedMinutes).toBe(POLISH_B1_SPEAKING_ESTIMATED_MINUTES);
  });

  it('resolves exams by variant id and random flag', () => {
    const byVariant = resolvePolishB1SpeakingExam('v03');
    expect(byVariant?.id).toBe('exam_pl_b1-speaking_v03');

    const randomExam = resolvePolishB1SpeakingExam('', true);
    expect(randomExam?.id.startsWith('exam_pl_b1-speaking_v')).toBe(true);
  });
});
