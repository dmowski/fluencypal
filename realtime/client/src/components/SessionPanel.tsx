import {
  Badge,
  Button,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Textarea,
  Title,
} from "@mantine/core";
import { useConversationContext } from "../context/ConversationContext.js";

const toneToColor = (tone: string) => {
  if (tone === "ok") return "green";
  if (tone === "active") return "blue";
  if (tone === "warning") return "yellow";
  if (tone === "error") return "red";
  return "gray";
};

export const SessionPanel = () => {
  const {
    sessionStatusText,
    sessionStatusTone,
    systemInstruction,
    setSystemInstruction,
    mode,
    setMode,
    voice,
    setVoice,
    voiceEnabled,
    micMuted,
    connected,
    handleConnect,
    handleDisconnect,
    handleVoiceEnabledChange,
    handleMicMutedChange,
  } = useConversationContext();

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2} size="h4">
            Session
          </Title>
          <Badge id="session-status" color={toneToColor(sessionStatusTone)} variant="light">
            {sessionStatusText}
          </Badge>
        </Group>
        <Textarea
          id="system-instruction"
          label="System instruction"
          rows={3}
          value={systemInstruction}
          onChange={(event) => setSystemInstruction(event.target.value)}
        />
        <Grid>
          <Grid.Col span={6}>
            <Select
              id="mode"
              label="Mode"
              value={mode}
              onChange={(value) => {
                if (value !== null) setMode(value as typeof mode);
              }}
              data={[
                { value: "PushToTalk", label: "Push to talk" },
                { value: "RealTimeConversation", label: "Real-time call" },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              id="voice"
              label="Voice"
              value={voice}
              onChange={(value) => {
                if (value !== null) setVoice(value as typeof voice);
              }}
              data={[
                { value: "shimmer", label: "shimmer" },
                { value: "ash", label: "ash" },
                { value: "marin", label: "marin" },
                { value: "verse", label: "verse" },
              ]}
            />
          </Grid.Col>
        </Grid>
        <Group gap="md">
          <Switch
            id="voice-enabled"
            label="AI voice"
            checked={voiceEnabled}
            onChange={(event) => handleVoiceEnabledChange(event.currentTarget.checked)}
          />
          <Switch
            id="mic-muted"
            label="Mic muted"
            checked={micMuted}
            onChange={(event) => void handleMicMutedChange(event.currentTarget.checked)}
          />
        </Group>
        <Group>
          <Button id="connect" disabled={connected} onClick={() => void handleConnect()}>
            Connect
          </Button>
          <Button
            id="disconnect"
            variant="default"
            disabled={!connected}
            onClick={() => void handleDisconnect()}
          >
            Disconnect
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};
