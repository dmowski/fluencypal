import { generatedLessonSchema } from './schemas';

describe('generatedLessonSchema', () => {
  it('requires a read explanation, then a read-aloud, then a last open talk', () => {
    const parsed = generatedLessonSchema.parse({
      title: 'Articles',
      subTitle: 'Use the with one thing',
      parts: [
        { type: 'read', contentMD: 'How to use the.' },
        { type: 'speech', contentMD: 'Read this text aloud.\n\nI watched the demo.' },
        { type: 'speech', contentMD: 'Talk about yesterday.' },
      ],
    });

    expect(parsed.parts).toHaveLength(3);
  });

  it('rejects a second part that is still a read section', () => {
    const result = generatedLessonSchema.safeParse({
      title: 'Articles',
      subTitle: 'Use the with one thing',
      parts: [
        { type: 'read', contentMD: 'How to use the.' },
        { type: 'read', contentMD: 'A short text to read.' },
        { type: 'speech', contentMD: 'Talk about yesterday.' },
      ],
    });

    expect(result.success).toBe(false);
  });
});
