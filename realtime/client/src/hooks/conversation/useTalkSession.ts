import { useCallback, useEffect, useRef, useState } from "react";
import { unlockAudioPlayback } from "../../lib/audioCapture.js";
import { debugLog } from "../../lib/debugLog.js";
import { getIdToken } from "../../lib/firebase.js";
import type { RealtimeSessionClient } from "../../lib/sessionClient.js";
import type { StatusTone } from "./types.js";

type UseTalkSessionParams = {
  isRealtimeMode: boolean;
  micEnabled: boolean;
  voiceEnabled: boolean;
  setMicEnabled: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  readSessionConfig: () => Parameters<RealtimeSessionClient["connect"]>[1];
  getClient: () => RealtimeSessionClient;
  disconnectClient: () => void;
  isClientConnected: () => boolean;
  resetUsage: () => void;
  setMicStatus: (text: string, tone?: StatusTone) => void;
  prepareMicrophone: () => Promise<boolean>;
  startCapture: (onChunk: (chunk: ArrayBuffer) => void) => Promise<boolean>;
  stopCapture: () => void;
  releaseMicrophone: () => void;
  hasActiveCapture: () => boolean;
  onListeningStatus: () => void;
};

export const useTalkSession = ({
  isRealtimeMode,
  micEnabled,
  voiceEnabled,
  setMicEnabled,
  setVoiceEnabled,
  readSessionConfig,
  getClient,
  disconnectClient,
  isClientConnected,
  resetUsage,
  setMicStatus,
  prepareMicrophone,
  startCapture,
  stopCapture,
  releaseMicrophone,
  hasActiveCapture,
  onListeningStatus,
}: UseTalkSessionParams) => {
  const [sessionStatusText, setSessionStatusText] = useState("Disconnected");
  const [sessionStatusTone, setSessionStatusTone] = useState<StatusTone>("idle");
  const [connected, setConnected] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [pttRecording, setPttRecording] = useState(false);
  const [pttLabel, setPttLabel] = useState("Hold to talk");
  const [typedMessage, setTypedMessage] = useState("");

  const greetingSentRef = useRef(false);
  const stopCallRef = useRef<(() => Promise<void>) | null>(null);
  const autoStartRef = useRef(false);

  const setSessionStatus = useCallback((text: string, tone: StatusTone) => {
    setSessionStatusText(text);
    setSessionStatusTone(tone);
  }, []);

  const startMicCaptureIfNeeded = useCallback(async (): Promise<boolean> => {
    return startCapture((chunk) => {
      getClient().sendAudioChunk(chunk);
    });
  }, [getClient, startCapture]);

  const stopCall = useCallback(async () => {
    if (!hasActiveCapture()) {
      setCallActive(false);
      return;
    }

    debugLog("call", "stop");
    stopCapture();
    setCallActive(false);

    if (isClientConnected()) {
      debugLog("call", "user_turn_commit_on_stop");
      getClient().sendJson({ type: "user.turn.commit" });
    }
  }, [getClient, hasActiveCapture, isClientConnected, stopCapture]);

  stopCallRef.current = stopCall;

  const startCall = useCallback(async () => {
    const client = getClient();
    if (!client.isConnected || hasActiveCapture() || callActive) {
      return;
    }

    debugLog("call", "start", { micEnabled });
    await unlockAudioPlayback();
    setCallActive(true);

    if (isRealtimeMode && !greetingSentRef.current) {
      debugLog("call", "assistant_trigger");
      client.sendJson({ type: "assistant.trigger" });
      greetingSentRef.current = true;
      setSessionStatus("Call active — greeting…", "active");
      return;
    }

    if (!(await startMicCaptureIfNeeded())) {
      setCallActive(false);
      return;
    }

    setSessionStatus("Call active — listening…", "ok");
  }, [
    callActive,
    getClient,
    hasActiveCapture,
    isRealtimeMode,
    micEnabled,
    setSessionStatus,
    startMicCaptureIfNeeded,
  ]);

  const enableMicAfterAssistantOutput = useCallback(async () => {
    if (!callActive || !isClientConnected() || hasActiveCapture()) {
      return;
    }

    if (!(await startMicCaptureIfNeeded())) {
      return;
    }

    onListeningStatus();
  }, [callActive, hasActiveCapture, isClientConnected, onListeningStatus, startMicCaptureIfNeeded]);

  const resetSession = useCallback(async () => {
    await stopCall();
    disconnectClient();
    releaseMicrophone();
    greetingSentRef.current = false;
    setConnected(false);
    setMicStatus("Mic: not requested");
  }, [disconnectClient, releaseMicrophone, setMicStatus, stopCall]);

  const handleConnect = useCallback(async () => {
    try {
      debugLog("call", "connect_click");
      await unlockAudioPlayback();
      resetUsage();
      const token = await getIdToken();
      getClient().connect(token, readSessionConfig());
      setConnected(true);
      if (micEnabled) {
        void prepareMicrophone();
      } else {
        setMicStatus('Mic: disabled — enable "Mic On" to speak', "idle");
      }
    } catch (error) {
      setSessionStatus(error instanceof Error ? error.message : "Connect failed", "error");
    }
  }, [
    getClient,
    micEnabled,
    prepareMicrophone,
    readSessionConfig,
    resetUsage,
    setMicStatus,
    setSessionStatus,
  ]);

  const handleDisconnect = useCallback(async () => {
    await resetSession();
  }, [resetSession]);

  const handleSignOutCleanup = useCallback(async () => {
    await resetSession();
  }, [resetSession]);

  const handleMicEnabledChange = useCallback(
    async (nextEnabled: boolean) => {
      setMicEnabled(nextEnabled);
      if (!nextEnabled && hasActiveCapture()) {
        stopCapture();
        debugLog("mic", "capture_stopped_disabled");
      } else if (connected) {
        await prepareMicrophone();
        if (callActive) {
          await startMicCaptureIfNeeded();
        }
      }

      if (isClientConnected()) {
        getClient().updateSession({ micEnabled: nextEnabled });
      }
    },
    [
      callActive,
      connected,
      getClient,
      hasActiveCapture,
      isClientConnected,
      prepareMicrophone,
      setMicEnabled,
      startMicCaptureIfNeeded,
      stopCapture,
    ],
  );

  const handleVoiceEnabledChange = useCallback(
    (enabled: boolean) => {
      setVoiceEnabled(enabled);
      if (isClientConnected()) {
        getClient().updateSession({ voiceEnabled: enabled });
      }
    },
    [getClient, isClientConnected, setVoiceEnabled],
  );

  const handleSendText = useCallback(() => {
    const text = typedMessage.trim();
    if (!text || !isClientConnected()) {
      return;
    }

    getClient().sendTextTurn(text);
    setTypedMessage("");
  }, [getClient, isClientConnected, typedMessage]);

  const startPushToTalk = useCallback(async () => {
    if (!isClientConnected() || !micEnabled || hasActiveCapture() || isRealtimeMode) {
      return;
    }

    if (!(await prepareMicrophone())) {
      return;
    }

    const started = await startCapture((chunk) => {
      getClient().sendAudioChunk(chunk);
    });
    if (started) {
      setPttRecording(true);
      setPttLabel("Recording… release to send");
    }
  }, [
    getClient,
    hasActiveCapture,
    isClientConnected,
    isRealtimeMode,
    micEnabled,
    prepareMicrophone,
    startCapture,
  ]);

  const stopPushToTalk = useCallback(() => {
    if (!hasActiveCapture() || isRealtimeMode) {
      return;
    }

    stopCapture();
    setPttRecording(false);
    setPttLabel("Hold to talk");
    if (isClientConnected()) {
      getClient().sendJson({ type: "user.turn.commit" });
    }
  }, [getClient, hasActiveCapture, isClientConnected, isRealtimeMode, stopCapture]);

  useEffect(() => {
    if (!connected) {
      void stopCall();
    }
  }, [connected, stopCall]);

  useEffect(() => {
    const endSessionOnPageLeave = () => {
      if (!isClientConnected()) {
        return;
      }

      debugLog("client", "page_hide_end_session");
      void stopCallRef.current?.();
      disconnectClient();
    };

    window.addEventListener("pagehide", endSessionOnPageLeave);
    return () => window.removeEventListener("pagehide", endSessionOnPageLeave);
  }, [disconnectClient, isClientConnected]);

  const scheduleAutoStart = useCallback(() => {
    autoStartRef.current = true;
  }, []);

  const onSessionReady = useCallback(() => {
    if (autoStartRef.current) {
      autoStartRef.current = false;
      void startCall();
    }
  }, [startCall]);

  return {
    sessionStatusText,
    sessionStatusTone,
    connected,
    callActive,
    pttRecording,
    pttLabel,
    typedMessage,
    setTypedMessage,
    setSessionStatus,
    handleConnect,
    handleDisconnect,
    handleSignOutCleanup,
    handleMicEnabledChange,
    handleVoiceEnabledChange,
    scheduleAutoStart,
    onSessionReady,
    startCall,
    stopCall,
    startPushToTalk,
    stopPushToTalk,
    handleSendText,
    enableMicAfterAssistantOutput,
  };
};
