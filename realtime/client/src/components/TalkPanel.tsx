import { Button, Group, TextInput } from "@mantine/core";
import { useConversationContext } from "../context/ConversationContext.js";

export const TalkPanel = () => {
  const {
    connected,
    micMuted,
    isRealtimeMode,
    pttRecording,
    pttLabel,
    typedMessage,
    setTypedMessage,
    startPushToTalk,
    stopPushToTalk,
    handleSendText,
  } = useConversationContext();

  return (
    <Group align="flex-end" gap="xs">
      <TextInput
        id="typed-message"
        placeholder="Type a message…"
        disabled={!connected}
        value={typedMessage}
        style={{ flex: 1 }}
        onChange={(event) => setTypedMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleSendText();
        }}
      />
      <Button id="send-text" variant="default" disabled={!connected} onClick={handleSendText}>
        Send
      </Button>
      {!isRealtimeMode && (
        <Button
          id="ptt"
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
    </Group>
  );
};
