import { Center, Container, Loader, Stack, Text } from "@mantine/core";
import { AppHeader } from "./components/AppHeader.js";
import { AuthWall } from "./components/AuthWall.js";
import { ConversationView } from "./components/ConversationView.js";
import { ConversationProvider, useConversationContext } from "./context/ConversationContext.js";
import { useAuth } from "./hooks/useAuth.js";

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
    <Container size="sm" py="xl">
      <Stack gap="md">
        <AppHeader
          user={auth.user!}
          authStatusText={auth.authStatusText}
          onSignOut={handleSignOut}
        />
        <ConversationView />
      </Stack>
    </Container>
  );
};

const AuthLoading = () => (
  <Center mih="100vh">
    <Stack align="center" gap="md">
      <Loader />
      <Text size="sm" c="dimmed">
        Checking sign-in…
      </Text>
    </Stack>
  </Center>
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
