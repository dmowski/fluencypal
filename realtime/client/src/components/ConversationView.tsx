import { useEffect, useRef } from "react";
import { Button, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
    handleConnect,
    handleDisconnect,
    startCall,
    stopCall,
  } = useConversationContext();

  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const pendingStartRef = useRef(false);
  const startCallRef = useRef(startCall);
  startCallRef.current = startCall;

  // After connecting in RealTimeConversation mode, auto-start the call
  useEffect(() => {
    if (pendingStartRef.current && connected && isRealtimeMode && !callActive) {
      pendingStartRef.current = false;
      void startCallRef.current();
    }
  }, [connected, isRealtimeMode, callActive]);

  const handleStartCall = async () => {
    if (isRealtimeMode) {
      pendingStartRef.current = true;
    }
    await handleConnect();
  };

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
      <Group>
        <Button id="end-call" color="red" variant="light" onClick={() => void handleEndCall()}>
          End Call
        </Button>
      </Group>
      <DebugLogPanel />
      <UsagePanel />
    </Stack>
  );
};
