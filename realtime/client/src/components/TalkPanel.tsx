import { Badge, Button, Group, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { useConversationContext } from "../context/ConversationContext.js";

const toneToColor = (tone: string) => {
  if (tone === "ok") return "green";
  if (tone === "active") return "blue";
  if (tone === "warning") return "yellow";
  if (tone === "error") return "red";
  return "gray";
};

export const TalkPanel = () => {
  const {
    micStatusText,
    micStatusTone,
    talkHint,
    isRealtimeMode,
    connected,
    callActive,
    micMuted,
    pttRecording,
    pttLabel,
    typedMessage,
    setTypedMessage,
    startCall,
    stopCall,
    startPushToTalk,
    stopPushToTalk,
    handleSendText,
  } = useConversationContext();

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2} size="h4">
            Talk
          </Title>
          <Badge id="mic-status" color={toneToColor(micStatusTone)} variant="light">
            {micStatusText}
          </Badge>
        </Group>
        <Text id="talk-hint" size="sm" c="dimmed">
          {talkHint}
        </Text>
        {isRealtimeMode ? (
          <Button
            id="call-toggle"
            size="lg"
            fullWidth
            color={callActive ? "red" : "blue"}
            disabled={!connected}
            onClick={() => void (callActive ? stopCall() : startCall())}
          >
            {callActive ? "End call" : "Start call"}
          </Button>
        ) : (
          <Button
            id="ptt"
            size="lg"
            fullWidth
            color={pttRecording ? "red" : "green"}
            disabled={!connected || micMuted}
            onMouseDown={() => void startPushToTalk()}
            onMouseUp={stopPushToTalk}
            onMouseLeave={stopPushToTalk}
            onTouchStart={(event) => {
              event.preventDefault();
              void startPushToTalk();
            }}
            onTouchEnd={(event) => {
              event.preventDefault();
              stopPushToTalk();
            }}
          >
            {pttLabel}
          </Button>
        )}
        <Group align="flex-end">
          <TextInput
            id="typed-message"
            label="Type a message"
            placeholder="Type and press Send"
            disabled={!connected}
            value={typedMessage}
            style={{ flex: 1 }}
            onChange={(event) => setTypedMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSendText();
              }
            }}
          />
          <Button id="send-text" variant="default" disabled={!connected} onClick={handleSendText}>
            Send
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};
