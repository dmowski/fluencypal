/**
 * @jest-environment jsdom
 */

import { FirebaseError } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import {
  getGoogleSignInErrorMessage,
  installFirebaseAuthPendingPromiseGuard,
  isFirebaseAuthPendingPromiseError,
  shouldFallbackPopupToRedirect,
  signInWithGoogleAccount,
} from './googleSignIn';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: class GoogleAuthProvider {
    static credentialFromError() {
      return null;
    }
  },
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  linkWithPopup: jest.fn(),
  linkWithRedirect: jest.fn(),
  signInWithCredential: jest.fn(),
  getRedirectResult: jest.fn(),
}));

const auth = {} as Auth;

describe('isFirebaseAuthPendingPromiseError', () => {
  it('matches the Firebase popup assertion from DARK-LANG-D7', () => {
    expect(
      isFirebaseAuthPendingPromiseError(
        new Error('INTERNAL ASSERTION FAILED: Pending promise was never set'),
      ),
    ).toBe(true);
  });

  it('rejects unrelated errors', () => {
    expect(isFirebaseAuthPendingPromiseError(new Error('popup closed'))).toBe(false);
    expect(isFirebaseAuthPendingPromiseError(null)).toBe(false);
  });
});

describe('getGoogleSignInErrorMessage', () => {
  it('hides user-cancelled popup errors', () => {
    expect(
      getGoogleSignInErrorMessage(new FirebaseError('auth/popup-closed-by-user', 'closed')),
    ).toBeNull();
  });

  it('asks for email when the Firebase popup assertion fires', () => {
    expect(
      getGoogleSignInErrorMessage(
        new Error('INTERNAL ASSERTION FAILED: Pending promise was never set'),
      ),
    ).toBe('Google sign-in is not supported in this browser. Please use email sign-in.');
  });

  it('asks to retry when Google redirect cannot reach Firebase', () => {
    expect(
      getGoogleSignInErrorMessage(
        new FirebaseError(
          'auth/network-request-failed',
          'Firebase: Error (auth/network-request-failed).',
        ),
      ),
    ).toBe('Network error during Google sign-in. Please check your connection and try again.');
  });
});

describe('signInWithGoogleAccount', () => {
  it('blocks Google in in-app browsers without opening a popup', async () => {
    const signInWithPopup = jest.fn();
    const signInWithRedirect = jest.fn();

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: false, isWebView: true, shouldRedirect: false },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result.isDone).toBe(false);
    expect(result.error).toContain('not supported');
    expect(signInWithPopup).not.toHaveBeenCalled();
    expect(signInWithRedirect).not.toHaveBeenCalled();
  });

  it('uses redirect on Safari instead of a popup', async () => {
    const signInWithPopup = jest.fn();
    const signInWithRedirect = jest.fn().mockResolvedValue(undefined);

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: false, isWebView: false, shouldRedirect: true },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result).toEqual({ isDone: false, error: '', isRedirecting: true });
    expect(signInWithRedirect).toHaveBeenCalledTimes(1);
    expect(signInWithPopup).not.toHaveBeenCalled();
  });

  it('returns a retry message when redirect sign-in fails on the network', async () => {
    const signInWithPopup = jest.fn();
    const signInWithRedirect = jest
      .fn()
      .mockRejectedValue(
        new FirebaseError(
          'auth/network-request-failed',
          'Firebase: Error (auth/network-request-failed).',
        ),
      );

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: false, isWebView: false, shouldRedirect: true },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result).toEqual({
      isDone: false,
      error: 'Network error during Google sign-in. Please check your connection and try again.',
    });
    expect(signInWithPopup).not.toHaveBeenCalled();
  });

  it('returns a retry message when popup fallback redirect fails on the network', async () => {
    const signInWithPopup = jest
      .fn()
      .mockRejectedValue(new FirebaseError('auth/popup-blocked', 'blocked'));
    const signInWithRedirect = jest
      .fn()
      .mockRejectedValue(
        new FirebaseError(
          'auth/network-request-failed',
          'Firebase: Error (auth/network-request-failed).',
        ),
      );

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: false, isWebView: false, shouldRedirect: false },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result).toEqual({
      isDone: false,
      error: 'Network error during Google sign-in. Please check your connection and try again.',
    });
    expect(signInWithRedirect).toHaveBeenCalledTimes(1);
  });

  it('keeps popup on desktop Chrome', async () => {
    const signInWithPopup = jest.fn().mockResolvedValue({});
    const signInWithRedirect = jest.fn();

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: false, isWebView: false, shouldRedirect: false },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result).toEqual({ isDone: true, error: '' });
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signInWithRedirect).not.toHaveBeenCalled();
  });

  it('falls back to redirect when the popup assertion fires', async () => {
    const signInWithPopup = jest
      .fn()
      .mockRejectedValue(new Error('INTERNAL ASSERTION FAILED: Pending promise was never set'));
    const signInWithRedirect = jest.fn().mockResolvedValue(undefined);

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: false, isWebView: false, shouldRedirect: false },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result).toEqual({ isDone: false, error: '', isRedirecting: true });
    expect(signInWithRedirect).toHaveBeenCalledTimes(1);
  });

  it('falls back to redirect when the popup is blocked', async () => {
    const signInWithPopup = jest
      .fn()
      .mockRejectedValue(new FirebaseError('auth/popup-blocked', 'blocked'));
    const signInWithRedirect = jest.fn().mockResolvedValue(undefined);

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: false, isWebView: false, shouldRedirect: false },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result.isRedirecting).toBe(true);
    expect(signInWithRedirect).toHaveBeenCalledTimes(1);
  });

  it('does not redirect when the user closes the popup', async () => {
    const signInWithPopup = jest
      .fn()
      .mockRejectedValue(new FirebaseError('auth/popup-closed-by-user', 'closed'));
    const signInWithRedirect = jest.fn();

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: false, isWebView: false, shouldRedirect: false },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result).toEqual({ isDone: false, error: '' });
    expect(signInWithRedirect).not.toHaveBeenCalled();
  });

  it('keeps the emulator on popup even when redirect would be preferred', async () => {
    const signInWithPopup = jest.fn().mockResolvedValue({});
    const signInWithRedirect = jest.fn();

    const result = await signInWithGoogleAccount(
      auth,
      { isEmulator: true, isWebView: false, shouldRedirect: true },
      { signInWithPopup, signInWithRedirect },
    );

    expect(result.isDone).toBe(true);
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signInWithRedirect).not.toHaveBeenCalled();
  });
});

describe('shouldFallbackPopupToRedirect', () => {
  it('is true for blocked popups and the Firebase assertion', () => {
    expect(shouldFallbackPopupToRedirect(new FirebaseError('auth/popup-blocked', 'blocked'))).toBe(
      true,
    );
    expect(
      shouldFallbackPopupToRedirect(
        new Error('INTERNAL ASSERTION FAILED: Pending promise was never set'),
      ),
    ).toBe(true);
  });

  it('is false when the user closes the popup', () => {
    expect(
      shouldFallbackPopupToRedirect(new FirebaseError('auth/popup-closed-by-user', 'closed')),
    ).toBe(false);
  });
});

describe('installFirebaseAuthPendingPromiseGuard', () => {
  it('prevents the leftover popup assertion from becoming unhandled', () => {
    installFirebaseAuthPendingPromiseGuard();
    const event = new Event('unhandledrejection') as PromiseRejectionEvent;
    Object.defineProperty(event, 'reason', {
      value: new Error('INTERNAL ASSERTION FAILED: Pending promise was never set'),
    });
    const preventDefault = jest.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefault).toHaveBeenCalled();
  });
});
