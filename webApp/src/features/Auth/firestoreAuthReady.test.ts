import { isWaitingForFirestoreToken, publishedAuthUid } from './firestoreAuthReady';

describe('publishedAuthUid', () => {
  it('hides the uid until that user token is ready', () => {
    expect(publishedAuthUid('user-a', null)).toBe('');
    expect(publishedAuthUid('user-b', 'user-a')).toBe('');
    expect(publishedAuthUid('user-b', 'user-b')).toBe('user-b');
    expect(publishedAuthUid(undefined, 'user-a')).toBe('');
  });

  it('keeps loading only while a signed-in user is missing a token', () => {
    expect(isWaitingForFirestoreToken('user-a', null)).toBe(true);
    expect(isWaitingForFirestoreToken('user-b', 'user-a')).toBe(true);
    expect(isWaitingForFirestoreToken('user-a', 'user-a')).toBe(false);
    expect(isWaitingForFirestoreToken(undefined, null)).toBe(false);
  });
});
