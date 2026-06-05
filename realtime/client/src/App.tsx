import { AppHeader } from './components/AppHeader.js';
import { AuthWall } from './components/AuthWall.js';
import { ConversationView } from './components/ConversationView.js';
import { ConversationProvider, useConversationContext } from './context/ConversationContext.js';
import { useAuth } from './hooks/useAuth.js';

type AuthenticatedAppProps = {
  auth: ReturnType<typeof useAuth>;
};

const AuthenticatedApp = ({ auth }: AuthenticatedAppProps) => {
  const { handleSignOutCleanup } = useConversationContext();

  const handleSignOut = async () => {
    await handleSignOutCleanup();
    await auth.handleSignOut();
  };

  return (
    <main className="layout">
      <AppHeader user={auth.user!} authStatusText={auth.authStatusText} onSignOut={handleSignOut} />
      <ConversationView />
    </main>
  );
};

export const App = () => {
  const auth = useAuth();

  if (auth.authChecking) {
    return (
      <div className="auth-wall">
        <div className="auth-wall-card">
          <p className="eyebrow">FluencyPal · Realtime</p>
          <h1>Sign in</h1>
          <p id="auth-status" className="status-pill status-warning">
            Checking sign-in…
          </p>
        </div>
      </div>
    );
  }

  if (!auth.signedIn) {
    return <AuthWall {...auth} />;
  }

  return (
    <ConversationProvider signedIn>
      <AuthenticatedApp auth={auth} />
    </ConversationProvider>
  );
};
