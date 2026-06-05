import type { User } from 'firebase/auth';
import { getAppEnvironment, getBackendLabel } from '../lib/env.js';
import { useConversationContext } from '../context/ConversationContext.js';
import { UserMenu } from './UserMenu.js';

type AppHeaderProps = {
  user: User;
  authStatusText: string;
  onSignOut: () => Promise<void>;
};

export const AppHeader = ({ user, authStatusText, onSignOut }: AppHeaderProps) => {
  const { steps } = useConversationContext();
  const environment = getAppEnvironment();

  return (
    <header className="hero app-header">
      <div className="hero-top">
        <div>
          <p className="eyebrow">FluencyPal · Realtime</p>
          <h1>Conversation</h1>
          <p id="subtitle" className="subtitle">
            {environment === 'local' ? (
              <>
                Backend: <code>{getBackendLabel()}</code>
              </>
            ) : (
              <>
                Backend: <code>{getBackendLabel()}</code> · production Firebase
              </>
            )}
          </p>
        </div>
        <div className="app-header-actions">
          <span id="env-badge" className={`badge badge-${environment}`}>
            {environment === 'local' ? 'Local dev' : 'Production'}
          </span>
          <UserMenu user={user} authStatusText={authStatusText} onSignOut={onSignOut} />
        </div>
      </div>
      <ol className="steps" aria-label="Getting started">
        <li id="step-sign-in" className={stepClass(steps.signInDone, steps.signInActive)}>
          <span className="step-num">1</span> Signed in
        </li>
        <li id="step-connect" className={stepClass(steps.connectDone, steps.connectActive)}>
          <span className="step-num">2</span> Connect session
        </li>
        <li id="step-talk" className={stepClass(steps.talkDone, steps.talkActive)}>
          <span className="step-num">3</span> Start call and speak
        </li>
      </ol>
    </header>
  );
};

const stepClass = (done: boolean, active: boolean): string => {
  if (done) {
    return 'step-done';
  }
  if (active) {
    return 'step-active';
  }
  return '';
};
