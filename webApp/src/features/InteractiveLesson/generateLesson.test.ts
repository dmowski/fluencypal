import { LESSON_FEEDBACK_FALLBACK_MD } from './constants';
import { toInteractiveLesson } from './generateLesson';
import { isLessonFeedbackPart, isOpenTalkPart } from './types';

describe('toInteractiveLesson', () => {
  it('appends a feedback recording after the open talk', () => {
    const lesson = toInteractiveLesson({
      title: 'Articles',
      subTitle: 'Use the with one thing',
      parts: [
        { type: 'read', contentMD: 'How to use the.' },
        { type: 'speech', contentMD: 'Talk for two minutes about yesterday.' },
      ],
      feedbackPromptMD:
        'Powiedz, jak ci poszła ta lekcja i czego chcesz następnym razem. Możesz mówić po polsku.',
    });

    expect(lesson.parts).toHaveLength(3);
    expect(isOpenTalkPart(lesson.parts, 1)).toBe(true);
    expect(isLessonFeedbackPart(lesson.parts[2])).toBe(true);
    expect(lesson.parts[2]?.contentMD).toContain('po polsku');
  });

  it('uses the English fallback when the feedback prompt is too short', () => {
    const lesson = toInteractiveLesson({
      title: 'Articles',
      subTitle: 'Use the with one thing',
      parts: [{ type: 'speech', contentMD: 'Talk for two minutes.' }],
      feedbackPromptMD: 'Hi',
    });

    expect(lesson.parts[1]?.contentMD).toBe(LESSON_FEEDBACK_FALLBACK_MD);
    expect(isLessonFeedbackPart(lesson.parts[1])).toBe(true);
  });
});
