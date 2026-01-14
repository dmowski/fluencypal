"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { sendTranscriptRequest } from "@/app/api/transcript/sendTranscriptRequest";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { isAllowedMicrophone, requestMicrophoneAccess } from "@/libs/mic";
import { useAuth } from "../Auth/useAuth";
import { useSettings } from "../Settings/useSettings";

type AudioRecorderContextValue = {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;

  isRecording: boolean;
  isTranscribing: boolean;

  transcription: string | null;
  error: string;

  recordingMilliSeconds: number;

  removeTranscript: () => void;

  Visualizer: ReactNode;
};

const AudioRecorderContext = createContext<AudioRecorderContextValue | null>(null);

export function AudioRecorderProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const settings = useSettings();
  const learnLanguageCode = settings.languageCode || "en";

  const recorderControls = useVoiceVisualizer();

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const isCancel = useRef(false);

  // Keep a stable "seconds" value derived from visualizer ms.
  useEffect(() => {
    const seconds = Math.floor((recorderControls.recordingTime ?? 0) / 1000);
    setRecordingSeconds(seconds);
  }, [recorderControls.recordingTime]);

  const getRecordTranscript = useCallback(
    async (recordedAudioBlob: Blob, format: string) => {
      if (format.includes("ogg")) {
        setTranscriptionError(
          "Sorry, transcription is not available for your audio. Try another browser."
        );
        setIsTranscribing(false);
        recorderControls.clearCanvas();
        return;
      }

      setTranscriptionError(null);

      if (!recordedAudioBlob) {
        setTranscription(null);
        setIsTranscribing(false);
        recorderControls.clearCanvas();
        return;
      }

      setIsTranscribing(true);

      const token = await auth.getToken();
      try {
        const transcriptResponse = await sendTranscriptRequest({
          audioBlob: recordedAudioBlob,
          authKey: token,
          languageCode: learnLanguageCode,
          audioDuration: recordingSeconds || 5,
          format,
        });

        setTranscription(transcriptResponse.transcript);

        if (transcriptResponse.error) {
          setTranscriptionError(transcriptResponse.error);
        }
      } catch {
        setTranscriptionError("Error during transcription");
      } finally {
        recorderControls.clearCanvas();
        setIsTranscribing(false);
      }
    },
    [
      auth,
      learnLanguageCode,
      recorderControls,
      recordingSeconds, // ok: captures latest duration estimate
    ]
  );

  // When blob becomes available, transcribe (unless cancelled).
  useEffect(() => {
    if (!recorderControls.recordedBlob) return;

    if (isCancel.current) {
      // Optional: clear cancel flag so the next recording works
      // isCancel.current = false;
      return;
    }

    const format = recorderControls.recordedBlob.type.toLowerCase();
    void getRecordTranscript(recorderControls.recordedBlob, format);
  }, [recorderControls.recordedBlob, getRecordTranscript, recorderControls]);

  const startRecording = useCallback(async () => {
    const allowed = await isAllowedMicrophone();
    if (!allowed) {
      const granted = await requestMicrophoneAccess();
      if (!granted) {
        alert(
          "Microphone access is denied. Please allow microphone access in your browser settings."
        );
        return;
      }
    }

    isCancel.current = false;
    recorderControls.startRecording();
  }, [recorderControls]);

  const stopRecording = useCallback(async () => {
    const seconds = Math.floor((recorderControls.recordingTime ?? 0) / 1000);
    if (seconds < 1) {
      // too short => cancel
      if (recorderControls.isRecordingInProgress) {
        isCancel.current = true;
        recorderControls.stopRecording();
      }
      return;
    }

    setIsTranscribing(true); // immediate UI feedback
    recorderControls.stopRecording();
  }, [recorderControls]);

  const cancelRecording = useCallback(async () => {
    if (recorderControls.isRecordingInProgress) {
      isCancel.current = true;
      recorderControls.stopRecording();
    }
  }, [recorderControls]);

  const removeTranscript = useCallback(() => {
    if (recorderControls.isRecordingInProgress) {
      isCancel.current = true;
      recorderControls.stopRecording();
    }
    setTranscription(null);
    setIsTranscribing(false);
    setTranscriptionError(null);
  }, [recorderControls]);

  const isRecording = recorderControls.isRecordingInProgress;

  const Visualizer = useMemo(() => {
    if (!recorderControls.isRecordingInProgress) return null;

    return (
      <VoiceVisualizer
        controls={recorderControls}
        height={"40px"}
        isControlPanelShown={false}
        speed={1}
        fullscreen={true}
        barWidth={3}
        gap={1}
        width={"100%"}
      />
    );
  }, [recorderControls]);

  const value: AudioRecorderContextValue = useMemo(
    () => ({
      startRecording,
      stopRecording,
      cancelRecording,

      isRecording,
      isTranscribing,

      transcription,
      error: recorderControls.error?.message || transcriptionError || "",

      recordingMilliSeconds: recordingSeconds * 1000,

      removeTranscript,

      Visualizer,
    }),
    [
      startRecording,
      stopRecording,
      cancelRecording,
      isRecording,
      isTranscribing,
      transcription,
      recorderControls.error?.message,
      transcriptionError,
      recordingSeconds,
      removeTranscript,
      Visualizer,
    ]
  );

  return <AudioRecorderContext.Provider value={value}>{children}</AudioRecorderContext.Provider>;
}

export function useAudioRecorder() {
  const ctx = useContext(AudioRecorderContext);
  if (!ctx) {
    throw new Error("useAudioRecorder must be used within an AudioRecorderProvider");
  }
  return ctx;
}
