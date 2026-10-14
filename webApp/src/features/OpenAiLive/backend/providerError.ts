/** Provider failure. `code` is a short token for analytics. `detail` stays on the server. */
export class OpenAiLiveProviderError extends Error {
  readonly code: string;
  readonly detail: string;

  constructor(code: string, detail: string) {
    super('Could not start the live session');
    this.name = 'OpenAiLiveProviderError';
    this.code = code;
    this.detail = detail.slice(0, 500);
  }
}
