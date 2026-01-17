"use client";
import { sendTranscriptRequest } from "@/app/api/transcript/sendTranscriptRequest";
import { useIsWebView } from "../Auth/useIsWebView";
import { useAuth } from "../Auth/useAuth";
import { useSettings } from "../Settings/useSettings";
import { useVadRecorder } from "./useVadRecorder";
import { useState } from "react";

export const useVadAudioRecorder = ({
  onTranscription,
}: {
  onTranscription: (transcript: string) => void;
}) => {
  const auth = useAuth();
  const settings = useSettings();
  const learnLanguageCode = settings.languageCode || "en";

  const recorderControls = useVadRecorder({
    onChunk: (blob) => {
      getRecordTranscript(blob, blob.type.toLowerCase());
    },
    silenceMs: 300,
  });

  const { inWebView } = useIsWebView();

  const [isTranscribing, setIsTranscribing] = useState(false);

  const getRecordTranscript = async (recordedAudioBlog: Blob, format: string) => {
    if (format.includes("ogg")) {
      console.log("Skip because vad");
      return;
    }

    if (!recordedAudioBlog) {
      return;
    }

    const token = await auth.getToken();
    try {
      setIsTranscribing(true);
      const transcriptResponse = await sendTranscriptRequest({
        audioBlob: recordedAudioBlog,
        authKey: token,
        languageCode: learnLanguageCode,
        audioDuration: 5,
        format,
      });
      if (transcriptResponse.transcript) {
        onTranscription(transcriptResponse.transcript);
      }
      setIsTranscribing(false);
    } catch (error) {
      console.error("Transcription error:", error);
      setIsTranscribing(false);
    }
  };

  return {
    isAbleToUse: !inWebView,
    isTranscribing,
    speakingLevel: recorderControls.inputLevel01,
    start: recorderControls.start,
    stop: recorderControls.stop,
    isRecording: recorderControls.isRunning,
    isSpeaking: recorderControls.isSpeaking,
  };
};
