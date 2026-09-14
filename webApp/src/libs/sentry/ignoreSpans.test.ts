import { shouldCreateSentrySpanForRequest } from './ignoreSpans';

describe('shouldCreateSentrySpanForRequest', () => {
  it('skips Next.js RSC flights so they cannot group as N+1 API calls', () => {
    expect(
      shouldCreateSentrySpanForRequest('https://app.example.com/practice?_rsc=abc'),
    ).toBe(false);
  });

  it('still traces real API calls', () => {
    expect(shouldCreateSentrySpanForRequest('https://app.example.com/api/ttsStream?voice=ash')).toBe(
      true,
    );
  });
});
