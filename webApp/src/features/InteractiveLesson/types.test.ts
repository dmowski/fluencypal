import { isOpenTalkPart, isReadAloudPart, LessonPartState } from './types';

const parts: LessonPartState[] = [
  { type: 'read', contentMD: 'How to use the past simple.' },
  { type: 'speech', contentMD: 'Read this text aloud.' },
  { type: 'speech', contentMD: 'Say what you did yesterday.' },
  { type: 'speech', contentMD: 'Talk for two minutes.' },
];

describe('lesson part helpers', () => {
  it('treats the second speech part as read-aloud, not the last open talk', () => {
    expect(isReadAloudPart(parts, 1)).toBe(true);
    expect(isReadAloudPart(parts, 2)).toBe(false);
    expect(isReadAloudPart(parts, 3)).toBe(false);
    expect(isOpenTalkPart(parts, 3)).toBe(true);
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
});
