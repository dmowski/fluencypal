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

const AuthLoading = () => (
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

export const App = () => {
  const auth = useAuth();

  // Same gate as webApp AuthWallBasic: show wall only when Firebase finished loading and there is no user.
  const isShowAuthWall = !auth.signedIn && !auth.loading;

  if (auth.loading) {
    return <AuthLoading />;
  }

  if (isShowAuthWall) {
    return <AuthWall {...auth} />;
  }

  return (
    <ConversationProvider signedIn>
      <AuthenticatedApp auth={auth} />
    </ConversationProvider>
  );
};
