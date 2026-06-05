import { useCallback, useRef, useState } from "react";
import { describeMicError, MicrophoneSession, type AudioCapture } from "../../lib/audioCapture.js";
import type { StatusTone } from "./types.js";

export const useMicrophone = (micEnabled: boolean) => {
  const microphoneRef = useRef(new MicrophoneSession());
  const captureRef = useRef<AudioCapture | null>(null);
  const micAccessPendingRef = useRef(false);
  const micAccessPromiseRef = useRef<Promise<boolean> | null>(null);

  const [micStatusText, setMicStatusText] = useState("Mic: not requested");
  const [micStatusTone, setMicStatusTone] = useState<StatusTone>("idle");

  const setMicStatus = useCallback((text: string, tone: StatusTone = "idle") => {
    const label = text.replace(/^Microphone:\s*/i, "Mic: ");
    setMicStatusText(label);
    setMicStatusTone(tone);
  }, []);

  const prepareMicrophone = useCallback(async (): Promise<boolean> => {
    const microphone = microphoneRef.current;
    if (!micEnabled) {
      return false;
    }

    if (microphone.isReady) {
      return true;
    }

    if (micAccessPromiseRef.current) {
      return micAccessPromiseRef.current;
    }

    const accessPromise = (async (): Promise<boolean> => {
      micAccessPendingRef.current = true;
      setMicStatus("Mic: waiting for permission…", "warning");

      try {
        await microphone.requestAccess();
        setMicStatus("Mic: ready", "ok");
        return true;
      } catch (error) {
        setMicStatus(`Mic: ${describeMicError(error)}`, "error");
        return false;
      } finally {
        micAccessPendingRef.current = false;
        micAccessPromiseRef.current = null;
      }
    })();

    micAccessPromiseRef.current = accessPromise;
    return accessPromise;
  }, [micEnabled, setMicStatus]);

  const startCapture = useCallback(
    async (onChunk: (chunk: ArrayBuffer) => void): Promise<boolean> => {
      if (!micEnabled || captureRef.current) {
        return true;
      }

      if (!(await prepareMicrophone())) {
        return false;
      }

      try {
        captureRef.current = await microphoneRef.current.startCapture(onChunk);
        return true;
      } catch (error) {
        setMicStatus(`Mic: ${describeMicError(error)}`, "error");
        return false;
      }
    },
    [micEnabled, prepareMicrophone, setMicStatus],
  );

  const stopCapture = useCallback(() => {
    if (!captureRef.current) {
      return;
    }
    captureRef.current.stop();
    captureRef.current = null;
  }, []);

  const releaseMicrophone = useCallback(() => {
    stopCapture();
    microphoneRef.current.release();
  }, [stopCapture]);

  const hasActiveCapture = useCallback(() => captureRef.current !== null, []);

  return {
    micStatusText,
    micStatusTone,
    setMicStatus,
    prepareMicrophone,
    startCapture,
    stopCapture,
    releaseMicrophone,
    hasActiveCapture,
  };
};
