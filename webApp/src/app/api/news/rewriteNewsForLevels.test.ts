jest.mock('../ai/generateTextWithAi', () => ({
  generateTextWithAi: jest.fn(),
}));

import { rewriteNewsForLevels } from './rewriteNewsForLevels';
import { generateTextWithAi } from '../ai/generateTextWithAi';

const mockedGenerate = generateTextWithAi as jest.MockedFunction<typeof generateTextWithAi>;

describe('rewriteNewsForLevels', () => {
  beforeEach(() => {
    mockedGenerate.mockReset();
  });

  it('produces all three complexity keys via parallel AI calls', async () => {
    mockedGenerate.mockImplementation(async ({ systemMessage }) => {
      const complexity = systemMessage.includes('A1')
        ? 'beginner'
        : systemMessage.includes('C1')
          ? 'advance'
          : 'middle';
      return { output: `# ${complexity}\n\nrewritten body`, usage: null as any };
    });

    const versions = await rewriteNewsForLevels({
      title: 'Big news today',
      content_origin: 'Some markdown article body.',
      targetLanguageName: 'English',
    });

    expect(Object.keys(versions).sort()).toEqual(['advance', 'beginner', 'middle']);
    expect(versions.beginner).toMatch(/beginner/);
    expect(versions.middle).toMatch(/middle/);
    expect(versions.advance).toMatch(/advance/);
    expect(mockedGenerate).toHaveBeenCalledTimes(3);
  });

  it('forwards the original content in the user prompt', async () => {
    mockedGenerate.mockResolvedValue({ output: 'ok', usage: null as any });

    await rewriteNewsForLevels({
      title: 'A Title',
      content_origin: 'UNIQUE-CONTENT-MARKER paragraph.',
      targetLanguageName: 'English',
    });

    for (const call of mockedGenerate.mock.calls) {
      expect(call[0].userMessage).toContain('UNIQUE-CONTENT-MARKER');
      expect(call[0].userMessage).toContain('A Title');
    }
  });

  it('strips leading wrapper lines like "Here is the rewritten article:"', async () => {
    mockedGenerate.mockResolvedValue({
      output:
        'Sure! Here is the rewritten article in simple English:\n\nThis is the body of the rewrite.',
      usage: null as any,
    });

    const versions = await rewriteNewsForLevels({
      title: 'T',
      content_origin: 'C',
      targetLanguageName: 'English',
    });

    expect(versions.beginner).toBeDefined();
    expect(versions.beginner!.startsWith('Sure!')).toBe(false);
    expect(versions.beginner).toBe('This is the body of the rewrite.');
  });

  it('unwraps fenced ```markdown blocks if present', async () => {
    mockedGenerate.mockResolvedValue({
      output: '```markdown\n## Heading\n\nbody text\n```',
      usage: null as any,
    });

    const versions = await rewriteNewsForLevels({
      title: 'T',
      content_origin: 'C',
      targetLanguageName: 'English',
    });
    expect(versions.middle).toBe('## Heading\n\nbody text');
  });
});
