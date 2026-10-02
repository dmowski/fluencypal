import { selectUsageExamples } from './selectUsageExamples';

describe('selectUsageExamples', () => {
  it('keeps a sentence that uses the source phrase', () => {
    expect(selectUsageExamples(['I said hello to my neighbor this morning.'], 'hello')).toEqual([
      'I said hello to my neighbor this morning.',
    ]);
  });

  it('strips numbering and quotes before showing the sentence', () => {
    expect(selectUsageExamples(['1. "I said hello to her."'], 'hello')).toEqual([
      'I said hello to her.',
    ]);
  });

  it('drops a copy of the source text', () => {
    expect(selectUsageExamples(['Hello.', 'hello'], 'Hello')).toEqual([]);
  });

  it('drops duplicate copies of the same sentence', () => {
    expect(
      selectUsageExamples(
        ['I said hello to her.', 'I said hello to her!', '  i said hello to her.  '],
        'hello',
      ),
    ).toEqual(['I said hello to her.']);
  });

  it('drops a sentence that does not use a short source phrase', () => {
    expect(selectUsageExamples(['The weather is nice today.'], 'hello')).toEqual([]);
  });

  it('does not treat a longer word as a copy of a short word', () => {
    expect(selectUsageExamples(['The category is large.'], 'cat')).toEqual([]);
  });

  it('drops a greeting whose only use of the phrase is a copy of the source', () => {
    expect(selectUsageExamples(['Hello! How can I assist you today?'], 'hello')).toEqual([]);
  });

  it('drops JSON instead of showing it', () => {
    expect(
      selectUsageExamples(['{"examples":["I said hello."]}', 'I said hello today.'], 'hello'),
    ).toEqual(['I said hello today.']);
  });

  it('takes the sentence that contains the phrase when the model adds a lead-in', () => {
    expect(selectUsageExamples(['Sure! I said hello to her today.'], 'hello')).toEqual([
      'I said hello to her today.',
    ]);
  });

  it('keeps a different sentence when the source is too long to embed', () => {
    const source = 'a'.repeat(81);
    expect(selectUsageExamples(['This is a fresh example sentence.'], source)).toEqual([
      'This is a fresh example sentence.',
    ]);
  });
});
