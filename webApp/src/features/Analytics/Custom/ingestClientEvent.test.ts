import { ingestClientEvent } from './ingestClientEvent';
import { AnalyticsClientEvent } from './types';

const event: AnalyticsClientEvent = {
  name: 'page_view',
  sourceApp: 'webapp',
  path: '/quiz',
  href: 'https://app.fluencypal.com/quiz',
  title: 'Quiz',
  referrer: '',
  language: 'en',
  screen: { width: 390, height: 844 },
};

describe('ingestClientEvent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('swallows Chromium Failed to fetch instead of rejecting', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(ingestClientEvent('fpv_11111111-1111-4111-8111-111111111111', event)).resolves.toBe(
      undefined,
    );
    expect(warn).toHaveBeenCalled();
  });

  it('swallows non-ok ingest responses', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(ingestClientEvent('fpv_11111111-1111-4111-8111-111111111111', event)).resolves.toBe(
      undefined,
    );
    expect(warn).toHaveBeenCalled();
  });
});
