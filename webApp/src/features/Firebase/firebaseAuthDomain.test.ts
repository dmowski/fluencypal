import { FIREBASE_PROJECT_AUTH_DOMAIN, resolveFirebaseAuthDomain } from './firebaseAuthDomain';

describe('resolveFirebaseAuthDomain', () => {
  it('uses the app host so iOS can read the redirect result', () => {
    expect(resolveFirebaseAuthDomain('app.fluencypal.com')).toBe('app.fluencypal.com');
  });

  it('keeps the project domain for localhost and other hosts', () => {
    expect(resolveFirebaseAuthDomain('localhost')).toBe(FIREBASE_PROJECT_AUTH_DOMAIN);
    expect(resolveFirebaseAuthDomain('dark-eng.vercel.app')).toBe(FIREBASE_PROJECT_AUTH_DOMAIN);
    expect(resolveFirebaseAuthDomain('')).toBe(FIREBASE_PROJECT_AUTH_DOMAIN);
  });
});
