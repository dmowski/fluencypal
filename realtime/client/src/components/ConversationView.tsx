import { ActionIcon, Button, Group, Modal, Stack, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMicrophone, IconMicrophoneOff, IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { useConversationContext } from "../context/ConversationContext.js";
import { SessionPanel } from "./SessionPanel.js";
import { TalkPanel } from "./TalkPanel.js";
import { TranscriptPanel } from "./TranscriptPanel.js";
import { DebugLogPanel } from "./DebugLogPanel.js";
import { UsagePanel } from "./UsagePanel.js";

export const ConversationView = () => {
  const {
    connected,
    callActive,
    isRealtimeMode,
    handleStartCall,
    handleDisconnect,
    stopCall,
    micEnabled,
    voiceEnabled,
    handleMicEnabledChange,
    handleVoiceEnabledChange,
  } = useConversationContext();

  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);

  const handleEndCall = async () => {
    if (callActive && isRealtimeMode) {
      void stopCall();
    }
    await handleDisconnect();
  };

  if (!connected) {
    return (
      <>
        <Group pt={48}>
          <Button id="start-call" size="xl" onClick={() => void handleStartCall()}>
            Start Call
          </Button>
          <Button variant="default" size="xl" onClick={openSettings}>
            Settings
          </Button>
        </Group>
        <Modal opened={settingsOpened} onClose={closeSettings} title="Settings" size="md">
          <SessionPanel />
        </Modal>
      </>
    );
  }

  return (
    <Stack gap="md">
      <TranscriptPanel />
      <TalkPanel />
      <Group justify="space-between">
        <Button id="end-call" color="red" variant="light" onClick={() => void handleEndCall()}>
          End Call
        </Button>
        <Group gap="xs">
          <Tooltip label={micEnabled ? "Mute mic" : "Unmute mic"}>
            <ActionIcon
              id="toggle-mic"
              size="lg"
              variant={micEnabled ? "filled" : "light"}
              color={micEnabled ? "blue" : "gray"}
              onClick={() => void handleMicEnabledChange(!micEnabled)}
            >
              {micEnabled ? <IconMicrophone size={18} /> : <IconMicrophoneOff size={18} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label={voiceEnabled ? "Mute AI voice" : "Unmute AI voice"}>
            <ActionIcon
              id="toggle-voice"
              size="lg"
              variant={voiceEnabled ? "filled" : "light"}
              color={voiceEnabled ? "blue" : "gray"}
              onClick={() => handleVoiceEnabledChange(!voiceEnabled)}
            >
              {voiceEnabled ? <IconVolume size={18} /> : <IconVolumeOff size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <DebugLogPanel />
      <UsagePanel />
    </Stack>
  );
};
