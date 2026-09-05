import { generatedLessonSchema } from './schemas';

const longReadAloud = `Read this text aloud.

I watched the demo on Monday. The video was short, but the product looked clear.
After that I opened the landing page and read the plan for the week.

On Tuesday I showed the demo to a friend. The friend asked about the price.
I talked about the landing page again and explained the one thing we sell.

On Wednesday I recorded a new demo. The old video felt slow, so I cut it.
Then I sent the new demo to the team and we chose the next step.

On Thursday I wrote a note about the landing page. The note named the one thing
users must see first. I kept the demo and the page about that same thing.

On Friday I watched the demo one more time. The story was simple, and the
landing page finally matched it. That one thing stayed clear all week.`;

describe('generatedLessonSchema', () => {
  it('requires a read explanation, then a read-aloud, then a last open talk', () => {
    const parsed = generatedLessonSchema.parse({
      title: 'Articles',
      subTitle: 'Use the with one thing',
      parts: [
        { type: 'read', contentMD: 'How to use the.' },
        { type: 'speech', contentMD: longReadAloud },
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

  it('rejects a read-aloud that is only a short snippet', () => {
    const result = generatedLessonSchema.safeParse({
      title: 'Articles',
      subTitle: 'Use the with one thing',
      parts: [
        { type: 'read', contentMD: 'How to use the.' },
        { type: 'speech', contentMD: 'Read this text aloud.\n\nI watched the demo.' },
        { type: 'speech', contentMD: 'Talk about yesterday.' },
      ],
    });

    expect(result.success).toBe(false);
  });
});
