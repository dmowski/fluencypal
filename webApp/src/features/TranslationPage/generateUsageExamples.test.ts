import { TextAiContextType } from '@/features/Ai/types';
import { generateUsageExamples } from './generateUsageExamples';

const textAiWith = (generate: jest.Mock): TextAiContextType =>
  ({ generate }) as unknown as TextAiContextType;

describe('generateUsageExamples', () => {
  it('requests one sentence four times and hides copies', async () => {
    const generate = jest
      .fn()
      .mockResolvedValueOnce('I said hello today.')
      .mockResolvedValueOnce('I said hello today.')
      .mockResolvedValueOnce('{"examples":["I said hello."]}')
      .mockResolvedValueOnce('She said hello and left.');

    const examples = await generateUsageExamples({
      textAi: textAiWith(generate),
      text: 'hello',
      language: 'en',
    });

    expect(generate).toHaveBeenCalledTimes(4);
    expect(generate.mock.calls.map((call) => call[0].userMessage)).toEqual([
      'Write one sentence about daily life that includes this text: hello',
      'Write one sentence about a conversation that includes this text: hello',
      'Write one sentence about work or study that includes this text: hello',
      'Write one sentence about free time that includes this text: hello',
    ]);
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        cache: false,
        model: 'gpt-4o-mini',
      }),
    );
    expect(examples).toEqual(['I said hello today.', 'She said hello and left.']);
  });

  it('fails when every sentence is a copy or unusable', async () => {
    const generate = jest.fn().mockResolvedValue('hello');

    await expect(
      generateUsageExamples({
        textAi: textAiWith(generate),
        text: 'hello',
        language: 'en',
      }),
    ).rejects.toThrow('No usable example sentences');
    expect(generate).toHaveBeenCalledTimes(4);
  });
});
