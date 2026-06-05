import { useState } from "react";
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Center,
  Checkbox,
  Code,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import type { useAuth } from "../hooks/useAuth.js";
import { isLocalDev } from "../lib/env.js";

type AuthWallProps = Pick<
  ReturnType<typeof useAuth>,
  | "authStatusText"
  | "authStatusTone"
  | "useEmulator"
  | "setUseEmulator"
  | "signInGoogleDisabled"
  | "showEmailForm"
  | "setShowEmailForm"
  | "emailHint"
  | "emailHintIsError"
  | "sendEmailDisabled"
  | "authBrowserWarning"
  | "authHint"
  | "handleSignInGoogle"
  | "handleSendEmailLink"
>;

const toneToColor = (tone: string) => {
  if (tone === "ok") return "green";
  if (tone === "active") return "blue";
  if (tone === "warning") return "yellow";
  if (tone === "error") return "red";
  return "gray";
};

export const AuthWall = ({
  authStatusText,
  authStatusTone,
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
  const [email, setEmail] = useState("");

  return (
    <Center mih="100vh" p="md">
      <Paper w="100%" maw={420} p="xl" radius="md" withBorder shadow="xl">
        <Stack gap="md">
          <Stack gap={4}>
            <Text size="xs" fw={600} tt="uppercase" c="blue" style={{ letterSpacing: "0.06em" }}>
              FluencyPal · Realtime
            </Text>
            <Title order={1} size="h2">
              Sign in
            </Title>
            <Text size="sm" c="dimmed">
              {authHint}
            </Text>
          </Stack>

          {isLocalDev() ? (
            <Checkbox
              id="use-emulator"
              label={
                <Text size="sm">
                  Use Firebase Auth emulator (<Code>localhost:9099</Code>)
                </Text>
              }
              checked={useEmulator}
              onChange={(event) => setUseEmulator(event.currentTarget.checked)}
            />
          ) : null}

          {authBrowserWarning ? (
            <Alert id="auth-browser-warning" color="yellow" variant="light">
              {authBrowserWarning}
            </Alert>
          ) : null}

          <Button
            id="sign-in-google"
            variant="default"
            disabled={signInGoogleDisabled}
            onClick={() => void handleSignInGoogle()}
            leftSection={
              <Text
                component="span"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "1.25rem",
                  height: "1.25rem",
                  borderRadius: 4,
                  background: "#4285f4",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                G
              </Text>
            }
          >
            Sign in with Google
          </Button>

          <Stack id="email-sign-in" gap="xs">
            <Anchor
              id="toggle-email-sign-in"
              component="button"
              size="sm"
              onClick={() => setShowEmailForm((open) => !open)}
            >
              Sign in with email instead
            </Anchor>
            {showEmailForm ? (
              <Stack id="email-sign-in-form" gap="xs">
                <TextInput
                  id="email-input"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Button
                  id="send-email-link"
                  variant="default"
                  disabled={sendEmailDisabled}
                  onClick={() => void handleSendEmailLink(email)}
                >
                  Send sign-in link
                </Button>
                {emailHint ? (
                  <Text id="email-sign-in-hint" size="sm" c={emailHintIsError ? "red" : "dimmed"}>
                    {emailHint}
                  </Text>
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      </Paper>
    </Center>
  );
};
