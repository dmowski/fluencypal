import type { User } from "firebase/auth";
import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import { getAppEnvironment, getBackendLabel } from "../lib/env.js";
import { useConversationContext } from "../context/ConversationContext.js";
import { UserMenu } from "./UserMenu.js";

type AppHeaderProps = {
  user: User;
  authStatusText: string;
  onSignOut: () => Promise<void>;
};

const stepColor = (done: boolean, active: boolean) => {
  if (done) return "green";
  if (active) return "blue";
  return "gray";
};

export const AppHeader = ({ user, authStatusText, onSignOut }: AppHeaderProps) => {
  const { steps } = useConversationContext();
  const environment = getAppEnvironment();

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="xs" fw={600} tt="uppercase" c="blue">
            FluencyPal · Realtime
          </Text>
          <Title order={1} size="h2">
            Conversation
          </Title>
          <Text id="subtitle" size="sm" c="dimmed">
            Backend:{" "}
            <Text component="span" ff="monospace" size="sm">
              {getBackendLabel()}
            </Text>
            {environment !== "local" && " · production Firebase"}
          </Text>
        </Stack>
        <Group gap="sm">
          <Badge
            id="env-badge"
            color={environment === "local" ? "yellow" : "green"}
            variant="light"
          >
            {environment === "local" ? "Local dev" : "Production"}
          </Badge>
          <UserMenu user={user} authStatusText={authStatusText} onSignOut={onSignOut} />
        </Group>
      </Group>
      <Group gap="xs" aria-label="Getting started">
        <Badge
          id="step-sign-in"
          color={stepColor(steps.signInDone, steps.signInActive)}
          variant="light"
        >
          1 · Signed in
        </Badge>
        <Badge
          id="step-connect"
          color={stepColor(steps.connectDone, steps.connectActive)}
          variant="light"
        >
          2 · Connect session
        </Badge>
        <Badge id="step-talk" color={stepColor(steps.talkDone, steps.talkActive)} variant="light">
          3 · Start call and speak
        </Badge>
      </Group>
    </Stack>
  );
};
