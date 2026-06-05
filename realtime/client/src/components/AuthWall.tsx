import { useState } from 'react';
import type { useAuth } from '../hooks/useAuth.js';
import { isLocalDev } from '../lib/env.js';

type AuthWallProps = Pick<
  ReturnType<typeof useAuth>,
  | 'authStatusText'
  | 'authStatusTone'
  | 'authChecking'
  | 'useEmulator'
  | 'setUseEmulator'
  | 'signInGoogleDisabled'
  | 'showEmailForm'
  | 'setShowEmailForm'
  | 'emailHint'
  | 'emailHintIsError'
  | 'sendEmailDisabled'
  | 'authBrowserWarning'
  | 'authHint'
  | 'handleSignInGoogle'
  | 'handleSendEmailLink'
>;

export const AuthWall = ({
  authStatusText,
  authStatusTone,
  authChecking,
  useEmulator,
  setUseEmulator,
  signInGoogleDisabled,
  showEmailForm,
  setShowEmailForm,
  emailHint,
  emailHintIsError,
  sendEmailDisabled,
  authBrowserWarning,
  authHint,
  handleSignInGoogle,
  handleSendEmailLink,
}: AuthWallProps) => {
  const [email, setEmail] = useState('');

  return (
    <div className="auth-wall">
      <div className="auth-wall-card">
        <p className="eyebrow">FluencyPal · Realtime</p>
        <h1>Sign in</h1>
        <p className="hint">{authHint}</p>

        <p id="auth-status" className={`status-pill status-${authStatusTone}`}>
          {authChecking ? 'Checking sign-in…' : authStatusText}
        </p>

        {isLocalDev() ? (
          <label id="emulator-row" className="emulator-row row">
            <input
              id="use-emulator"
              type="checkbox"
              checked={useEmulator}
              onChange={(event) => setUseEmulator(event.target.checked)}
            />
            <span>
              Use Firebase Auth emulator (<code>localhost:9099</code>)
            </span>
          </label>
        ) : null}

        {authBrowserWarning ? (
          <p id="auth-browser-warning" className="auth-warning">
            {authBrowserWarning}
          </p>
        ) : null}

        <div className="row actions">
          <button
            id="sign-in-google"
            type="button"
            className="btn-google"
            disabled={signInGoogleDisabled || authChecking}
            onClick={() => void handleSignInGoogle()}
          >
            <span className="btn-google-icon" aria-hidden="true">
              G
            </span>
            Sign in with Google
          </button>
        </div>

        <div id="email-sign-in" className="email-sign-in">
          <button
            id="toggle-email-sign-in"
            type="button"
            className="btn-link"
            onClick={() => setShowEmailForm((open) => !open)}
          >
            Sign in with email instead
          </button>
          {showEmailForm ? (
            <div id="email-sign-in-form" className="email-sign-in-form">
              <label>
                Email
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button
                id="send-email-link"
                type="button"
                className="btn-secondary"
                disabled={sendEmailDisabled}
                onClick={() => void handleSendEmailLink(email)}
              >
                Send sign-in link
              </button>
              {emailHint ? (
                <p id="email-sign-in-hint" className={`hint${emailHintIsError ? ' error' : ''}`}>
                  {emailHint}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
