import { useCallback, useEffect, useRef } from "react";
import { unlockAudioPlayback } from "../lib/audioCapture.js";
import { setDebugLogContext } from "../lib/debugLog.js";
import type { StatusTone } from "./conversation/types.js";
import { useConversationUi } from "./conversation/useConversationUi.js";
import { useDebugLogPanel } from "./conversation/useDebugLogPanel.js";
import { useMicrophone } from "./conversation/useMicrophone.js";
import { useRealtimeClient } from "./conversation/useRealtimeClient.js";
import { useSessionConfig } from "./conversation/useSessionConfig.js";
import { useTalkSession } from "./conversation/useTalkSession.js";
import { useTranscript } from "./conversation/useTranscript.js";
import { useUsageTracking } from "./conversation/useUsageTracking.js";

export type { StatusTone } from "./conversation/types.js";

type TalkSessionBridge = {
  enableMicAfterAssistantOutput: () => Promise<void>;
  setSessionStatus: (text: string, tone: StatusTone) => void;
  onSessionReadyMic: () => Promise<boolean>;
  onSessionReady: () => void;
};

export const useConversation = (signedIn: boolean) => {
  const transcript = useTranscript();
  const usage = useUsageTracking();
  const config = useSessionConfig();
  const microphone = useMicrophone(config.micEnabled);

  const bridgeRef = useRef<TalkSessionBridge>({
    enableMicAfterAssistantOutput: async () => {},
    setSessionStatus: () => {},
    onSessionReadyMic: async () => false,
    onSessionReady: () => {},
  });

  const { getClient, disconnectClient, isClientConnected } = useRealtimeClient({
    micEnabled: config.micEnabled,
    onSessionStatus: (text, tone) => bridgeRef.current.setSessionStatus(text, tone),
    onSessionReady: () => {
      void unlockAudioPlayback();
      if (!config.micEnabled) {
        microphone.setMicStatus('Mic: disabled — enable "Mic On" to speak', "idle");
      } else {
        void bridgeRef.current.onSessionReadyMic();
      }
      bridgeRef.current.onSessionReady();
    },
    onTranscriptDelta: transcript.appendTranscriptDelta,
    onTranscriptDone: transcript.upsertTranscript,
    onUsage: usage.recordUsage,
    onAssistantPlaybackEnded: () => {
      void bridgeRef.current.enableMicAfterAssistantOutput();
    },
  });

  const talk = useTalkSession({
    isRealtimeMode: config.isRealtimeMode,
    micEnabled: config.micEnabled,
    voiceEnabled: config.voiceEnabled,
    setMicEnabled: config.setMicEnabled,
    setVoiceEnabled: config.setVoiceEnabled,
    readSessionConfig: config.readSessionConfig,
    getClient,
    disconnectClient,
    isClientConnected,
    resetUsage: usage.resetUsage,
    setMicStatus: microphone.setMicStatus,
    prepareMicrophone: microphone.prepareMicrophone,
    startCapture: microphone.startCapture,
    stopCapture: microphone.stopCapture,
    releaseMicrophone: microphone.releaseMicrophone,
    hasActiveCapture: microphone.hasActiveCapture,
    onListeningStatus: () => {
      bridgeRef.current.setSessionStatus("Call active — listening…", "ok");
    },
  });

  bridgeRef.current = {
    enableMicAfterAssistantOutput: talk.enableMicAfterAssistantOutput,
    setSessionStatus: talk.setSessionStatus,
    onSessionReadyMic: microphone.prepareMicrophone,
    onSessionReady: talk.onSessionReady,
  };

  const syncDebugContext = useCallback(() => {
    setDebugLogContext({
      signedIn,
      connected: talk.connected,
      callActive: talk.callActive,
      mode: config.mode,
      voiceEnabled: config.voiceEnabled,
      micEnabled: config.micEnabled,
      sessionStatus: talk.sessionStatusText,
      micStatus: microphone.micStatusText,
    });
  }, [
    signedIn,
    talk.connected,
    talk.callActive,
    talk.sessionStatusText,
    config.mode,
    config.voiceEnabled,
    config.micEnabled,
    microphone.micStatusText,
  ]);

  const debug = useDebugLogPanel(syncDebugContext);
  const ui = useConversationUi({
    signedIn,
    connected: talk.connected,
    callActive: talk.callActive,
    micEnabled: config.micEnabled,
    isRealtimeMode: config.isRealtimeMode,
  });

  useEffect(() => {
    usage.renderUsagePanel();
  }, [usage.renderUsagePanel]);

  return {
    sessionStatusText: talk.sessionStatusText,
    sessionStatusTone: talk.sessionStatusTone,
    micStatusText: microphone.micStatusText,
    micStatusTone: microphone.micStatusTone,
    connected: talk.connected,
    callActive: talk.callActive,
    pttRecording: talk.pttRecording,
    pttLabel: talk.pttLabel,
    transcriptMessages: transcript.transcriptMessages,
    usageLogText: usage.usageLogText,
    usageSummary: usage.usageSummary,
    debugLogStatus: debug.debugLogStatus,
    systemInstruction: config.systemInstruction,
    setSystemInstruction: config.setSystemInstruction,
    mode: config.mode,
    setMode: config.setMode,
    voice: config.voice,
    setVoice: config.setVoice,
    voiceEnabled: config.voiceEnabled,
    micEnabled: config.micEnabled,
    typedMessage: talk.typedMessage,
    setTypedMessage: talk.setTypedMessage,
    isRealtimeMode: config.isRealtimeMode,
    talkHint: ui.talkHint,
    steps: ui.steps,
    handleConnect: talk.handleConnect,
    handleDisconnect: talk.handleDisconnect,
    handleSignOutCleanup: talk.handleSignOutCleanup,
    handleStartCall: async () => {
      talk.scheduleAutoStart();
      await talk.handleConnect();
    },
    handleMicEnabledChange: talk.handleMicEnabledChange,
    handleVoiceEnabledChange: talk.handleVoiceEnabledChange,
    startCall: talk.startCall,
    stopCall: talk.stopCall,
    startPushToTalk: talk.startPushToTalk,
    stopPushToTalk: talk.stopPushToTalk,
    handleSendText: talk.handleSendText,
    handleCopyDebugLog: debug.handleCopyDebugLog,
    handleClearDebugLog: debug.handleClearDebugLog,
    bindDebugLogElement: debug.bindDebugLogElement,
  };
};
