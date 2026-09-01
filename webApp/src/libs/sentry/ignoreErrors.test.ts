import { sentryIgnoreErrors } from './ignoreErrors';

const matchesIgnore = (message: string) =>
  sentryIgnoreErrors.some((pattern) =>
    typeof pattern === 'string' ? message.includes(pattern) : pattern.test(message),
  );

describe('sentryIgnoreErrors', () => {
  it('drops Chrome IndexedDB missing-file errors from Firestore', () => {
    expect(
      matchesIgnore(
        'NotReadableError: Data lost due to missing file. Affected record should be considered irrecoverable',
      ),
    ).toBe(true);
  });

  it('still reports unrelated app errors', () => {
    expect(matchesIgnore('TypeError: Cannot read properties of undefined')).toBe(false);
  });
});
