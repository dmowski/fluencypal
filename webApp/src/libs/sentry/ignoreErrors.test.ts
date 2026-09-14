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

  it('drops Safari IndexedDB connection-lost errors', () => {
    expect(
      matchesIgnore(
        'UnknownError: Connection to Indexed Database server lost. Refresh the page to try again',
      ),
    ).toBe(true);
  });

  it('still reports unrelated app errors', () => {
    expect(matchesIgnore('TypeError: Cannot read properties of undefined')).toBe(false);
  });

  it('drops browser-extension M_ID injectors', () => {
    expect(matchesIgnore("TypeError: Cannot read properties of undefined (reading 'M_ID')")).toBe(
      true,
    );
  });

  it('drops Zalo in-app browser injectors', () => {
    expect(matchesIgnore("ReferenceError: Can't find variable: zaloJSV2")).toBe(true);
    expect(matchesIgnore('ReferenceError: zaloJSV2 is not defined')).toBe(true);
  });

  it('drops cross-origin Location.hostname sniffers in iframes', () => {
    expect(
      matchesIgnore(
        `SecurityError: Failed to read a named property 'hostname' from 'Location': Blocked a frame with origin "https://app.example.com" from accessing a cross-origin frame.`,
      ),
    ).toBe(true);
  });
});
