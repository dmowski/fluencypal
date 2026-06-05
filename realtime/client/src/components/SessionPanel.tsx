import { Grid, Group, Select, Stack, Switch, Textarea } from "@mantine/core";
import { useConversationContext } from "../context/ConversationContext.js";

export const SessionPanel = () => {
  const {
    systemInstruction,
    setSystemInstruction,
    mode,
    setMode,
    voice,
    setVoice,
    voiceEnabled,
    micMuted,
    handleVoiceEnabledChange,
    handleMicMutedChange,
  } = useConversationContext();

  return (
    <Stack gap="md">
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
      <Group gap="xl">
        <Switch
          id="voice-enabled"
          label="Volume On"
          checked={voiceEnabled}
          onChange={(event) => handleVoiceEnabledChange(event.currentTarget.checked)}
        />
        <Switch
          id="mic-muted"
          label="Mic On"
          checked={!micMuted}
          onChange={(event) => handleMicMutedChange(!event.currentTarget.checked)}
        />
      </Group>
    </Stack>
  );
};
