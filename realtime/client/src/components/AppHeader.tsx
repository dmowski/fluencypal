import type { User } from "firebase/auth";
import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import { getAppEnvironment, getBackendLabel } from "../lib/env.js";
import { UserMenu } from "./UserMenu.js";

type AppHeaderProps = {
  user: User;
  authStatusText: string;
  onSignOut: () => Promise<void>;
};

export const AppHeader = ({ user, authStatusText, onSignOut }: AppHeaderProps) => {
  const environment = getAppEnvironment();

  return (
    <Group justify="space-between" align="flex-start">
      <Stack gap={4}>
        <Text size="xs" fw={600} tt="uppercase" c="blue" style={{ letterSpacing: "0.06em" }}>
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
      <Group gap="sm" align="center">
        <Badge id="env-badge" color={environment === "local" ? "yellow" : "green"} variant="light">
          {environment === "local" ? "Local dev" : "Production"}
        </Badge>
        <UserMenu user={user} authStatusText={authStatusText} onSignOut={onSignOut} />
      </Group>
    </Group>
  );
};
