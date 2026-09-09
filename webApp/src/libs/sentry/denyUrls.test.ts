import { sentryDenyUrls } from './denyUrls';

const matchesDeny = (url: string) =>
  sentryDenyUrls.some((pattern) =>
    typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url),
  );

describe('sentryDenyUrls', () => {
  it('drops Chrome isolated-world executor scripts', () => {
    expect(matchesDeny('app:///executors/200.js')).toBe(true);
  });

  it('drops Chrome extension frames', () => {
    expect(matchesDeny('chrome-extension://abcdefghijklmnopqrstuvwxyz/content.js')).toBe(true);
  });

  it('still reports first-party app frames', () => {
    expect(matchesDeny('https://app.fluencypal.com/_next/static/chunks/main.js')).toBe(false);
  });
});
