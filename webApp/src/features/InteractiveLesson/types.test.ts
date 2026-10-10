import { READ_ALOUD_MIN_CONTENT_CHARS } from './constants';
import { isLessonFeedbackPart, isOpenTalkPart, isReadAloudPart, LessonPartState } from './types';

const longPassage = `${'The form shows up again. '.repeat(Math.ceil(READ_ALOUD_MIN_CONTENT_CHARS / 24))}`;

const parts: LessonPartState[] = [
  { type: 'read', contentMD: 'How to use the past simple.' },
  { type: 'speech', contentMD: 'Read these examples aloud.\n\nI worked. — I work.' },
  { type: 'speech', contentMD: `Read this text aloud.\n\n${longPassage}` },
  { type: 'speech', contentMD: 'Say what you did yesterday.' },
  { type: 'speech', contentMD: 'Talk for two minutes.' },
];

describe('lesson part helpers', () => {
  it('treats the pattern drill and long passage as read-aloud, not later tasks', () => {
    expect(isReadAloudPart(parts, 1)).toBe(true);
    expect(isReadAloudPart(parts, 2)).toBe(true);
    expect(isReadAloudPart(parts, 3)).toBe(false);
    expect(isReadAloudPart(parts, 4)).toBe(false);
    expect(isOpenTalkPart(parts, 4)).toBe(true);
  });

  it('keeps legacy long-second-part lessons as a single read-aloud', () => {
    const legacyParts: LessonPartState[] = [
      { type: 'read', contentMD: 'How to use the past simple.' },
      { type: 'speech', contentMD: `Read this text aloud.\n\n${longPassage}` },
      { type: 'speech', contentMD: 'Say what you did yesterday.' },
      { type: 'speech', contentMD: 'Talk for two minutes.' },
    ];

    expect(isReadAloudPart(legacyParts, 1)).toBe(true);
    expect(isReadAloudPart(legacyParts, 2)).toBe(false);
    expect(isOpenTalkPart(legacyParts, 3)).toBe(true);
  });

  it('does not mark an old read-second-part lesson as read-aloud', () => {
    const oldParts: LessonPartState[] = [
      { type: 'read', contentMD: 'Rule' },
      { type: 'read', contentMD: 'Short text to read' },
      { type: 'speech', contentMD: 'Open talk' },
    ];

    expect(isReadAloudPart(oldParts, 1)).toBe(false);
    expect(isOpenTalkPart(oldParts, 2)).toBe(true);
  });

  it('keeps the open talk when a feedback note is appended', () => {
    const withNote: LessonPartState[] = [
      ...parts,
      {
        type: 'speech',
        role: 'lessonFeedback',
        contentMD: 'Say how this lesson felt.',
      },
    ];

    expect(isOpenTalkPart(withNote, 4)).toBe(true);
    expect(isOpenTalkPart(withNote, 5)).toBe(false);
    expect(isLessonFeedbackPart(withNote[5])).toBe(true);
    expect(isReadAloudPart(withNote, 5)).toBe(false);
  });
});
